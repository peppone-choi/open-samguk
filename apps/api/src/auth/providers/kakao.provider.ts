import { Injectable } from "@nestjs/common";

/**
 * Kakao OAuth Provider
 *
 * Implements Kakao REST API integration for:
 * - OAuth token exchange
 * - User info retrieval
 * - "Talk to Me" messaging (for OTP)
 *
 * Can be toggled on/off via environment variable.
 * Designed to be extensible for other OAuth providers.
 */

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  refreshTokenExpiresIn?: number;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  isEmailVerified: boolean;
  isEmailValid: boolean;
}

export interface OAuthProvider {
  readonly name: string;
  readonly isEnabled: boolean;

  exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResponse>;
  refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse>;
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
  sendMessage?(accessToken: string, message: string): Promise<boolean>;
  unlinkUser?(accessToken: string): Promise<boolean>;
}

@Injectable()
export class KakaoProvider implements OAuthProvider {
  readonly name = "KAKAO";

  private readonly oauthHost = "https://kauth.kakao.com";
  private readonly apiHost = "https://kapi.kakao.com";

  private readonly clientId: string;
  private readonly enabled: boolean;

  constructor() {
    this.clientId = process.env.KAKAO_REST_KEY || "";
    this.enabled = process.env.KAKAO_ENABLED === "true" && !!this.clientId;
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
    if (!this.isEnabled) {
      throw new Error("Kakao OAuth is not enabled");
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.clientId,
      redirect_uri: redirectUri,
      code,
    });

    const response = await fetch(`${this.oauthHost}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Kakao token exchange failed: ${JSON.stringify(error)}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      refresh_token_expires_in?: number;
    };
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      refreshTokenExpiresIn: data.refresh_token_expires_in,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    if (!this.isEnabled) {
      throw new Error("Kakao OAuth is not enabled");
    }

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.clientId,
      refresh_token: refreshToken,
    });

    const response = await fetch(`${this.oauthHost}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh Kakao access token");
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      refresh_token_expires_in?: number;
    };
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      refreshTokenExpiresIn: data.refresh_token_expires_in,
    };
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    if (!this.isEnabled) {
      throw new Error("Kakao OAuth is not enabled");
    }

    const response = await fetch(`${this.apiHost}/v2/user/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to get Kakao user info");
    }

    const data = (await response.json()) as {
      id: number;
      kakao_account?: {
        email?: string;
        is_email_verified?: boolean;
        is_email_valid?: boolean;
      };
    };
    const kakaoAccount = data.kakao_account || {};

    return {
      id: String(data.id),
      email: kakaoAccount.email || "",
      isEmailVerified: kakaoAccount.is_email_verified || false,
      isEmailValid: kakaoAccount.is_email_valid || false,
    };
  }

  /**
   * Send message via KakaoTalk "Talk to Me" API
   * Used for OTP verification
   */
  async sendMessage(accessToken: string, message: string): Promise<boolean> {
    if (!this.isEnabled) {
      throw new Error("Kakao OAuth is not enabled");
    }

    const templateObject = {
      object_type: "text",
      text: message,
      link: {
        web_url: process.env.APP_URL || "https://sam.hided.net",
        mobile_web_url: process.env.APP_URL || "https://sam.hided.net",
      },
    };

    const params = new URLSearchParams({
      template_object: JSON.stringify(templateObject),
    });

    const response = await fetch(`${this.apiHost}/v2/api/talk/memo/default/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    return response.ok;
  }

  /**
   * Unlink user from Kakao OAuth
   */
  async unlinkUser(accessToken: string): Promise<boolean> {
    if (!this.isEnabled) {
      throw new Error("Kakao OAuth is not enabled");
    }

    const response = await fetch(`${this.apiHost}/v1/user/unlink`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.ok;
  }
}
