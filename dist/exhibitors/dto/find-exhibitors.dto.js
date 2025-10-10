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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindExhibitorsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class FindExhibitorsDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.FindExhibitorsDto = FindExhibitorsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    __metadata("design:type", Number)
], FindExhibitorsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    __metadata("design:type", Number)
], FindExhibitorsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search query for name or title' }),
    __metadata("design:type", String)
], FindExhibitorsDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null)
            return undefined;
        if (typeof value === 'boolean')
            return value;
        const v = String(value).toLowerCase();
        return v === 'true' || v === '1';
    }),
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter sponsors only', type: Boolean }),
    __metadata("design:type", Boolean)
], FindExhibitorsDto.prototype, "sponsor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tag name to filter by' }),
    __metadata("design:type", String)
], FindExhibitorsDto.prototype, "tag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort field, e.g. favoriteCount or name' }),
    __metadata("design:type", String)
], FindExhibitorsDto.prototype, "sort", void 0);
