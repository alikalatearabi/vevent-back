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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("./events.service");
const find_events_dto_1 = require("./dto/find-events.dto");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const register_attendee_dto_1 = require("./dto/register-attendee.dto");
const passport_1 = require("@nestjs/passport");
const optional_jwt_auth_guard_1 = require("../common/guards/optional-jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let EventsController = class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async findMany(q) {
        return this.eventsService.findMany(q);
    }
    async getCurrentEvent() {
        return this.eventsService.getCurrentEvent();
    }
    async getActiveEvent() {
        return this.eventsService.getCurrentEvent();
    }
    async getEventSpeakers(id) {
        return this.eventsService.getEventSpeakers(id);
    }
    async findById(id) {
        const e = await this.eventsService.findById(id);
        if (!e)
            throw new common_1.NotFoundException();
        return e;
    }
    async create(dto, req) {
        const userId = req.user?.sub;
        return this.eventsService.create(dto, userId);
    }
    async update(id, dto, req) {
        return this.eventsService.update(id, dto);
    }
    async patch(id, dto, req) {
        return this.eventsService.update(id, dto);
    }
    async register(id, dto, req) {
        const payload = { name: dto.name, email: dto.email, ticketType: dto.ticketType };
        if (req.user)
            payload.userId = req.user.sub;
        const at = await this.eventsService.register(id, payload);
        try {
            const ev = await this.eventsService.findById(id);
            if (ev?.createdById) {
                await this.eventsService.prisma.notification.create({ data: { userId: ev.createdById, message: `New attendee registered for event ${ev.title}`, data: { attendeeId: at.id, eventId: id } } });
            }
        }
        catch (err) {
            console.warn('notify failed', err);
        }
        return at;
    }
    async listAttendees(id, q) {
        const page = parseInt(q.page || '1');
        const limit = Math.min(parseInt(q.limit || '50'), 200);
        const skip = (page - 1) * limit;
        const [data, total] = await this.eventsService.prisma.$transaction([
            this.eventsService.prisma.attendee.findMany({ where: { eventId: id }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.eventsService.prisma.attendee.count({ where: { eventId: id } }),
        ]);
        return { data, meta: { page, limit, total } };
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List events' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_events_dto_1.FindEventsDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findMany", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current/active event for registration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current event data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No active event found' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getCurrentEvent", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active event (alias for /current)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active event data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No active event found' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getActiveEvent", null);
__decorate([
    (0, common_1.Get)(':id/speakers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all speakers for an event' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of speakers for the event' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getEventSpeakers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Event detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findById", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create event' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update event' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Partially update event' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "patch", null);
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Post)(':id/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register attendee (auth optional)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attendee created or existing' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, register_attendee_dto_1.RegisterAttendeeDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':id/attendees'),
    (0, swagger_1.ApiOperation)({ summary: 'List attendees for event (admin/owner)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of attendees' }),
    (0, swagger_1.ApiOperation)({ summary: 'List attendees for event (admin/owner)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "listAttendees", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, common_1.Controller)('api/v1/events'),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
