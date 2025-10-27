import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          where: { deletedAt: null },
          take: 10,
          include: {
            assets: {
              include: { asset: true },
              take: 1
            }
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async create(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...data,
        title: data.title || this.generateTitle(data.name)
      }
    });
  }

  async update(id: string, data: CreateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        title: data.title || (data.name ? this.generateTitle(data.name) : undefined)
      }
    });
  }

  async delete(id: string) {
    // Check if category has products
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null }
    });

    if (productsCount > 0) {
      throw new Error(`Cannot delete category with ${productsCount} products. Move products to another category first.`);
    }

    return this.prisma.category.delete({ where: { id } });
  }

  private generateTitle(name: string): string {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}
