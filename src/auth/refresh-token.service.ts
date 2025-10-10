import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomBytes, createHmac } from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  private hash(token: string) {
    const secret = process.env.JWT_REFRESH_SECRET || 'changeme_refresh';
    return createHmac('sha256', secret).update(token).digest('hex');
  }

  generateRawToken() {
    return randomBytes(64).toString('hex');
  }

  async create(userId: string, expiresInSeconds: number) {
    const raw = this.generateRawToken();
    const hash = this.hash(raw);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const db = await this.prisma.refreshToken.create({
      data: { userId, tokenHash: hash, expiresAt },
    });
    return { raw, db };
  }

  async findByRaw(raw: string) {
    const hash = this.hash(raw);
    return this.prisma.refreshToken.findFirst({ where: { tokenHash: hash } });
  }

  async revoke(id: string) {
    return this.prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
  }
}
