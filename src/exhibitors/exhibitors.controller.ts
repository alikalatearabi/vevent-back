import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ExhibitorsService } from './exhibitors.service';
import { FindExhibitorsDto } from './dto/find-exhibitors.dto';
import { ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { MinioService } from '../common/services/minio.service';

@ApiTags('Exhibitors')
@Controller('api/v1/exhibitors')
export class ExhibitorsController {
  constructor(
    private readonly exhibitorsService: ExhibitorsService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'sponsor', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiResponse({ status: 200, description: 'List of exhibitors' })
  async findMany(@Query() query: FindExhibitorsDto) {
    return this.exhibitorsService.findMany(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Exhibitor detail' })
  async findById(@Param('id') id: string) {
    const e = await this.exhibitorsService.findById(id);
    if (!e) throw new NotFoundException();
    
    const normalizeUrl = (url: string | null) => url ? this.minioService.normalizeAssetUrl(url) : null;
    
    const cover = normalizeUrl(e.assets?.find((a: any) => a.role === 'cover')?.asset?.url || null);
    const logo = normalizeUrl(e.assets?.find((a: any) => a.role === 'logo')?.asset?.url || null);
    const images = e.assets?.filter((a: any) => a.role !== 'cover' && a.role !== 'logo').map((a: any) => this.minioService.normalizeAssetUrl(a.asset?.url)).filter(Boolean);

    return {
      id: e.id,
      name: e.name,
      title: e.title,
      description: e.description,
      website: e.website,
      coverUrl: cover,
      logoUrl: logo,
      images,
      location: e.location,
      sponsor: e.sponsor,
      tags: e.tags?.map((t: any) => t.tag) || [],
      products: e.products?.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        assets: p.assets?.map((ap: any) => this.minioService.normalizeAssetUrl(ap.asset?.url)).filter(Boolean),
      })) || [],
      events: e.events?.map((ev: any) => ({ id: ev.id, title: ev.title, start: ev.start, timezone: ev.timezone })) || [],
    };
  }
}
