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
const argon2 = require("argon2");
const asset_service_1 = require("../common/services/asset.service");
const payment_bypass_service_1 = require("../auth/services/payment-bypass.service");
let UsersService = class UsersService {
    constructor(prisma, assetService, paymentBypassService) {
        this.prisma = prisma;
        this.assetService = assetService;
        this.paymentBypassService = paymentBypassService;
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                phone: true,
                company: true,
                jobTitle: true,
                role: true,
                avatarAssetId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                avatarAsset: {
                    select: {
                        id: true,
                        url: true,
                        type: true,
                    },
                },
                attendees: {
                    select: {
                        id: true,
                        eventId: true,
                        role: true,
                        showPhone: true,
                        showEmail: true,
                        showCompany: true,
                    },
                },
            },
        });
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
    async getUserStatusFlags(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                firstname: true,
                lastname: true,
                email: true,
                company: true,
                jobTitle: true,
                phone: true,
                isPaymentFree: true,
            },
        });
        if (!user) {
            return {
                isProfileComplete: false,
                isEventRegistered: false,
                isPaymentComplete: false,
            };
        }
        const isProfileComplete = !!(user.firstname &&
            user.firstname.trim().length > 0 &&
            user.lastname &&
            user.lastname.trim().length > 0 &&
            user.email &&
            user.email.trim().length > 0 &&
            !user.email.includes('@vevent.temp'));
        const eventRegistrations = await this.prisma.attendee.count({
            where: { userId },
        });
        const isEventRegistered = eventRegistrations > 0;
        const ownerPhone = process.env.OWNER_PHONE;
        const isOwner = ownerPhone && user.phone === ownerPhone;
        const isPaymentFree = isOwner || user.isPaymentFree === true;
        let isPaymentComplete = false;
        if (isPaymentFree) {
            isPaymentComplete = true;
        }
        else {
            const completedPayments = await this.prisma.payment.count({
                where: {
                    userId,
                    status: 'COMPLETED',
                },
            });
            isPaymentComplete = completedPayments > 0;
        }
        return {
            isProfileComplete,
            isEventRegistered,
            isPaymentComplete,
        };
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
    async completeProfile(userId, data) {
        if (!data.toc) {
            throw new common_1.BadRequestException({
                success: false,
                message: 'شما باید قوانین و مقررات را بپذیرید',
                error: 'TOC_NOT_ACCEPTED',
            });
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, passwordHash: true },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                success: false,
                message: 'کاربر یافت نشد',
                error: 'USER_NOT_FOUND',
            });
        }
        const existingEmail = await this.prisma.user.findFirst({
            where: {
                email: data.email,
                id: { not: userId },
            },
        });
        if (existingEmail) {
            throw new common_1.ConflictException({
                success: false,
                message: 'این ایمیل قبلاً استفاده شده است',
                error: 'EMAIL_ALREADY_EXISTS',
            });
        }
        let passwordHash;
        if (!user.passwordHash) {
            if (!data.password || data.password.trim().length < 6) {
                throw new common_1.BadRequestException({
                    success: false,
                    message: 'رمز عبور الزامی است و باید حداقل 6 کاراکتر باشد',
                    error: 'PASSWORD_REQUIRED',
                });
            }
            passwordHash = await argon2.hash(data.password.trim());
        }
        else if (data.password) {
            if (data.password.trim().length < 6) {
                throw new common_1.BadRequestException({
                    success: false,
                    message: 'رمز عبور باید حداقل 6 کاراکتر باشد',
                    error: 'PASSWORD_TOO_SHORT',
                });
            }
            passwordHash = await argon2.hash(data.password.trim());
        }
        const company = data.company?.trim() || null;
        const jobTitle = data.jobTitle?.trim() || null;
        const updateData = {
            firstname: data.firstName.trim(),
            lastname: data.lastName.trim(),
            email: data.email.trim(),
            company,
            jobTitle,
        };
        if (passwordHash) {
            updateData.passwordHash = passwordHash;
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                phone: true,
                company: true,
                jobTitle: true,
                role: true,
                avatarAssetId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const statusFlags = await this.getUserStatusFlags(userId);
        return {
            success: true,
            message: 'اطلاعات پروفایل با موفقیت به‌روزرسانی شد',
            data: {
                ...updatedUser,
                ...statusFlags,
            },
        };
    }
    async uploadAvatar(userId, file) {
        try {
            this.assetService.validateImageFile(file);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { avatarAssetId: true },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                success: false,
                message: 'کاربر یافت نشد',
                error: 'USER_NOT_FOUND',
            });
        }
        const asset = await this.assetService.createAsset(file, `users/${userId}/avatar`, userId, { userId });
        if (user.avatarAssetId) {
            try {
                await this.assetService.deleteAsset(user.avatarAssetId);
            }
            catch (error) {
                console.error('Error deleting old avatar:', error);
            }
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { avatarAssetId: asset.id },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                phone: true,
                avatarAssetId: true,
                avatarAsset: {
                    select: {
                        id: true,
                        url: true,
                        type: true,
                    },
                },
            },
        });
        return {
            success: true,
            message: 'آواتار با موفقیت آپلود شد',
            data: {
                avatarAssetId: updatedUser.avatarAssetId,
                avatarUrl: updatedUser.avatarAsset?.url || null,
            },
        };
    }
    async setPaymentFreeStatus(userId, isPaymentFree) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, phone: true, email: true, firstname: true, lastname: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.paymentBypassService.setPaymentFree(userId, isPaymentFree);
        return {
            success: true,
            message: `Payment-free status ${isPaymentFree ? 'enabled' : 'disabled'} for user`,
            user: {
                id: user.id,
                phone: user.phone,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                isPaymentFree,
            },
        };
    }
    async getAllPaymentFreeUsers() {
        return this.paymentBypassService.getAllPaymentFreeUsers();
    }
    async setPaymentFreeStatusByPhone(phone, isPaymentFree) {
        const user = await this.prisma.user.findFirst({
            where: { phone },
            select: { id: true, phone: true, email: true, firstname: true, lastname: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.paymentBypassService.setPaymentFreeByPhone(phone, isPaymentFree);
        return {
            success: true,
            message: `Payment-free status ${isPaymentFree ? 'enabled' : 'disabled'} for user`,
            user: {
                id: user.id,
                phone: user.phone,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                isPaymentFree,
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PRISMA')),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => payment_bypass_service_1.PaymentBypassService))),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        asset_service_1.AssetService,
        payment_bypass_service_1.PaymentBypassService])
], UsersService);
