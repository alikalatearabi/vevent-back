import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.tag.findMany({
      include: {
        _count: {
          select: { 
            products: true,
            events: true,
            exhibitors: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return this.prisma.tag.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: {
                assets: {
                  include: { asset: true },
                  take: 1
                }
              }
            }
          },
          take: 10
        },
        _count: {
          select: { 
            products: true,
            events: true,
            exhibitors: true
          }
        }
      }
    });
  }

  async create(data: CreateTagDto) {
    return this.prisma.tag.create({
      data: {
        ...data,
        title: data.title || this.generateTitle(data.name)
      }
    });
  }

  async update(id: string, data: CreateTagDto) {
    return this.prisma.tag.update({
      where: { id },
      data: {
        ...data,
        title: data.title || (data.name ? this.generateTitle(data.name) : undefined)
      }
    });
  }

  async delete(id: string) {
    // This will cascade delete all tag relations
    return this.prisma.tag.delete({ where: { id } });
  }

  private generateTitle(name: string): string {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}
