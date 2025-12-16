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
import * as path from 'path';

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

    // Add a cache-busting query param so CDN/proxy doesn't serve stale files
    const version = Date.now();
    const withVersion = (url: string) => `${url}?v=${version}`;

    return {
      catalog: withVersion(this.minioService.getPublicUrl(fileKeys.catalog)),
      schedule1: withVersion(this.minioService.getPublicUrl(fileKeys.schedule1)),
      schedule2: withVersion(this.minioService.getPublicUrl(fileKeys.schedule2)),
    };
  }

  @Get('map')
  @ApiOperation({ summary: 'Get event map URL' })
  @ApiResponse({ status: 200, description: 'Event map URL' })
  async getMapUrl() {
    const mapKey = 'events/Map.jpg';
    
    // Check if map exists in MinIO, if not upload it
    const exists = await this.minioService.fileExists(mapKey);
    
    if (!exists) {
      // Upload the map file from assets folder
      const mapPath = path.join(process.cwd(), 'src', 'assets', 'Map.jpg');
      await this.minioService.uploadFileFromPath(mapPath, 'events', 'Map.jpg', 'image/jpeg');
    }

    // Add a cache-busting query param so CDN/proxy doesn't serve stale files
    const version = Date.now();
    const url = this.minioService.getPublicUrl(mapKey);
    
    return {
      url: `${url}?v=${version}`,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('map/upload')
  @ApiOperation({ summary: 'Upload event map to MinIO' })
  @ApiResponse({ status: 200, description: 'Map uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadMap() {
    const mapKey = 'events/Map.jpg';
    const mapPath = path.join(process.cwd(), 'src', 'assets', 'Map.jpg');
    
    // Upload the map file from assets folder
    const result = await this.minioService.uploadFileFromPath(mapPath, 'events', 'Map.jpg', 'image/jpeg');
    
    // Add a cache-busting query param so CDN/proxy doesn't serve stale files
    const version = Date.now();
    const url = `${result.url}?v=${version}`;
    
    return {
      message: 'Map uploaded successfully',
      url,
      key: result.key,
      size: result.size,
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
  async listAttendees(@Param('id') id: string, @Query() q: any) {
    const page = parseInt(q.page || '1');
    const limit = Math.min(parseInt(q.limit || '50'), 200);
    const skip = (page - 1) * limit;
    const [attendees, total] = await (this.eventsService as any).prisma.$transaction([
      (this.eventsService as any).prisma.attendee.findMany({ 
        where: { 
          eventId: id,
          OR: [
            // Include attendees with no user (anonymous)
            { userId: null },
            // Include attendees where user has completed profile (not default values)
            {
              user: {
                AND: [
                  { firstname: { not: 'کاربر' } },
                  { lastname: { not: 'جدید' } }
                ]
              }
            }
          ]
        }, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
              company: true,
              jobTitle: true,
              avatarAssetId: true,
            }
          }
        }
      }),
      (this.eventsService as any).prisma.attendee.count({ 
        where: { 
          eventId: id,
          OR: [
            { userId: null },
            {
              user: {
                AND: [
                  { firstname: { not: 'کاربر' } },
                  { lastname: { not: 'جدید' } }
                ]
              }
            }
          ]
        } 
      }),
    ]);
    
    // Map attendees to use user's current name if available, otherwise use stored attendee name
    const data = attendees.map((attendee: any) => ({
      ...attendee,
      firstName: attendee.user?.firstname && attendee.user.firstname !== 'کاربر' 
        ? attendee.user.firstname 
        : attendee.firstName,
      lastName: attendee.user?.lastname && attendee.user.lastname !== 'جدید' 
        ? attendee.user.lastname 
        : attendee.lastName,
      email: attendee.user?.email && !attendee.user.email.includes('@vevent.temp')
        ? attendee.user.email
        : attendee.email,
      phone: attendee.user?.phone || attendee.phone,
      company: attendee.user?.company || attendee.company,
      jobTitle: attendee.user?.jobTitle || attendee.jobTitle,
      avatar: attendee.user?.avatarAssetId || attendee.avatar,
    }));
    
    return { data, meta: { page, limit, total } };
  }
}
