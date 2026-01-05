import { Controller, Post, Body, Req, UnauthorizedException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any, @Req() req: Request) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ip = req.ip || 'unknown';
    return this.authService.login(user, ip);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async getSession(@Req() req: any) {
    return {
      result: true,
      memberId: req.user.userId,
      name: req.user.username,
      // roles, serverAccess 등 추가 가능
    };
  }
}
