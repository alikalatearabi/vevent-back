import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenService } from './refresh-token.service';
import { OtpCacheService } from './services/otp-cache.service';
import { SmsService } from './services/sms.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    PrismaModule,
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenService, OtpCacheService, SmsService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
