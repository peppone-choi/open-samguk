import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { JwtService } from "./jwt.service.js";
import { PasswordService } from "./password.service.js";
import { SessionService } from "./session.service.js";
import { GameSessionService } from "./game-session.service.js";
import { KakaoProvider } from "./providers/kakao.provider.js";

@Module({
  providers: [
    AuthService,
    JwtService,
    PasswordService,
    SessionService,
    GameSessionService,
    KakaoProvider,
  ],
  exports: [AuthService, JwtService, SessionService, GameSessionService],
})
export class AuthModule {}
