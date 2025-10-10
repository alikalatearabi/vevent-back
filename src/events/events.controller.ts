import { Controller, Get, Query, Param, NotFoundException, Post, Body, UseGuards, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { FindEventsDto } from './dto/find-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { RegisterAttendeeDto } from './dto/register-attendee.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List events' })
  async findMany(@Query() q: FindEventsDto) {
    return this.eventsService.findMany(q);
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

  // Public registration endpoint — auth optional
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
