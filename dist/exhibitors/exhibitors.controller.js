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
exports.ExhibitorsController = void 0;
const common_1 = require("@nestjs/common");
const exhibitors_service_1 = require("./exhibitors.service");
const find_exhibitors_dto_1 = require("./dto/find-exhibitors.dto");
const swagger_1 = require("@nestjs/swagger");
let ExhibitorsController = class ExhibitorsController {
    constructor(exhibitorsService) {
        this.exhibitorsService = exhibitorsService;
    }
    async findMany(query) {
        return this.exhibitorsService.findMany(query);
    }
    async findById(id) {
        const e = await this.exhibitorsService.findById(id);
        if (!e)
            throw new common_1.NotFoundException();
        const cover = e.assets?.find((a) => a.role === 'cover')?.asset?.url || null;
        const images = e.assets?.filter((a) => a.role !== 'cover').map((a) => a.asset?.url) || [];
        return {
            id: e.id,
            name: e.name,
            title: e.title,
            description: e.description,
            website: e.website,
            coverUrl: cover,
            images,
            location: e.location,
            sponsor: e.sponsor,
            tags: e.tags?.map((t) => t.tag) || [],
            products: e.products?.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                assets: p.assets?.map((ap) => ap.asset?.url) || [],
            })) || [],
            events: e.events?.map((ev) => ({ id: ev.id, title: ev.title, start: ev.start, timezone: ev.timezone })) || [],
        };
    }
};
exports.ExhibitorsController = ExhibitorsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sponsor', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tag', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of exhibitors' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_exhibitors_dto_1.FindExhibitorsDto]),
    __metadata("design:returntype", Promise)
], ExhibitorsController.prototype, "findMany", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exhibitor detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExhibitorsController.prototype, "findById", null);
exports.ExhibitorsController = ExhibitorsController = __decorate([
    (0, swagger_1.ApiTags)('Exhibitors'),
    (0, common_1.Controller)('api/v1/exhibitors'),
    __metadata("design:paramtypes", [exhibitors_service_1.ExhibitorsService])
], ExhibitorsController);
