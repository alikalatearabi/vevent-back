import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  async findMany(opts: any) {
    const page = opts.page || 1;
    const limit = Math.min(opts.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (opts.exhibitorId) where.exhibitorId = opts.exhibitorId;
    if (opts.q) where.AND = [{ OR: [{ name: { contains: opts.q, mode: 'insensitive' } }, { description: { contains: opts.q, mode: 'insensitive' } }] }];

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, skip, take: limit, include: { assets: { include: { asset: true } } } }),
      this.prisma.product.count({ where }),
    ]);

    const formatted = data.map((p: any) => ({ id: p.id, name: p.name, description: p.description, price: p.price, assets: p.assets?.map((a: any) => a.asset?.url) }));
    return { data: formatted, meta: { page, limit, total } };
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({ where: { id }, include: { assets: { include: { asset: true } }, exhibitor: true } });
  }

  async create(data: any, userId?: string) {
    if (!data.exhibitorId) throw new BadRequestException('exhibitorId required');
    const assets = data.assets || [];
    return this.prisma.$transaction(async (tx) => {
      const createData: any = {
        name: data.name,
        description: data.description,
        price: data.price ? data.price : undefined,
        metadata: data.metadata,
        exhibitor: { connect: { id: data.exhibitorId } },
      };
      const product = await tx.product.create({ data: createData });
      for (const a of assets) {
        await tx.assetOnProduct.create({ data: { assetId: a, productId: product.id } });
      }
      return product;
    });
  }

  async update(id: string, data: any) {
    const assets = data.assets;
    const { assets: _a, ...updateFields } = data;
    return this.prisma.$transaction(async (tx) => {
      const up = await tx.product.update({ where: { id }, data: updateFields });
      if (assets) {
        await tx.assetOnProduct.deleteMany({ where: { productId: id } });
        for (const a of assets) await tx.assetOnProduct.create({ data: { assetId: a, productId: id } });
      }
      return up;
    });
  }

  async softDelete(id: string) {
    return this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
