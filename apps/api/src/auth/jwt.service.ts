import { Injectable } from "@nestjs/common";
import * as jose from "jose";
import { randomBytes, createHash } from "crypto";

export interface AccessTokenPayload {
  sub: number; // memberId
  username: string;
  name: string;
  grade: number;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: number; // memberId
  jti: string; // token id for revocation
  type: "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class JwtService {
  private readonly secret: Uint8Array;
  private readonly accessTokenTTL = 15 * 60; // 15 minutes
  private readonly refreshTokenTTL = 7 * 24 * 60 * 60; // 7 days

  constructor() {
    const secretKey = process.env.JWT_SECRET || "development-secret-key-change-in-production";
    this.secret = new TextEncoder().encode(secretKey);
  }

  async generateTokenPair(
    memberId: number,
    username: string,
    name: string,
    grade: number
  ): Promise<TokenPair> {
    const now = new Date();
    const accessTokenExpiresAt = new Date(now.getTime() + this.accessTokenTTL * 1000);
    const refreshTokenExpiresAt = new Date(now.getTime() + this.refreshTokenTTL * 1000);
    const jti = randomBytes(16).toString("hex");

    const accessToken = await new jose.SignJWT({
      sub: memberId,
      username,
      name,
      grade,
      type: "access",
    } as unknown as jose.JWTPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(accessTokenExpiresAt)
      .sign(this.secret);

    const refreshToken = await new jose.SignJWT({
      sub: memberId,
      jti,
      type: "refresh",
    } as unknown as jose.JWTPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(refreshTokenExpiresAt)
      .sign(this.secret);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
    try {
      const { payload } = await jose.jwtVerify(token, this.secret);
      if (payload.type !== "access") {
        return null;
      }
      return {
        sub: payload.sub as unknown as number,
        username: payload.username as string,
        name: payload.name as string,
        grade: payload.grade as number,
        type: "access",
      };
    } catch {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      const { payload } = await jose.jwtVerify(token, this.secret);
      if (payload.type !== "refresh") {
        return null;
      }
      return {
        sub: payload.sub as unknown as number,
        jti: payload.jti as string,
        type: "refresh",
      };
    } catch {
      return null;
    }
  }

  /**
   * Hash refresh token for storage (store hash, not plaintext)
   */
  hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  get refreshTokenTTLSeconds(): number {
    return this.refreshTokenTTL;
  }
}
