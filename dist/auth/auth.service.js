"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const refresh_token_service_1 = require("./refresh-token.service");
let AuthService = class AuthService {
    constructor(jwtService, prisma, refreshTokenService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.refreshTokenService = refreshTokenService;
    }
    getAccessExpiresSeconds() {
        const s = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
        if (s.endsWith('m'))
            return parseInt(s) * 60;
        if (s.endsWith('h'))
            return parseInt(s) * 3600;
        if (s.endsWith('d'))
            return parseInt(s) * 86400;
        return parseInt(s);
    }
    getRefreshExpiresSeconds() {
        const s = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
        if (s.endsWith('m'))
            return parseInt(s) * 60;
        if (s.endsWith('h'))
            return parseInt(s) * 3600;
        if (s.endsWith('d'))
            return parseInt(s) * 86400;
        return parseInt(s);
    }
    async register(dto, res) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already in use');
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
    async login(dto, res) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await argon2.verify(user.passwordHash, dto.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const accessToken = await this.createAccessToken(user.id);
        const { raw, db } = await this.refreshTokenService.create(user.id, this.getRefreshExpiresSeconds());
        res.cookie('refreshToken', raw, this.cookieOptions(this.getRefreshExpiresSeconds()));
        return { user: await this.prisma.user.findUnique({ where: { id: user.id } }), accessToken };
    }
    async refresh(raw, res) {
        if (!raw)
            throw new common_1.UnauthorizedException('No refresh token provided');
        const token = await this.refreshTokenService.findByRaw(raw);
        if (!token || token.revoked || token.expiresAt < new Date())
            throw new common_1.UnauthorizedException('Invalid refresh token');
        await this.refreshTokenService.revoke(token.id);
        const { raw: newRaw } = await this.refreshTokenService.create(token.userId, this.getRefreshExpiresSeconds());
        const accessToken = await this.createAccessToken(token.userId);
        res.cookie('refreshToken', newRaw, this.cookieOptions(this.getRefreshExpiresSeconds()));
        return { accessToken };
    }
    async logout(raw, res) {
        if (raw) {
            const token = await this.refreshTokenService.findByRaw(raw);
            if (token)
                await this.refreshTokenService.revoke(token.id);
        }
        res.clearCookie('refreshToken', { path: '/' });
        return { message: 'Logged out successfully' };
    }
    async createAccessToken(userId) {
        const payload = { sub: userId };
        return this.jwtService.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET || 'changeme', expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });
    }
    cookieOptions(maxAgeSeconds) {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            domain: process.env.COOKIE_DOMAIN || undefined,
            path: '/',
            maxAge: maxAgeSeconds * 1000,
        };
    }
    async validateUserFromJwt(payload) {
        return this.prisma.user.findUnique({ where: { id: payload.sub } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        client_1.PrismaClient,
        refresh_token_service_1.RefreshTokenService])
], AuthService);
