import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { MinioService } from '../common/services/minio.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRISMA') private readonly prisma: PrismaClient,
    private readonly minioService: MinioService,
  ) {}

  async findMany(opts: FindProductsDto) {
    const { page = 1, limit = 20, q, exhibitorId, categoryId, inStock, featured, tags, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = opts;
    const skip = (page - 1) * Math.min(limit, 100);

    // Build where clause
    const where: any = { deletedAt: null };
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    if (exhibitorId) where.exhibitorId = exhibitorId;
    if (categoryId) where.categoryId = categoryId;
    if (typeof inStock === 'boolean') where.inStock = inStock;
    if (typeof featured === 'boolean') where.featured = featured;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Handle tags filter
    if (tags) {
      const tagIds = tags.split(',').map(t => t.trim());
      where.tags = {
        some: {
          tagId: { in: tagIds }
        }
      };
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'featured') {
      orderBy.featured = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Execute queries
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: Math.min(limit, 100),
        orderBy,
        include: {
          exhibitor: {
            select: {
              id: true,
              name: true,
              assets: {
                where: { role: 'cover' },
                include: { asset: true },
                take: 1
              }
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              title: true,
              color: true,
              icon: true
            }
          },
          assets: {
            include: { asset: true },
            orderBy: [
              { role: 'asc' }, // cover first
              { asset: { createdAt: 'asc' } }
            ]
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  title: true,
                  color: true
                }
              }
            }
          }
        }
      }),
      this.prisma.product.count({ where })
    ]);

    // Format response with all required fields
    const formatted = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      title: p.title || this.generateTitle(p.name),
      description: p.description,
      shortDescription: p.shortDescription || this.generateShortDescription(p.description),
      price: p.price ? parseFloat(p.price.toString()) : null,
      imageUrl: this.getPrimaryImageUrl(p.assets) || p.imageUrl,
      exhibitorId: p.exhibitorId,
      categoryId: p.categoryId,
      inStock: p.inStock,
      featured: p.featured,
      assets: p.assets?.map((a: any) => ({
        id: a.asset.id,
        url: this.minioService.normalizeAssetUrl(a.asset.url),
        role: a.role,
        type: a.asset.type
      })) || [],
      tags: p.tags?.map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        title: t.tag.title,
        color: t.tag.color
      })) || [],
      category: p.category ? {
        id: p.category.id,
        name: p.category.name,
        title: p.category.title,
        color: p.category.color,
        icon: p.category.icon
      } : null,
      exhibitor: {
        id: p.exhibitor.id,
        name: p.exhibitor.name,
        coverUrl: p.exhibitor.assets?.[0]?.asset?.url ? this.minioService.normalizeAssetUrl(p.exhibitor.assets[0].asset.url) : null
      },
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return {
      data: formatted,
      meta: { page, limit: Math.min(limit, 100), total }
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        exhibitor: {
          select: {
            id: true,
            name: true,
            description: true,
            website: true,
            assets: {
              include: { asset: true }
            }
          }
        },
        category: true,
        assets: {
          include: { asset: true },
          orderBy: [
            { role: 'asc' },
            { asset: { createdAt: 'asc' } }
          ]
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!product) return null;

    return {
      ...product,
      title: product.title || this.generateTitle(product.name),
      shortDescription: product.shortDescription || this.generateShortDescription(product.description),
      price: product.price ? parseFloat(product.price.toString()) : null,
      imageUrl: this.getPrimaryImageUrl((product as any).assets) || product.imageUrl,
      assets: (product as any).assets?.map((a: any) => ({
        id: a.asset.id,
        url: this.minioService.normalizeAssetUrl(a.asset.url),
        role: a.role,
        type: a.asset.type,
        meta: a.asset.meta
      })) || [],
      tags: (product as any).tags?.map((t: any) => t.tag) || []
    };
  }

  async create(data: CreateProductDto, createdBy?: string) {
    if (!data.exhibitorId) throw new BadRequestException('exhibitorId required');
    
    const { assets, tagIds, ...productData } = data;

    return this.prisma.$transaction(async (tx) => {
      // Create product
      const product = await tx.product.create({
        data: {
          name: productData.name,
          title: productData.title || this.generateTitle(productData.name),
          description: productData.description,
          shortDescription: productData.shortDescription || this.generateShortDescription(productData.description),
          price: productData.price,
          imageUrl: productData.imageUrl,
          inStock: productData.inStock ?? true,
          featured: productData.featured ?? false,
          categoryId: productData.categoryId,
          metadata: productData.metadata,
          exhibitorId: productData.exhibitorId
        }
      });

      // Link existing assets
      if (assets && assets.length > 0) {
        for (const assetId of assets) {
          await tx.assetOnProduct.create({
            data: { assetId, productId: product.id, role: 'gallery' }
          });
        }
      }

      // Link tags
      if (tagIds && tagIds.length > 0) {
        for (const tagId of tagIds) {
          await tx.tagOnProduct.create({
            data: { tagId, productId: product.id }
          });
        }
      }

      return product;
    });
  }

  async update(id: string, data: CreateProductDto) {
    const { assets, tagIds, ...updateFields } = data;

    return this.prisma.$transaction(async (tx) => {
      // Update product
      const product = await tx.product.update({
        where: { id },
        data: {
          name: updateFields.name,
          title: updateFields.title || (updateFields.name ? this.generateTitle(updateFields.name) : undefined),
          description: updateFields.description,
          shortDescription: updateFields.shortDescription || (updateFields.description ? this.generateShortDescription(updateFields.description) : undefined),
          price: updateFields.price,
          imageUrl: updateFields.imageUrl,
          inStock: updateFields.inStock,
          featured: updateFields.featured,
          categoryId: updateFields.categoryId,
          metadata: updateFields.metadata
        }
      });

      // Update assets if provided
      if (assets !== undefined) {
        await tx.assetOnProduct.deleteMany({ where: { productId: id } });
        for (const assetId of assets) {
          await tx.assetOnProduct.create({
            data: { assetId, productId: id, role: 'gallery' }
          });
        }
      }

      // Update tags if provided
      if (tagIds !== undefined) {
        await tx.tagOnProduct.deleteMany({ where: { productId: id } });
        for (const tagId of tagIds) {
          await tx.tagOnProduct.create({
            data: { tagId, productId: id }
          });
        }
      }

      return product;
    });
  }

  async softDelete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // Helper methods
  private generateTitle(name: string): string {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  private generateShortDescription(description?: string): string {
    if (!description) return '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }

  private getPrimaryImageUrl(assets: any[]): string | null {
    if (!assets || assets.length === 0) return null;
    
    // Look for cover image first
    const cover = assets.find(a => a.role === 'cover');
    if (cover) return this.minioService.normalizeAssetUrl(cover.asset.url);
    
    // Fall back to first image
    const firstImage = assets.find(a => a.asset.type === 'image');
    return firstImage ? this.minioService.normalizeAssetUrl(firstImage.asset.url) : null;
  }
}