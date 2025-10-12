import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AttendeesService } from './attendees.service';
import { ConnectionRequestService } from './connection-request.service';
import { CreateConnectionRequestDto, UpdateConnectionRequestDto } from './dto/connection-request.dto';

@ApiTags('Attendees')
@ApiBearerAuth()
@Controller('api/v1')
export class AttendeesController {
  constructor(
    private readonly attendeesService: AttendeesService,
    private readonly connectionRequestService: ConnectionRequestService
  ) {}

  // Existing checkin endpoint
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Check in an attendee' })
  @ApiResponse({ status: 200, description: 'Checked in' })
  @Patch('attendees/:id/checkin')
  async checkin(@Param('id') id: string, @Req() req: any) {
    return this.attendeesService.checkinAttendee(id);
  }

  // New attendee endpoints  
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all attendees for an event' })
  @Get('events/:eventId/attendees')
  async getEventAttendees(@Param('eventId') eventId: string) {
    return this.attendeesService.getEventAttendees(eventId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get speakers for an event' })
  @Get('events/:eventId/attendees/speakers')
  async getEventSpeakers(@Param('eventId') eventId: string) {
    return this.attendeesService.getEventAttendees(eventId, 'SPEAKER');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get visitors for an event' })
  @Get('events/:eventId/attendees/visitors')
  async getEventVisitors(@Param('eventId') eventId: string) {
    return this.attendeesService.getEventAttendees(eventId, 'VISITOR');
  }

  // Connection request endpoints
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Send a connection request' })
  @Post('connection-requests')
  async createConnectionRequest(@Body() dto: CreateConnectionRequestDto, @Req() req: any) {
    return this.connectionRequestService.createConnectionRequest(req.user.sub, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all connection requests for current user' })
  @Get('connection-requests')
  async getConnectionRequests(@Req() req: any, @Query('eventId') eventId?: string) {
    return this.connectionRequestService.getConnectionRequests(req.user.sub, eventId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Accept or reject a connection request' })
  @Put('connection-requests/:requestId')
  async updateConnectionRequest(
    @Param('requestId') requestId: string,
    @Body() dto: UpdateConnectionRequestDto,
    @Req() req: any
  ) {
    return this.connectionRequestService.updateConnectionRequest(requestId, req.user.sub, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Withdraw a connection request' })
  @Delete('connection-requests/:requestId')
  async deleteConnectionRequest(@Param('requestId') requestId: string, @Req() req: any) {
    return this.connectionRequestService.deleteConnectionRequest(requestId, req.user.sub);
  }
}
