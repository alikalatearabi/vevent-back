import { Controller, Get, Req, UseGuards, Post, Body, Delete, Param, Put, BadRequestException, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
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
    return { ...user, ...statusFlags };
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
}
