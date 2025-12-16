import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ExhibitorsService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  async findMany(opts: any) {
    const page = opts.page || 1;
    const limit = Math.min(opts.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (opts.sponsor !== undefined) where.sponsor = opts.sponsor;
    if (opts.q) {
      where.AND = [
        {
          OR: [
            { name: { contains: opts.q, mode: 'insensitive' } },
            { title: { contains: opts.q, mode: 'insensitive' } },
          ],
        },
      ];
    }
    if (opts.tag) {
      where.AND = where.AND || [];
      where.AND.push({ tags: { some: { tag: { name: { equals: opts.tag } } } } });
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.exhibitor.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          title: true,
          description: true,
          location: true,
          sponsor: true,
          website: true,
          favoriteCount: true,
          assets: {
            where: {
              OR: [
                { role: 'cover' },
                { role: 'logo' },
              ],
            },
            select: {
              role: true,
              asset: { select: { url: true } },
            },
          },
          tags: { select: { tag: true } },
        },
        orderBy: opts.sort ? { [opts.sort]: 'desc' } : { favoriteCount: 'desc' },
      }),
      this.prisma.exhibitor.count({ where }),
    ]);

    const formatted = data.map((e: any) => {
      const coverAsset = e.assets?.find((a: any) => a.role === 'cover');
      const logoAsset = e.assets?.find((a: any) => a.role === 'logo');
      
      return {
      id: e.id,
      name: e.name,
      title: e.title,
      description: e.description,
      location: e.location,
      sponsor: e.sponsor,
      website: e.website,
      favoriteCount: e.favoriteCount,
        coverUrl: coverAsset?.asset?.url || null,
        logoUrl: logoAsset?.asset?.url || null,
      tags: e.tags?.map((t: any) => t.tag) || [],
      };
    });

    return { data: formatted, meta: { page, limit, total } };
  }

  async findById(id: string) {
    const exhibitor = await this.prisma.exhibitor.findUnique({
      where: { id },
      include: {
        assets: { include: { asset: true } },
        tags: { include: { tag: true } },
        products: { include: { assets: { include: { asset: true } } } },
        events: { where: { deletedAt: null, published: true }, take: 10, orderBy: { start: 'asc' } },
      },
    });
    return exhibitor;
  }

  async create(data: any, userId?: string) {
    const tags = data.tags || [];
    return this.prisma.$transaction(async (tx) => {
      const createData: any = {
        name: data.name,
        title: data.title,
        description: data.description,
        website: data.website,
        location: data.location,
        sponsor: data.sponsor || false,
      };
      if (userId) createData.createdBy = { connect: { id: userId } };

      const exhibitor = await tx.exhibitor.create({ data: createData });

      for (const t of tags) {
        const tag = await tx.tag.upsert({
          where: { name: t },
          update: {},
          create: { name: t },
        });
        await tx.tagOnExhibitor.create({ data: { tagId: tag.id, exhibitorId: exhibitor.id } });
      }

      return exhibitor;
    });
  }

  async update(id: string, data: any) {
    const tags = data.tags;
    // prepare update payload without tags
    const { tags: _t, ...updateFields } = data;
    return this.prisma.$transaction(async (tx) => {
      const up = await tx.exhibitor.update({ where: { id }, data: updateFields });
      if (tags) {
        // remove old links
        await tx.tagOnExhibitor.deleteMany({ where: { exhibitorId: id } });
        for (const t of tags) {
          const tag = await tx.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
          await tx.tagOnExhibitor.create({ data: { tagId: tag.id, exhibitorId: id } });
        }
      }
      return up;
    });
  }

  async softDelete(id: string) {
    return this.prisma.exhibitor.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async linkAsset(exhibitorId: string, assetId: string, role?: string) {
    return this.prisma.assetOnExhibitor.create({
      data: { exhibitorId, assetId, role },
      include: { asset: true },
    });
  }
}
