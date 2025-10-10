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
exports.RefreshTokenService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let RefreshTokenService = class RefreshTokenService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    hash(token) {
        const secret = process.env.JWT_REFRESH_SECRET || 'changeme_refresh';
        return (0, crypto_1.createHmac)('sha256', secret).update(token).digest('hex');
    }
    generateRawToken() {
        return (0, crypto_1.randomBytes)(64).toString('hex');
    }
    async create(userId, expiresInSeconds) {
        const raw = this.generateRawToken();
        const hash = this.hash(raw);
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
        const db = await this.prisma.refreshToken.create({
            data: { userId, tokenHash: hash, expiresAt },
        });
        return { raw, db };
    }
    async findByRaw(raw) {
        const hash = this.hash(raw);
        return this.prisma.refreshToken.findFirst({ where: { tokenHash: hash } });
    }
    async revoke(id) {
        return this.prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
    }
};
exports.RefreshTokenService = RefreshTokenService;
exports.RefreshTokenService = RefreshTokenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], RefreshTokenService);
