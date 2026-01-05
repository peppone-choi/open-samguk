import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity, LoginTokenEntity, MemberLogEntity } from '@sammo-ts/infra';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(LoginTokenEntity)
    private loginTokenRepository: Repository<LoginTokenEntity>,
    @InjectRepository(MemberLogEntity)
    private memberLogRepository: Repository<MemberLogEntity>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.memberRepository.findOne({ where: { username } });
    if (user && user.password_hash && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, salt, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, ip: string) {
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    
    // Generate refresh token
    const refreshToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Save refresh token
    const loginToken = new LoginTokenEntity();
    loginToken.member_id = user.id;
    loginToken.base_token = hashedRefreshToken;
    loginToken.reg_ip = ip;
    loginToken.expire_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.loginTokenRepository.save(loginToken);

    // Log login
    const log = new MemberLogEntity();
    log.member_id = user.id;
    log.action_type = 'login';
    log.action = `Login from ${ip}`;
    await this.memberLogRepository.save(log);

    return {
      result: true,
      memberId: user.id,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
    };
  }

  async register(username: string, email: string, pass: string) {
    const existingUser = await this.memberRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(pass, salt);

    const user = new MemberEntity();
    user.username = username;
    user.email = email;
    user.password_hash = password_hash;
    user.salt = salt;
    user.meta = {};
    
    const savedUser = await this.memberRepository.save(user);

    // Log registration
    const log = new MemberLogEntity();
    log.member_id = savedUser.id;
    log.action_type = 'reg';
    log.action = `Registered with username ${username}`;
    await this.memberLogRepository.save(log);

    return { result: true, memberId: savedUser.id };
  }
}
