import { Controller, Post, Body, UseGuards, Patch, Param, Delete, UploadedFiles, UseInterceptors, Req, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExhibitorsService } from './exhibitors.service';
import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { UpdateExhibitorDto } from './dto/update-exhibitor.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { AssetService } from '../common/services/asset.service';
import type { Multer } from 'multer';

@ApiTags('Exhibitors')
@ApiBearerAuth()
@Controller('api/v1/exhibitors')
export class ExhibitorsAdminController {
  constructor(
    private readonly exhibitorsService: ExhibitorsService,
    private readonly assetService: AssetService,
  ) {}

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
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadAssets(@Param('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>, @Req() req: any) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const userId = req.user?.sub;
    const uploadedAssets = [];

    for (const file of files) {
      // Validate image file
      this.assetService.validateImageFile(file);

      // Upload to MinIO and create asset record
      const asset = await this.assetService.createAsset(
        file,
        `exhibitors/${id}`,
        userId,
        { exhibitorId: id },
      );

      // Link asset to exhibitor
      const link = await this.assetService.linkAssetToExhibitor(
        asset.id,
        id,
        'gallery', // Default role
      );

      uploadedAssets.push({
        id: asset.id,
        url: asset.url,
        role: link.role,
        originalName: file.originalname,
      });
    }

    return {
      message: `${uploadedAssets.length} assets uploaded successfully`,
      assets: uploadedAssets,
    };
  }
}
