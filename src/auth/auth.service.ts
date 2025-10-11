import { Inject, Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('PRISMA') private readonly prisma: PrismaClient,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  private getAccessExpiresSeconds() {
    const s = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    // simple parser: m -> minutes, h -> hours, d -> days
    if (s.endsWith('m')) return parseInt(s) * 60;
    if (s.endsWith('h')) return parseInt(s) * 3600;
    if (s.endsWith('d')) return parseInt(s) * 86400;
    return parseInt(s);
  }

  private getRefreshExpiresSeconds() {
    const s = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    if (s.endsWith('m')) return parseInt(s) * 60;
    if (s.endsWith('h')) return parseInt(s) * 3600;
    if (s.endsWith('d')) return parseInt(s) * 86400;
    return parseInt(s);
  }

  async register(dto: any, res: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already in use');
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: dto.email,
        passwordHash,
      },
    });

    const accessToken = await this.createAccessToken(user.id);
    const { raw, db } = await this.refreshTokenService.create(user.id, this.getRefreshExpiresSeconds());

    res.cookie('refreshToken', raw, this.cookieOptions(this.getRefreshExpiresSeconds()));

    return { user: await this.prisma.user.findUnique({ where: { id: user.id } }), accessToken };
  }

  async login(dto: any, res: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.createAccessToken(user.id);
    const { raw, db } = await this.refreshTokenService.create(user.id, this.getRefreshExpiresSeconds());
    res.cookie('refreshToken', raw, this.cookieOptions(this.getRefreshExpiresSeconds()));

    return { user: await this.prisma.user.findUnique({ where: { id: user.id } }), accessToken };
  }

  async refresh(raw: string, res: any) {
    const token = await this.refreshTokenService.findByRaw(raw);
    if (!token || token.revoked || token.expiresAt < new Date()) throw new UnauthorizedException('Invalid refresh');

    // rotate
    await this.refreshTokenService.revoke(token.id);
    const { raw: newRaw } = await this.refreshTokenService.create(token.userId, this.getRefreshExpiresSeconds());
    const accessToken = await this.createAccessToken(token.userId);

    res.cookie('refreshToken', newRaw, this.cookieOptions(this.getRefreshExpiresSeconds()));

    return { accessToken };
  }

  async logout(raw: string, res: any) {
    const token = await this.refreshTokenService.findByRaw(raw);
    if (token) await this.refreshTokenService.revoke(token.id);
    res.clearCookie('refreshToken', { path: '/' });
    return { ok: true };
  }

  async createAccessToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET || 'changeme', expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });
  }

  cookieOptions(maxAgeSeconds: number) {
    // Get the environment or default configuration
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      httpOnly: true,
      // In production or if explicitly set, cookies should be secure (HTTPS only)
      // For local development, we allow non-secure cookies for localhost testing
      secure: isProduction ? true : (process.env.COOKIE_SECURE === 'true'),
      // For cross-origin requests, SameSite must be 'none' which requires secure=true
      // In local development, we'll use a more permissive setting
      sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax'),
      // Only set domain if specified in env, otherwise browser will use current domain
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
      path: '/',
      maxAge: maxAgeSeconds * 1000,
    };
  }

  async validateUserFromJwt(payload: any) {
    return this.prisma.user.findUnique({ where: { id: payload.sub } });
  }
}
