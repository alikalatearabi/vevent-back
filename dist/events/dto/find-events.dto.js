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
exports.FindEventsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class FindEventsDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.FindEventsDto = FindEventsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    __metadata("design:type", Number)
], FindEventsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    __metadata("design:type", Number)
], FindEventsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search query for name/title/description' }),
    __metadata("design:type", String)
], FindEventsDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'ISO date string filter - start from (inclusive) UTC' }),
    __metadata("design:type", String)
], FindEventsDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'ISO date string filter - end to (inclusive) UTC' }),
    __metadata("design:type", String)
], FindEventsDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by tag name' }),
    __metadata("design:type", String)
], FindEventsDto.prototype, "tag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by exhibitor id' }),
    __metadata("design:type", String)
], FindEventsDto.prototype, "exhibitorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'If true, return only upcoming events' }),
    __metadata("design:type", String)
], FindEventsDto.prototype, "upcoming", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timezone string (IANA) - optional' }),
    __metadata("design:type", String)
], FindEventsDto.prototype, "tz", void 0);
