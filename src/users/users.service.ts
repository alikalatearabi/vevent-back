import { Inject, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async sanitize(user: User) {
    const { passwordHash, ...rest } = user as any;
    return rest as Partial<User>;
  }

  // favorites
  async listFavorites(userId: string) {
    return this.prisma.favorite.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async addFavorite(userId: string, dto: { resourceType: any; resourceId: string }) {
    // ensure resource exists (basic check)
    const exists = await this.checkResourceExists(dto.resourceType, dto.resourceId);
    if (!exists) throw new BadRequestException('Resource not found');
    return this.prisma.favorite.create({ data: { userId, resourceType: dto.resourceType, resourceId: dto.resourceId } });
  }

  async removeFavorite(userId: string, id: string) {
    const fav = await this.prisma.favorite.findUnique({ where: { id } });
    if (!fav) throw new BadRequestException('Favorite not found');
    if (fav.userId !== userId) throw new ForbiddenException();
    await this.prisma.favorite.delete({ where: { id } });
    return { ok: true };
  }

  // recent
  async addRecent(userId: string, dto: { resourceType: any; resourceId: string; metadata?: any }) {
    // upsert simple: create entry
    return (this.prisma as any).recent.create({ data: { userId, resourceType: dto.resourceType, resourceId: dto.resourceId, metadata: dto.metadata } });
  }

  // user events calendar
  async getUserEvents(userId: string) {
    // Get events user created
    const createdEvents = await this.prisma.event.findMany({
      where: { 
        createdById: userId,
        deletedAt: null 
      },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        start: true,
        end: true,
        timed: true,
        location: true,
        timezone: true,
        published: true,
        color: true,
        createdAt: true
      },
      orderBy: { start: 'asc' }
    });

    // Get events user is registered for as attendee
    const registeredEvents = await this.prisma.attendee.findMany({
      where: { 
        userId: userId,
        event: {
          deletedAt: null
        }
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            title: true,
            description: true,
            start: true,
            end: true,
            timed: true,
            location: true,
            timezone: true,
            published: true,
            color: true,
            createdAt: true
          }
        }
      },
      orderBy: { 
        event: { start: 'asc' }
      }
    });

    // Combine and format results
    const created = createdEvents.map(event => ({
      ...event,
      userRole: 'creator',
      registrationDate: event.createdAt
    }));

    const registered = registeredEvents.map(({ event, createdAt }) => ({
      ...event,
      userRole: 'attendee',
      registrationDate: createdAt
    }));

    // Merge and remove duplicates (in case user created and also registered)
    const allEvents = [...created, ...registered];
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );

    // Sort by start date
    uniqueEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return {
      data: uniqueEvents,
      meta: {
        total: uniqueEvents.length,
        created: created.length,
        registered: registered.length
      }
    };
  }

  private async checkResourceExists(resourceType: any, resourceId: string) {
    try {
      switch (resourceType) {
        case 'EVENT':
          return !!(await this.prisma.event.findUnique({ where: { id: resourceId } }));
        case 'EXHIBITOR':
          return !!(await this.prisma.exhibitor.findUnique({ where: { id: resourceId } }));
        case 'PRODUCT':
          return !!(await this.prisma.product.findUnique({ where: { id: resourceId } }));
        default:
          return false;
      }
    } catch (err) {
      return false;
    }
  }
}
