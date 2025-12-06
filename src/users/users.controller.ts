import { Controller, Get, Req, UseGuards, Post, Body, Delete, Param, Put, BadRequestException, NotFoundException, UseInterceptors, UploadedFile, Patch, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CreateRecentDto } from './dto/create-recent.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@ApiTags('Users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user (requires Bearer token)' })
  @ApiResponse({ status: 200, description: 'Current authenticated user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const statusFlags = await this.usersService.getUserStatusFlags(req.user.sub);
    const { attendees = [], ...userData } = user as any;
    const attendeePrivacy = attendees.map((attendee: any) => ({
      attendeeId: attendee.id,
      eventId: attendee.eventId,
      role: attendee.role,
      privacy: {
        showPhone: attendee.showPhone,
        showEmail: attendee.showEmail,
        showCompany: attendee.showCompany,
      },
    }));

    return {
      ...userData,
      attendeePrivacy,
      ...statusFlags,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me/favorites')
  @ApiOperation({ summary: 'List user favorites' })
  async listFavorites(@Req() req: any) {
    return this.usersService.listFavorites(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('me/favorites')
  @ApiOperation({ summary: 'Add favorite' })
  async addFavorite(@Req() req: any, @Body() dto: CreateFavoriteDto) {
    return this.usersService.addFavorite(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('me/favorites/:id')
  @ApiOperation({ summary: 'Remove favorite' })
  async removeFavorite(@Req() req: any, @Param('id') id: string) {
    return this.usersService.removeFavorite(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('me/recent')
  @ApiOperation({ summary: 'Add recent item' })
  async addRecent(@Req() req: any, @Body() dto: CreateRecentDto) {
    return this.usersService.addRecent(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me/events')
  @ApiOperation({ summary: 'Get user calendar - events user created or registered for' })
  @ApiResponse({ status: 200, description: 'User events calendar' })
  async getUserEvents(@Req() req: any) {
    return this.usersService.getUserEvents(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Put('me/profile')
  @ApiOperation({ summary: 'Complete user profile' })
  @ApiResponse({ status: 200, description: 'Profile completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or TOC not accepted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async completeProfile(@Req() req: any, @Body() dto: CompleteProfileDto) {
    return this.usersService.completeProfile(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('me/complete-profile')
  @ApiOperation({ summary: 'Complete user profile (alternative endpoint)' })
  @ApiResponse({ status: 200, description: 'Profile completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or TOC not accepted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async completeProfilePost(@Req() req: any, @Body() dto: CompleteProfileDto) {
    return this.usersService.completeProfile(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload user avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No file uploaded or invalid file type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.usersService.uploadAvatar(req.user.sub, file);
  }

  // Admin endpoints for managing payment-free users
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('admin/payment-free')
  @ApiOperation({ summary: 'Get all payment-free users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of payment-free users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllPaymentFreeUsers(@Req() req: any) {
    // TODO: Add admin role check
    return this.usersService.getAllPaymentFreeUsers();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('admin/users/:userId/payment-free')
  @ApiOperation({ summary: 'Set payment-free status for a user (admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isPaymentFree: { type: 'boolean' },
      },
      required: ['isPaymentFree'],
    },
  })
  @ApiResponse({ status: 200, description: 'Payment-free status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async setPaymentFreeStatus(
    @Param('userId') userId: string,
    @Body() dto: { isPaymentFree: boolean },
    @Req() req: any,
  ) {
    // TODO: Add admin role check
    return this.usersService.setPaymentFreeStatus(userId, dto.isPaymentFree);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('admin/users/by-phone/:phone/payment-free')
  @ApiOperation({ summary: 'Set payment-free status for a user by phone (admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isPaymentFree: { type: 'boolean' },
      },
      required: ['isPaymentFree'],
    },
  })
  @ApiResponse({ status: 200, description: 'Payment-free status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async setPaymentFreeStatusByPhone(
    @Param('phone') phone: string,
    @Body() dto: { isPaymentFree: boolean },
    @Req() req: any,
  ) {
    // TODO: Add admin role check
    return this.usersService.setPaymentFreeStatusByPhone(phone, dto.isPaymentFree);
  }

  @Get('admin/registration-statistics')
  @ApiOperation({ summary: 'Get user registration and payment statistics (CSV format)' })
  @ApiQuery({ name: 'eventId', required: false, description: 'Optional event ID to filter statistics by specific event' })
  @ApiResponse({ status: 200, description: 'Registration statistics in CSV format' })
  async getRegistrationStatistics(
    @Query('eventId') eventId?: string,
    @Res() res: Response,
  ) {
    const statistics = await this.usersService.getRegistrationStatistics(eventId);
    const csv = this.convertStatisticsToCsv(statistics);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="registration-statistics-${Date.now()}.csv"`);
    res.send(csv);
  }

  /**
   * Convert statistics data to CSV format
   */
  private convertStatisticsToCsv(statistics: any): string {
    const escapeCsvField = (field: any): string => {
      if (field === null || field === undefined) {
        return '';
      }
      const str = String(field);
      // If field contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines: string[] = [];
    
    // Header row
    lines.push('Category,ID,Phone,Firstname,Lastname,Email,CreatedAt,PaymentCount,AttendeeCount,HasPayment');
    
    // Helper to add user rows
    const addUserRows = (users: any[], category: string) => {
      for (const user of users) {
        const row = [
          category,
          escapeCsvField(user.id),
          escapeCsvField(user.phone),
          escapeCsvField(user.firstname),
          escapeCsvField(user.lastname),
          escapeCsvField(user.email),
          escapeCsvField(user.createdAt ? new Date(user.createdAt).toISOString() : ''),
          escapeCsvField(user.paymentCount || ''),
          escapeCsvField(user.attendeeCount || ''),
          escapeCsvField(user.hasPayment !== undefined ? user.hasPayment : ''),
        ];
        lines.push(row.join(','));
      }
    };
    
    // Add users from each category
    addUserRows(statistics.statistics.passedOtpNotRegistered.users, 'Passed OTP - Not Registered');
    addUserRows(statistics.statistics.registered.users, 'Registered - Not Paid');
    addUserRows(statistics.statistics.registeredAndPaid.users, 'Registered and Paid');
    
    return lines.join('\n');
  }
}
