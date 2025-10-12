"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const luxon_1 = require("luxon");
let EventsService = class EventsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() { return this.prisma; }
    async findMany(opts) {
        const page = opts.page || 1;
        const limit = Math.min(opts.limit || 20, 200);
        const skip = (page - 1) * limit;
        const where = { deletedAt: null, published: true };
        if (opts.exhibitorId)
            where.exhibitorId = opts.exhibitorId;
        if (opts.q) {
            where.AND = where.AND || [];
            where.AND.push({ OR: [{ name: { contains: opts.q, mode: 'insensitive' } }, { title: { contains: opts.q, mode: 'insensitive' } }, { description: { contains: opts.q, mode: 'insensitive' } }] });
        }
        if (opts.tag) {
            where.AND = where.AND || [];
            where.AND.push({ tags: { some: { tag: { name: { equals: opts.tag } } } } });
        }
        if (opts.from) {
            const from = luxon_1.DateTime.fromISO(opts.from, { zone: 'utc' }).toJSDate();
            where.start = { gte: from };
        }
        if (opts.to) {
            const to = luxon_1.DateTime.fromISO(opts.to, { zone: 'utc' }).toJSDate();
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
    async findById(id) {
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
    async create(data, userId) {
        if (new Date(data.start) >= new Date(data.end))
            throw new common_1.BadRequestException('start must be before end');
        const tags = data.tags || [];
        const speakers = data.speakers || [];
        return this.prisma.$transaction(async (tx) => {
            const createData = {
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
            if (data.exhibitorId)
                createData.exhibitor = { connect: { id: data.exhibitorId } };
            if (userId)
                createData.createdBy = { connect: { id: userId } };
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
    async update(id, data) {
        if (data.start && data.end && new Date(data.start) >= new Date(data.end))
            throw new common_1.BadRequestException('start must be before end');
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
    async softDelete(id) {
        return this.prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
    }
    async register(id, payload) {
        const userId = payload.userId;
        const email = payload.email;
        const name = payload.name;
        return this.prisma.$transaction(async (tx) => {
            if (userId) {
                const exists = await tx.attendee.findFirst({ where: { eventId: id, userId } });
                if (exists)
                    return exists;
                const user = await tx.user.findUnique({ where: { id: userId } });
                if (!user)
                    throw new common_1.BadRequestException('User not found');
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
                return at;
            }
            if (!email)
                throw new common_1.BadRequestException('Email required for anonymous registration');
            const exists = await tx.attendee.findFirst({ where: { eventId: id, email } });
            if (exists)
                return exists;
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], EventsService);
