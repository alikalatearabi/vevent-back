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
exports.AttendeesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
let AttendeesController = class AttendeesController {
    async checkin(id, req) {
        const prisma = req.app.get('PRISMA');
        const attendee = await prisma.attendee.findUnique({ where: { id } });
        if (!attendee)
            throw new common_1.NotFoundException();
        await prisma.attendee.update({ where: { id }, data: { checkedIn: true } });
        return { ok: true };
    }
};
exports.AttendeesController = AttendeesController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Check in an attendee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checked in' }),
    (0, common_1.Patch)(':id/checkin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "checkin", null);
exports.AttendeesController = AttendeesController = __decorate([
    (0, swagger_1.ApiTags)('Attendees'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/attendees')
], AttendeesController);
