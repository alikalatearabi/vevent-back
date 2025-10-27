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
exports.ExhibitorsAdminController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const exhibitors_service_1 = require("./exhibitors.service");
const create_exhibitor_dto_1 = require("./dto/create-exhibitor.dto");
const update_exhibitor_dto_1 = require("./dto/update-exhibitor.dto");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const asset_service_1 = require("../common/services/asset.service");
let ExhibitorsAdminController = class ExhibitorsAdminController {
    constructor(exhibitorsService, assetService) {
        this.exhibitorsService = exhibitorsService;
        this.assetService = assetService;
    }
    async create(dto, req, res) {
        const userId = req.user?.sub;
        const ex = await this.exhibitorsService.create(dto, userId);
        res.status(201);
        return ex;
    }
    async update(id, dto, req) {
        return this.exhibitorsService.update(id, dto);
    }
    async remove(id, req, res) {
        await this.exhibitorsService.softDelete(id);
        res.status(204);
        return;
    }
    async uploadAssets(id, files, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        const userId = req.user?.sub;
        const uploadedAssets = [];
        for (const file of files) {
            this.assetService.validateImageFile(file);
            const asset = await this.assetService.createAsset(file, `exhibitors/${id}`, userId, { exhibitorId: id });
            const link = await this.assetService.linkAssetToExhibitor(asset.id, id, 'gallery');
            uploadedAssets.push({
                id: asset.id,
                url: asset.url,
                role: link.role,
                originalName: file.originalname,
            });
        }
        return {
            message: `${uploadedAssets.length} assets uploaded successfully`,
            assets: uploadedAssets,
        };
    }
};
exports.ExhibitorsAdminController = ExhibitorsAdminController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Create exhibitor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Created' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_exhibitor_dto_1.CreateExhibitorDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ExhibitorsAdminController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Update exhibitor' }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_exhibitor_dto_1.UpdateExhibitorDto, Object]),
    __metadata("design:returntype", Promise)
], ExhibitorsAdminController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete exhibitor' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ExhibitorsAdminController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload exhibitor assets' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.Post)(':id/assets'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ExhibitorsAdminController.prototype, "uploadAssets", null);
exports.ExhibitorsAdminController = ExhibitorsAdminController = __decorate([
    (0, swagger_1.ApiTags)('Exhibitors'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/exhibitors'),
    __metadata("design:paramtypes", [exhibitors_service_1.ExhibitorsService,
        asset_service_1.AssetService])
], ExhibitorsAdminController);
