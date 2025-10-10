import { Controller, Post, Body, UseGuards, Patch, Param, Delete, UploadedFiles, UseInterceptors, Req, Res, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExhibitorsService } from './exhibitors.service';
import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { UpdateExhibitorDto } from './dto/update-exhibitor.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import type { Multer } from 'multer';

@ApiTags('Exhibitors')
@ApiBearerAuth()
@Controller('api/v1/exhibitors')
export class ExhibitorsAdminController {
  constructor(private readonly exhibitorsService: ExhibitorsService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create exhibitor' })
  @ApiResponse({ status: 201, description: 'Created' })
  @Post()
  async create(@Body() dto: CreateExhibitorDto, @Req() req: any, @Res({ passthrough: true }) res: any) {
    // TODO: check role admin or owner
    const userId = req.user?.sub;
    const ex = await this.exhibitorsService.create(dto, userId);
    res.status(201);
    return ex;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update exhibitor' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExhibitorDto, @Req() req: any) {
    // TODO: check role/owner
    return this.exhibitorsService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Soft delete exhibitor' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any, @Res({ passthrough: true }) res: any) {
    // TODO: check role admin or owner
    await this.exhibitorsService.softDelete(id);
    res.status(204);
    return;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Upload exhibitor assets' })
  @ApiConsumes('multipart/form-data')
  @Post(':id/assets')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadAssets(@Param('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>, @Req() req: any) {
    // This minimal implementation expects files uploaded and accessible locally via /uploads (not implemented).
    // In production, upload to S3 and create Asset records.
    if (!files || files.length === 0) return [];
    const created: any[] = [];
    for (const f of files) {
      const url = `/uploads/${f.filename}`; // placeholder
      const asset = await (req.app.get('PRISMA') as any).asset.create({ data: { url } });
      const link = await this.exhibitorsService.linkAsset(id, asset.id, 'gallery');
      created.push({ id: asset.id, url, role: 'gallery' });
    }
    return created;
  }
}
