import { Controller, Get, Query, Param, NotFoundException, Post, Body, UseGuards, Req, Put, Patch } from '@nestjs/common';
import { EventsService } from './events.service';
import { FindEventsDto } from './dto/find-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterAttendeeDto } from './dto/register-attendee.dto';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MinioService } from '../common/services/minio.service';

@ApiTags('Events')
@Controller('api/v1/events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List events' })
  async findMany(@Query() q: FindEventsDto) {
    return this.eventsService.findMany(q);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current/active event for registration' })
  @ApiResponse({ status: 200, description: 'Current event data' })
  @ApiResponse({ status: 404, description: 'No active event found' })
  async getCurrentEvent() {
    return this.eventsService.getCurrentEvent();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active event (alias for /current)' })
  @ApiResponse({ status: 200, description: 'Active event data' })
  @ApiResponse({ status: 404, description: 'No active event found' })
  async getActiveEvent() {
    return this.eventsService.getCurrentEvent();
  }

  @Get('hr-event/files')
  @ApiOperation({ summary: 'Get HR Event file URLs (catalog and schedules)' })
  @ApiResponse({ status: 200, description: 'HR Event file URLs' })
  async getHrEventFiles() {
    // Define the file keys (these should match what was uploaded)
    const fileKeys = {
      catalog: 'hr-event/catalog.pdf',
      schedule1: 'hr-event/schedule-1.jpg',
      schedule2: 'hr-event/schedule-2.jpg',
    };

    return {
      catalog: this.minioService.getPublicUrl(fileKeys.catalog),
      schedule1: this.minioService.getPublicUrl(fileKeys.schedule1),
      schedule2: this.minioService.getPublicUrl(fileKeys.schedule2),
    };
  }

  @Get(':id/speakers')
  @ApiOperation({ summary: 'Get all speakers for an event' })
  @ApiResponse({ status: 200, description: 'List of speakers for the event' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEventSpeakers(@Param('id') id: string) {
    return this.eventsService.getEventSpeakers(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Event detail' })
  async findById(@Param('id') id: string) {
    const e = await this.eventsService.findById(id);
    if (!e) throw new NotFoundException();
    return e;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create event' })
  async create(@Body() dto: CreateEventDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.eventsService.create(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: any) {
    return this.eventsService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Partially update event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async patch(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: any) {
    return this.eventsService.update(id, dto);
  }

  // Public registration endpoint — auth optional
  @UseGuards(OptionalJwtAuthGuard)
  @Post(':id/register')
  @ApiOperation({ summary: 'Register attendee (auth optional)' })
  @ApiResponse({ status: 200, description: 'Attendee created or existing' })
  async register(@Param('id') id: string, @Body() dto: RegisterAttendeeDto, @Req() req: any) {
    const payload: any = { name: dto.name, email: dto.email, ticketType: dto.ticketType };
    if (req.user) payload.userId = req.user.sub;
    // create attendee and notify owner
    const at = await this.eventsService.register(id, payload);
    try {
      // attempt to notify event owner
      const ev = await this.eventsService.findById(id);
      if (ev?.createdById) {
        await (this.eventsService as any).prisma.notification.create({ data: { userId: ev.createdById, message: `New attendee registered for event ${ev.title}`, data: { attendeeId: at.id, eventId: id } } });
      }
    } catch (err) {
      // swallow notification errors
      console.warn('notify failed', err);
    }
    return at;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':id/attendees')
  @ApiOperation({ summary: 'List attendees for event (admin/owner)' })
  @ApiResponse({ status: 200, description: 'List of attendees' })
  @ApiOperation({ summary: 'List attendees for event (admin/owner)' })
  async listAttendees(@Param('id') id: string, @Query() q: any) {
    const page = parseInt(q.page || '1');
    const limit = Math.min(parseInt(q.limit || '50'), 200);
    const skip = (page - 1) * limit;
    const [data, total] = await (this.eventsService as any).prisma.$transaction([
      (this.eventsService as any).prisma.attendee.findMany({ where: { eventId: id }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      (this.eventsService as any).prisma.attendee.count({ where: { eventId: id } }),
    ]);
    return { data, meta: { page, limit, total } };
  }
}
