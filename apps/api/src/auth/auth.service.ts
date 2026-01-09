import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";
import { JwtService, type TokenPair } from "./jwt.service.js";
import { PasswordService } from "./password.service.js";
import { SessionService } from "./session.service.js";
import { KakaoProvider, type OAuthUserInfo } from "./providers/kakao.provider.js";

export interface LoginResult {
  success: boolean;
  error?: string;
  tokens?: TokenPair;
  user?: {
    id: number;
    username: string;
    name: string;
    grade: number;
  };
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  userId?: number;
}

export interface PasswordResetResult {
  success: boolean;
  error?: string;
  otp?: string; // Only returned in development mode
  expiresAt?: Date;
}

// OTP storage (in production, use Redis)
interface OTPEntry {
  otp: string;
  memberId: number;
  expiresAt: Date;
  attempts: number;
}
const otpStorage = new Map<string, OTPEntry>();
const MAX_OTP_ATTEMPTS = 3;
const OTP_VALIDITY_SECONDS = 180; // 3 minutes

@Injectable()
export class AuthService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  constructor(
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly kakaoProvider: KakaoProvider
  ) {}

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<LoginResult> {
    const member = await this.prisma.member.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        grade: true,
        password: true,
        salt: true,
        deleteAfter: true,
      },
    });

    if (!member) {
      return { success: false, error: "Invalid username or password" };
    }

    if (member.deleteAfter && new Date(member.deleteAfter) < new Date()) {
      return { success: false, error: "Account has been deleted" };
    }

    if (!member.password || !member.salt) {
      return { success: false, error: "Password not set - use OAuth login" };
    }

    const isValid = this.passwordService.verifyPassword(password, member.salt, member.password);
    if (!isValid) {
      return { success: false, error: "Invalid username or password" };
    }

    const tokens = await this.jwtService.generateTokenPair(
      member.id,
      member.username,
      member.name,
      member.grade
    );

    // Store refresh token hash in session
    await this.sessionService.createSession(
      member.id,
      this.jwtService.hashRefreshToken(tokens.refreshToken),
      tokens.refreshTokenExpiresAt
    );

    return {
      success: true,
      tokens,
      user: {
        id: member.id,
        username: member.username,
        name: member.name,
        grade: member.grade,
      },
    };
  }

  /**
   * Login with pre-hashed password (legacy client compatibility)
   */
  async loginWithClientHash(username: string, clientHash: string): Promise<LoginResult> {
    const member = await this.prisma.member.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        grade: true,
        password: true,
        salt: true,
        deleteAfter: true,
      },
    });

    if (!member) {
      return { success: false, error: "Invalid username or password" };
    }

    if (member.deleteAfter && new Date(member.deleteAfter) < new Date()) {
      return { success: false, error: "Account has been deleted" };
    }

    if (!member.password || !member.salt) {
      return { success: false, error: "Password not set - use OAuth login" };
    }

    const isValid = this.passwordService.verifyClientHash(clientHash, member.salt, member.password);
    if (!isValid) {
      return { success: false, error: "Invalid username or password" };
    }

    const tokens = await this.jwtService.generateTokenPair(
      member.id,
      member.username,
      member.name,
      member.grade
    );

    await this.sessionService.createSession(
      member.id,
      this.jwtService.hashRefreshToken(tokens.refreshToken),
      tokens.refreshTokenExpiresAt
    );

    return {
      success: true,
      tokens,
      user: {
        id: member.id,
        username: member.username,
        name: member.name,
        grade: member.grade,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<LoginResult> {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return { success: false, error: "Invalid refresh token" };
    }

    const tokenHash = this.jwtService.hashRefreshToken(refreshToken);
    const session = await this.sessionService.getSessionByToken(tokenHash);

    if (!session || session.memberId !== payload.sub) {
      return { success: false, error: "Session not found or invalid" };
    }

    const member = await this.prisma.member.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, name: true, grade: true },
    });

    if (!member) {
      return { success: false, error: "User not found" };
    }

    // Invalidate old session
    await this.sessionService.deleteSession(tokenHash);

    // Generate new token pair
    const tokens = await this.jwtService.generateTokenPair(
      member.id,
      member.username,
      member.name,
      member.grade
    );

    // Store new refresh token
    await this.sessionService.createSession(
      member.id,
      this.jwtService.hashRefreshToken(tokens.refreshToken),
      tokens.refreshTokenExpiresAt
    );

    return {
      success: true,
      tokens,
      user: {
        id: member.id,
        username: member.username,
        name: member.name,
        grade: member.grade,
      },
    };
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.jwtService.hashRefreshToken(refreshToken);
    await this.sessionService.deleteSession(tokenHash);
  }

  /**
   * Logout all sessions for a user
   */
  async logoutAll(memberId: number): Promise<void> {
    await this.sessionService.deleteAllSessions(memberId);
  }

  /**
   * OAuth login/register with Kakao
   */
  async loginWithKakao(
    code: string,
    redirectUri: string
  ): Promise<LoginResult & { isNewUser?: boolean }> {
    if (!this.kakaoProvider.isEnabled) {
      return { success: false, error: "Kakao OAuth is not enabled" };
    }

    try {
      // Exchange code for tokens
      const oauthTokens = await this.kakaoProvider.exchangeCode(code, redirectUri);

      // Get user info
      const userInfo = await this.kakaoProvider.getUserInfo(oauthTokens.accessToken);

      // Find or create user
      const result = await this.findOrCreateOAuthUser(userInfo, oauthTokens.accessToken);

      if (!result.success) {
        return result;
      }

      return {
        ...result,
        isNewUser: result.isNewUser,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "OAuth login failed",
      };
    }
  }

  private async findOrCreateOAuthUser(
    userInfo: OAuthUserInfo,
    _accessToken: string
  ): Promise<LoginResult & { isNewUser?: boolean }> {
    // Try to find existing user by OAuth ID
    let member = await this.prisma.member.findFirst({
      where: { oauthId: BigInt(userInfo.id) },
      select: { id: true, username: true, name: true, grade: true },
    });

    let isNewUser = false;

    if (!member && userInfo.email) {
      // Try to find by email
      member = await this.prisma.member.findUnique({
        where: { email: userInfo.email },
        select: { id: true, username: true, name: true, grade: true },
      });

      // Link OAuth to existing account
      if (member) {
        await this.prisma.member.update({
          where: { id: member.id },
          data: {
            oauthId: BigInt(userInfo.id),
            oauthType: "KAKAO",
          },
        });
      }
    }

    if (!member) {
      // Return info for registration flow
      return {
        success: false,
        error: "NEEDS_REGISTRATION",
        isNewUser: true,
      };
    }

    // Generate tokens
    const tokens = await this.jwtService.generateTokenPair(
      member.id,
      member.username,
      member.name,
      member.grade
    );

    await this.sessionService.createSession(
      member.id,
      this.jwtService.hashRefreshToken(tokens.refreshToken),
      tokens.refreshTokenExpiresAt
    );

    return {
      success: true,
      tokens,
      user: {
        id: member.id,
        username: member.username,
        name: member.name,
        grade: member.grade,
      },
      isNewUser,
    };
  }

  /**
   * Verify access token and return user info
   */
  async verifyToken(accessToken: string) {
    return this.jwtService.verifyAccessToken(accessToken);
  }

  /**
   * Get global salt for client-side password hashing
   */
  getGlobalSalt(): string {
    return this.passwordService.getGlobalSalt();
  }

  /**
   * Register a new user
   */
  async register(
    username: string,
    password: string,
    name: string,
    thirdUse: boolean = false
  ): Promise<RegisterResult> {
    // Check if username already exists
    const existing = await this.prisma.member.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing) {
      return { success: false, error: "Username already exists" };
    }

    // Validate username
    if (username.length < 3 || username.length > 64) {
      return { success: false, error: "Username must be between 3 and 64 characters" };
    }

    // Validate password
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    // Validate name
    if (name.length < 1 || name.length > 64) {
      return { success: false, error: "Name must be between 1 and 64 characters" };
    }

    // Generate salt and hash password
    const salt = this.passwordService.generateSalt();
    const hash = this.passwordService.hashPassword(password, salt);

    // Create user
    const member = await this.prisma.member.create({
      data: {
        username,
        password: hash,
        salt,
        name,
        thirdUse,
        grade: 1,
        oauthType: "NONE",
      },
      select: { id: true },
    });

    return { success: true, userId: member.id };
  }

  /**
   * Register a new user via OAuth (Kakao)
   */
  async registerWithOAuth(
    username: string,
    name: string,
    oauthId: bigint,
    oauthType: "KAKAO",
    thirdUse: boolean = false
  ): Promise<RegisterResult> {
    // Check if username already exists
    const existing = await this.prisma.member.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing) {
      return { success: false, error: "Username already exists" };
    }

    // Check if OAuth ID already registered
    const existingOAuth = await this.prisma.member.findFirst({
      where: { oauthId },
      select: { id: true },
    });

    if (existingOAuth) {
      return { success: false, error: "This OAuth account is already registered" };
    }

    // Validate username
    if (username.length < 3 || username.length > 64) {
      return { success: false, error: "Username must be between 3 and 64 characters" };
    }

    // Validate name
    if (name.length < 1 || name.length > 64) {
      return { success: false, error: "Name must be between 1 and 64 characters" };
    }

    // Create user
    const member = await this.prisma.member.create({
      data: {
        username,
        name,
        oauthId,
        oauthType,
        thirdUse,
        grade: 1,
      },
      select: { id: true },
    });

    return { success: true, userId: member.id };
  }

  /**
   * Request password reset - generates OTP for the user
   */
  async requestPasswordReset(username: string): Promise<PasswordResetResult> {
    // Find user by username
    const member = await this.prisma.member.findUnique({
      where: { username },
      select: { id: true, oauthType: true },
    });

    if (!member) {
      // Don't reveal if user exists - return generic success
      return { success: true };
    }

    // Users registered via OAuth cannot reset password (they don't have one)
    if (member.oauthType && member.oauthType !== "NONE") {
      return {
        success: false,
        error: "OAuth 계정은 비밀번호를 재설정할 수 없습니다. 카카오 로그인을 이용해주세요.",
      };
    }

    // Generate 4-digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + OTP_VALIDITY_SECONDS * 1000);

    // Store OTP (keyed by username for lookup during reset)
    otpStorage.set(username, {
      otp,
      memberId: member.id,
      expiresAt,
      attempts: 0,
    });

    // In production, send OTP via Kakao Talk
    // For now, return OTP in development mode only
    const isDev = process.env.NODE_ENV !== "production";

    return {
      success: true,
      otp: isDev ? otp : undefined,
      expiresAt,
    };
  }

  /**
   * Reset password using OTP
   */
  async resetPassword(
    username: string,
    otp: string,
    newPassword: string
  ): Promise<PasswordResetResult> {
    // Get OTP entry
    const entry = otpStorage.get(username);

    if (!entry) {
      return { success: false, error: "인증 코드가 없거나 만료되었습니다. 다시 요청해주세요." };
    }

    // Check expiry
    if (new Date() > entry.expiresAt) {
      otpStorage.delete(username);
      return { success: false, error: "인증 코드가 만료되었습니다. 다시 요청해주세요." };
    }

    // Check attempts
    if (entry.attempts >= MAX_OTP_ATTEMPTS) {
      otpStorage.delete(username);
      return { success: false, error: "인증 시도 횟수를 초과했습니다. 다시 요청해주세요." };
    }

    // Verify OTP
    if (entry.otp !== otp) {
      entry.attempts++;
      return {
        success: false,
        error: `잘못된 인증 코드입니다. (${MAX_OTP_ATTEMPTS - entry.attempts}회 남음)`,
      };
    }

    // Validate new password
    if (newPassword.length < 6) {
      return { success: false, error: "비밀번호는 최소 6자 이상이어야 합니다." };
    }

    // Generate new salt and hash password
    const salt = this.passwordService.generateSalt();
    const hash = this.passwordService.hashPassword(newPassword, salt);

    // Update password in database
    await this.prisma.member.update({
      where: { id: entry.memberId },
      data: { password: hash, salt },
    });

    // Clear OTP
    otpStorage.delete(username);

    // Invalidate all existing sessions for security
    await this.sessionService.deleteAllSessions(entry.memberId);

    return { success: true };
  }
}
