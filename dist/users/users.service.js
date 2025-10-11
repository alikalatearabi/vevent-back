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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async createUser(data) {
        return this.prisma.user.create({ data });
    }
    async sanitize(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
    async listFavorites(userId) {
        return this.prisma.favorite.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    }
    async addFavorite(userId, dto) {
        const exists = await this.checkResourceExists(dto.resourceType, dto.resourceId);
        if (!exists)
            throw new common_1.BadRequestException('Resource not found');
        return this.prisma.favorite.create({ data: { userId, resourceType: dto.resourceType, resourceId: dto.resourceId } });
    }
    async removeFavorite(userId, id) {
        const fav = await this.prisma.favorite.findUnique({ where: { id } });
        if (!fav)
            throw new common_1.BadRequestException('Favorite not found');
        if (fav.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.favorite.delete({ where: { id } });
        return { ok: true };
    }
    async addRecent(userId, dto) {
        return this.prisma.recent.create({ data: { userId, resourceType: dto.resourceType, resourceId: dto.resourceId, metadata: dto.metadata } });
    }
    async getUserEvents(userId) {
        const createdEvents = await this.prisma.event.findMany({
            where: {
                createdById: userId,
                deletedAt: null
            },
            select: {
                id: true,
                name: true,
                title: true,
                description: true,
                start: true,
                end: true,
                timed: true,
                location: true,
                timezone: true,
                published: true,
                color: true,
                createdAt: true
            },
            orderBy: { start: 'asc' }
        });
        const registeredEvents = await this.prisma.attendee.findMany({
            where: {
                userId: userId,
                event: {
                    deletedAt: null
                }
            },
            include: {
                event: {
                    select: {
                        id: true,
                        name: true,
                        title: true,
                        description: true,
                        start: true,
                        end: true,
                        timed: true,
                        location: true,
                        timezone: true,
                        published: true,
                        color: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                event: { start: 'asc' }
            }
        });
        const created = createdEvents.map(event => ({
            ...event,
            userRole: 'creator',
            registrationDate: event.createdAt
        }));
        const registered = registeredEvents.map(({ event, createdAt }) => ({
            ...event,
            userRole: 'attendee',
            registrationDate: createdAt
        }));
        const allEvents = [...created, ...registered];
        const uniqueEvents = allEvents.filter((event, index, self) => index === self.findIndex(e => e.id === event.id));
        uniqueEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        return {
            data: uniqueEvents,
            meta: {
                total: uniqueEvents.length,
                created: created.length,
                registered: registered.length
            }
        };
    }
    async checkResourceExists(resourceType, resourceId) {
        try {
            switch (resourceType) {
                case 'EVENT':
                    return !!(await this.prisma.event.findUnique({ where: { id: resourceId } }));
                case 'EXHIBITOR':
                    return !!(await this.prisma.exhibitor.findUnique({ where: { id: resourceId } }));
                case 'PRODUCT':
                    return !!(await this.prisma.product.findUnique({ where: { id: resourceId } }));
                default:
                    return false;
            }
        }
        catch (err) {
            return false;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], UsersService);
