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
const attendees_service_1 = require("./attendees.service");
const connection_request_service_1 = require("./connection-request.service");
const connection_request_dto_1 = require("./dto/connection-request.dto");
const update_attendee_privacy_dto_1 = require("./dto/update-attendee-privacy.dto");
let AttendeesController = class AttendeesController {
    constructor(attendeesService, connectionRequestService) {
        this.attendeesService = attendeesService;
        this.connectionRequestService = connectionRequestService;
    }
    async checkin(id, req) {
        return this.attendeesService.checkinAttendee(id);
    }
    async getEventAttendees(eventId, req) {
        return this.attendeesService.getEventAttendees(eventId, req.user.sub);
    }
    async getEventSpeakers(eventId, req) {
        return this.attendeesService.getEventAttendees(eventId, req.user.sub, 'SPEAKER');
    }
    async updateAttendeePrivacy(attendeeId, dto, req) {
        return this.attendeesService.updatePrivacySettings(attendeeId, req.user.sub, dto);
    }
    async getEventVisitors(eventId, req) {
        return this.attendeesService.getEventAttendees(eventId, req.user.sub, 'VISITOR');
    }
    async createConnectionRequest(dto, req) {
        return this.connectionRequestService.createConnectionRequest(req.user.sub, dto);
    }
    async getConnectionRequests(req, eventId) {
        return this.connectionRequestService.getConnectionRequests(req.user.sub, eventId);
    }
    async updateConnectionRequest(requestId, dto, req) {
        return this.connectionRequestService.updateConnectionRequest(requestId, req.user.sub, dto);
    }
    async deleteConnectionRequest(requestId, req) {
        return this.connectionRequestService.deleteConnectionRequest(requestId, req.user.sub);
    }
};
exports.AttendeesController = AttendeesController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Check in an attendee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checked in' }),
    (0, common_1.Patch)('attendees/:id/checkin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "checkin", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Get all attendees for an event' }),
    (0, common_1.Get)('events/:eventId/attendees'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "getEventAttendees", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Get speakers for an event' }),
    (0, common_1.Get)('events/:eventId/attendees/speakers'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "getEventSpeakers", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Update attendee privacy settings' }),
    (0, common_1.Patch)('attendees/:id/privacy'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_attendee_privacy_dto_1.UpdateAttendeePrivacyDto, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "updateAttendeePrivacy", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Get visitors for an event' }),
    (0, common_1.Get)('events/:eventId/attendees/visitors'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "getEventVisitors", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Send a connection request' }),
    (0, common_1.Post)('connection-requests'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [connection_request_dto_1.CreateConnectionRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "createConnectionRequest", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Get all connection requests for current user' }),
    (0, common_1.Get)('connection-requests'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "getConnectionRequests", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Accept or reject a connection request' }),
    (0, common_1.Put)('connection-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, connection_request_dto_1.UpdateConnectionRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "updateConnectionRequest", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw a connection request' }),
    (0, common_1.Delete)('connection-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendeesController.prototype, "deleteConnectionRequest", null);
exports.AttendeesController = AttendeesController = __decorate([
    (0, swagger_1.ApiTags)('Attendees'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [attendees_service_1.AttendeesService,
        connection_request_service_1.ConnectionRequestService])
], AttendeesController);
