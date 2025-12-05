import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

@Injectable()
export class EventsService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}
  // expose prisma for controllers that need raw queries (internal use)
  get db() { return this.prisma as any }

  async findMany(opts: any) {
    const page = opts.page || 1;
    const limit = Math.min(opts.limit || 20, 200);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    // Exclude the main HR Analytics event (it's a container event, not a session)
    where.name = { not: 'hr-analytics-event-2025' };
    
    // Handle published filter - default to true if not specified
    if (opts.published !== undefined) {
      where.published = opts.published;
    } else {
      where.published = true; // Default to true if not specified
    }
    if (opts.exhibitorId) where.exhibitorId = opts.exhibitorId;
    if (opts.q) {
      where.AND = where.AND || [];
      where.AND.push({ OR: [ { name: { contains: opts.q, mode: 'insensitive' } }, { title: { contains: opts.q, mode: 'insensitive' } }, { description: { contains: opts.q, mode: 'insensitive' } } ] });
    }
    if (opts.tag) {
      where.AND = where.AND || [];
      where.AND.push({ tags: { some: { tag: { name: { equals: opts.tag } } } } });
    }

    if (opts.from) {
      const from = DateTime.fromISO(opts.from, { zone: 'utc' }).toJSDate();
      where.start = { gte: from };
    }
    if (opts.to) {
      const to = DateTime.fromISO(opts.to, { zone: 'utc' }).toJSDate();
      where.end = { lte: to };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          title: true,
          color: true,
          start: true,
          end: true,
          timezone: true,
          location: true,
          exhibitorId: true,
          timed: true,
        },
        orderBy: { start: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async findById(id: string) {
    const e = await this.prisma.event.findUnique({
      where: { id },
      include: {
        speakers: { include: { user: { select: { id: true, firstname: true, lastname: true, email: true } } } },
        exhibitor: { select: { id: true, name: true, assets: { where: { role: 'cover' }, include: { asset: true } } } },
        tags: { include: { tag: true } },
        assets: { include: { asset: true } },
        attendees: { select: { id: true, firstName: true, lastName: true, email: true }, take: 50 },
      },
    });
    return e;
  }

  async getEventSpeakers(eventId: string) {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true,
        name: true,
        start: true,
        location: true
      }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // If this is the main event (hr-analytics-event-2025), get speakers from all session events on the same day
    let eventIdsToQuery = [eventId];
    
    if (event.name === 'hr-analytics-event-2025') {
      // Get all events on the same day and location (session events)
      const sameDayEvents = await this.prisma.event.findMany({
        where: {
          deletedAt: null,
          start: {
            gte: new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()),
            lt: new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate() + 1)
          },
          location: event.location
        },
        select: { id: true }
      });
      
      eventIdsToQuery = sameDayEvents.map(e => e.id);
    }

    // Get all speakers from the event(s)
    const eventSpeakers = await this.prisma.eventSpeaker.findMany({
      where: { 
        eventId: { in: eventIdsToQuery }
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            phone: true,
            company: true,
            jobTitle: true
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            title: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    // Remove duplicates (same speaker in multiple sessions) and keep unique by user ID
    const uniqueSpeakers = new Map();
    eventSpeakers.forEach(es => {
      if (!uniqueSpeakers.has(es.user.id)) {
        uniqueSpeakers.set(es.user.id, es);
      }
    });

    return {
      data: Array.from(uniqueSpeakers.values()).map(es => ({
        id: es.user.id,
        firstName: es.user.firstname,
        lastName: es.user.lastname,
        email: es.user.email,
        phone: es.user.phone,
        company: es.user.company,
        jobTitle: es.user.jobTitle,
        role: es.role || 'SPEAKER',
        order: es.order || 0
      }))
    };
  }

  async create(data: any, userId?: string) {
    // validate
    if (new Date(data.start) >= new Date(data.end)) throw new BadRequestException('start must be before end');
    const tags = data.tags || [];
    const speakers = data.speakers || [];

    return this.prisma.$transaction(async (tx) => {
      const createData: any = {
        name: data.name,
        title: data.title,
        description: data.description,
        color: data.color,
        start: new Date(data.start),
        end: new Date(data.end),
        timezone: data.timezone,
        timed: data.timed ?? true,
        location: data.location,
        published: data.published ?? false,
        price: data.price ? parseFloat(data.price.toString()) : undefined,
        currency: data.currency || 'IRR',
      };
      if (data.exhibitorId) createData.exhibitor = { connect: { id: data.exhibitorId } };
      if (userId) createData.createdBy = { connect: { id: userId } };

      const ev = await tx.event.create({ data: createData });

      for (const t of tags) {
        const tag = await tx.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
        await tx.tagOnEvent.create({ data: { tagId: tag.id, eventId: ev.id } });
      }

      for (const s of speakers) {
        await tx.eventSpeaker.create({ data: { eventId: ev.id, userId: s } });
      }

      return ev;
    });
  }

  async update(id: string, data: any) {
    if (data.start && data.end && new Date(data.start) >= new Date(data.end)) throw new BadRequestException('start must be before end');
    const tags = data.tags;
    const speakers = data.speakers;
    const { tags: _t, speakers: _s, ...updateFields } = data;
    
    // Handle price and currency conversion
    if (data.price !== undefined) {
      updateFields.price = parseFloat(data.price.toString());
    }
    if (data.currency !== undefined) {
      updateFields.currency = data.currency;
    }
    
    return this.prisma.$transaction(async (tx) => {
      const up = await tx.event.update({ where: { id }, data: updateFields });
      if (tags) {
        await tx.tagOnEvent.deleteMany({ where: { eventId: id } });
        for (const t of tags) {
          const tag = await tx.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
          await tx.tagOnEvent.create({ data: { tagId: tag.id, eventId: id } });
        }
      }
      if (speakers) {
        await tx.eventSpeaker.deleteMany({ where: { eventId: id } });
        for (const s of speakers) {
          await tx.eventSpeaker.create({ data: { eventId: id, userId: s } });
        }
      }
      return up;
    });
  }

  async softDelete(id: string) {
    return this.prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async register(id: string, payload: any) {
    // payload: { userId? name? email? ticketType? }
    const userId = payload.userId;
    const email = payload.email;
    const name = payload.name;

    return this.prisma.$transaction(async (tx) => {
      if (userId) {
        // ensure no duplicate
        const exists = await tx.attendee.findFirst({ where: { eventId: id, userId } });
        if (exists) {
          // Check if user is payment-free and auto-create completed payment if needed
          const user = await tx.user.findUnique({ 
            where: { id: userId },
            select: { phone: true, isPaymentFree: true }
          });
          
          // Check owner phone (backward compatibility)
          const ownerPhone = process.env.OWNER_PHONE;
          const isOwner = ownerPhone && user?.phone === ownerPhone;
          const isPaymentFree = isOwner || user?.isPaymentFree === true;
          
          if (isPaymentFree) {
            // Check if payment already exists for owner
            const existingPayment = await tx.payment.findFirst({
              where: { userId, eventId: id }
            });
            
            if (!existingPayment) {
              // Auto-create completed payment for owner
              await tx.payment.create({
                data: {
                  userId,
                  eventId: id,
                  attendeeId: exists.id,
                  amount: 0, // Free for owner
                  currency: 'IRR',
                  status: 'COMPLETED',
                  gateway: 'payment-free-bypass',
                  refId: 'PAYMENT-FREE-' + Date.now(),
                  paidAt: new Date(),
                  metadata: { paymentFreeBypass: true }
                }
              });
            }
          }
          
          return exists;
        }
        
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');
        const firstName = user.firstname;
        const lastName = user.lastname;
        const at = await tx.attendee.create({ 
          data: { 
            event: { connect: { id } }, 
            user: { connect: { id: userId } }, 
            firstName, 
            lastName,
            email: user.email,
            company: user.company,
            jobTitle: user.jobTitle,
            phone: user.phone
          } 
        });
        
        // Check if user is payment-free and auto-create completed payment
        // Check owner phone (backward compatibility)
        const ownerPhone = process.env.OWNER_PHONE;
        const isOwner = ownerPhone && user.phone === ownerPhone;
        const isPaymentFree = isOwner || user.isPaymentFree === true;
        
        if (isPaymentFree) {
          // Auto-create completed payment for payment-free user
          await tx.payment.create({
            data: {
              userId,
              eventId: id,
              attendeeId: at.id,
              amount: 0, // Free for owner
              currency: 'IRR',
              status: 'COMPLETED',
              gateway: 'payment-free-bypass',
              refId: 'PAYMENT-FREE-' + Date.now(),
              paidAt: new Date(),
              metadata: { paymentFreeBypass: true }
            }
          });
        }
        
        return at;
      }

      // anonymous via email
      if (!email) throw new BadRequestException('Email required for anonymous registration');
      const exists = await tx.attendee.findFirst({ where: { eventId: id, email } });
      if (exists) return exists;
      // Split name into firstName and lastName for anonymous registration
      const nameParts = (name || 'Anonymous User').split(' ');
      const firstName = nameParts[0] || 'Anonymous';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      const at = await tx.attendee.create({ 
        data: { 
          event: { connect: { id } }, 
          firstName, 
          lastName, 
          email 
        } 
      });
      return at;
    });
  }

  /**
   * Get current/active event for registration page
   * Returns the most recent published event or a specific event ID from env
   */
  async getCurrentEvent() {
    // Try to get event ID from environment variable first
    const specificEventId = process.env.CURRENT_EVENT_ID;
    
    let event;
    if (specificEventId) {
      // Get specific event by ID
      event = await this.prisma.event.findUnique({
        where: { id: specificEventId },
        include: {
          assets: {
            where: { role: 'cover' },
            include: { asset: true },
          },
          tags: {
            include: { tag: true },
          },
          createdBy: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              company: true,
            },
          },
        },
      });
    } else {
      // First try to get main HR Analytics event (the main event representing the whole day)
      event = await this.prisma.event.findFirst({
        where: {
          deletedAt: null,
          published: true,
          name: 'hr-analytics-event-2025',
        },
        include: {
          assets: {
            where: { role: 'cover' },
            include: { asset: true },
          },
          tags: {
            include: { tag: true },
          },
          createdBy: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              company: true,
            },
          },
        },
      });

      // If no main event, try to get opening ceremony event
      if (!event) {
        event = await this.prisma.event.findFirst({
          where: {
            deletedAt: null,
            published: true,
            name: 'opening-ceremony',
          },
          include: {
            assets: {
              where: { role: 'cover' },
              include: { asset: true },
            },
            tags: {
              include: { tag: true },
            },
            createdBy: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                company: true,
              },
            },
          },
        });
      }

      // If still no event, get the earliest published event (first session of the day)
      if (!event) {
        event = await this.prisma.event.findFirst({
          where: {
            deletedAt: null,
            published: true,
          },
          include: {
            assets: {
              where: { role: 'cover' },
              include: { asset: true },
            },
            tags: {
              include: { tag: true },
            },
            createdBy: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                company: true,
              },
            },
          },
          orderBy: {
            start: 'asc',
          },
        });
      }
    }

    if (!event) {
      throw new NotFoundException({
        success: false,
        message: 'رویداد فعالی یافت نشد',
        error: 'NO_ACTIVE_EVENT',
      });
    }

    // Get registration count
    const currentRegistrations = await this.prisma.attendee.count({
      where: { eventId: event.id },
    });

    // Configuration from environment variables
    const defaultPrice = parseFloat(process.env.DEFAULT_EVENT_PRICE || '150000');
    const currency = process.env.PAYMENT_CURRENCY || 'IRR';
    const capacity = parseInt(process.env.DEFAULT_EVENT_CAPACITY || '1000');
    
    // Default features
    const defaultFeatures = [
      'دسترسی به تمام سخنرانی‌ها',
      'شرکت در کارگاه‌های تخصصی',
      'دسترسی به غرفه‌های نمایشگاه',
      'فرصت‌های شبکه‌سازی',
      'دریافت گواهی شرکت',
    ];
    const features = process.env.EVENT_FEATURES 
      ? JSON.parse(process.env.EVENT_FEATURES)
      : defaultFeatures;

    // Get image URL from assets
    const coverAsset = event.assets?.find(a => a.role === 'cover');
    const imageUrl = coverAsset?.asset?.url || null;

    // Get organizer name
    const organizer = event.createdBy
      ? `${event.createdBy.firstname} ${event.createdBy.lastname}`.trim()
      : null;

    // Get category from tags (use first tag as category)
    const category = event.tags?.length > 0 ? event.tags[0].tag.name : null;

    // Calculate registration status
    const now = new Date();
    const registrationStart = process.env.REGISTRATION_START_DATE 
      ? new Date(process.env.REGISTRATION_START_DATE)
      : new Date(event.createdAt); // Default to event creation date
    
    const registrationEnd = process.env.REGISTRATION_END_DATE 
      ? new Date(process.env.REGISTRATION_END_DATE)
      : new Date(event.start.getTime() - 24 * 60 * 60 * 1000); // Default to 1 day before event start
    
    const registrationOpen = now >= registrationStart && now <= registrationEnd;

    // Check if event is active (not started yet or currently ongoing)
    const isActive = now <= event.end;

    // Format response
    return {
      success: true,
      data: {
        id: event.id,
        name: event.name,
        title: event.title,
        description: event.description || null,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        location: event.location || null,
        timezone: event.timezone || 'Asia/Tehran',
        price: event.price ? parseFloat(event.price.toString()) : defaultPrice,
        currency: event.currency || currency,
        features: features,
        published: event.published,
        isActive: isActive,
        registrationOpen: registrationOpen,
        registrationStart: registrationStart.toISOString(),
        registrationEnd: registrationEnd.toISOString(),
        capacity: capacity,
        currentRegistrations: currentRegistrations,
        imageUrl: imageUrl,
        organizer: organizer,
        category: category,
        tags: event.tags?.map(t => t.tag.name) || [],
      },
    };
  }
}
