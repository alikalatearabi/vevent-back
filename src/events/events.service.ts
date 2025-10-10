import { Inject, Injectable, BadRequestException } from '@nestjs/common';
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

    const where: any = { deletedAt: null, published: true };
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
        attendees: { select: { id: true, name: true, email: true }, take: 50 },
      },
    });
    return e;
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
        if (exists) return exists;
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');
        const attendeeName = name || `${user.firstname} ${user.lastname}`;
        const at = await tx.attendee.create({ data: { event: { connect: { id } }, user: { connect: { id: userId } }, name: attendeeName, email: user.email } });
        return at;
      }

      // anonymous via email
      if (!email) throw new BadRequestException('Email required for anonymous registration');
      const exists = await tx.attendee.findFirst({ where: { eventId: id, email } });
      if (exists) return exists;
      const at = await tx.attendee.create({ data: { event: { connect: { id } }, name, email } });
      return at;
    });
  }
}
