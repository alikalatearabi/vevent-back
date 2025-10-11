import { Controller, Get, Req, UseGuards, Post, Body, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CreateRecentDto } from './dto/create-recent.dto';

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
    return this.usersService.sanitize(user);
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
}
