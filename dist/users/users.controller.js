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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const create_favorite_dto_1 = require("./dto/create-favorite.dto");
const create_recent_dto_1 = require("./dto/create-recent.dto");
const complete_profile_dto_1 = require("./dto/complete-profile.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async me(req) {
        const user = await this.usersService.findById(req.user.sub);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const statusFlags = await this.usersService.getUserStatusFlags(req.user.sub);
        const { attendees = [], ...userData } = user;
        const attendeePrivacy = attendees.map((attendee) => ({
            attendeeId: attendee.id,
            eventId: attendee.eventId,
            role: attendee.role,
            privacy: {
                showPhone: attendee.showPhone,
                showEmail: attendee.showEmail,
                showCompany: attendee.showCompany,
            },
        }));
        return {
            ...userData,
            attendeePrivacy,
            ...statusFlags,
        };
    }
    async listFavorites(req) {
        return this.usersService.listFavorites(req.user.sub);
    }
    async addFavorite(req, dto) {
        return this.usersService.addFavorite(req.user.sub, dto);
    }
    async removeFavorite(req, id) {
        return this.usersService.removeFavorite(req.user.sub, id);
    }
    async addRecent(req, dto) {
        return this.usersService.addRecent(req.user.sub, dto);
    }
    async getUserEvents(req) {
        return this.usersService.getUserEvents(req.user.sub);
    }
    async completeProfile(req, dto) {
        return this.usersService.completeProfile(req.user.sub, dto);
    }
    async completeProfilePost(req, dto) {
        return this.usersService.completeProfile(req.user.sub, dto);
    }
    async uploadAvatar(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return this.usersService.uploadAvatar(req.user.sub, file);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user (requires Bearer token)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "me", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Get)('me/favorites'),
    (0, swagger_1.ApiOperation)({ summary: 'List user favorites' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "listFavorites", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Post)('me/favorites'),
    (0, swagger_1.ApiOperation)({ summary: 'Add favorite' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_favorite_dto_1.CreateFavoriteDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addFavorite", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Delete)('me/favorites/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove favorite' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeFavorite", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Post)('me/recent'),
    (0, swagger_1.ApiOperation)({ summary: 'Add recent item' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_recent_dto_1.CreateRecentDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addRecent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Get)('me/events'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user calendar - events user created or registered for' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User events calendar' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserEvents", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Put)('me/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input or TOC not accepted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already exists' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, complete_profile_dto_1.CompleteProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "completeProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Post)('me/complete-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete user profile (alternative endpoint)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input or TOC not accepted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already exists' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, complete_profile_dto_1.CompleteProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "completeProfilePost", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Post)('me/avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload user avatar image' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No file uploaded or invalid file type' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('api/v1/users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
