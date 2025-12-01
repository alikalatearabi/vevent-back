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
        const where = { deletedAt: null };
        if (opts.published !== undefined) {
            where.published = opts.published;
        }
        else {
            where.published = true;
        }
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
    async getEventSpeakers(eventId) {
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
            throw new common_1.NotFoundException('Event not found');
        }
        let eventIdsToQuery = [eventId];
        if (event.name === 'hr-analytics-event-2025') {
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
                price: data.price ? parseFloat(data.price.toString()) : undefined,
                currency: data.currency || 'IRR',
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
                if (exists) {
                    const user = await tx.user.findUnique({
                        where: { id: userId },
                        select: { phone: true, isPaymentFree: true }
                    });
                    const ownerPhone = process.env.OWNER_PHONE;
                    const isOwner = ownerPhone && user?.phone === ownerPhone;
                    const isPaymentFree = isOwner || user?.isPaymentFree === true;
                    if (isPaymentFree) {
                        const existingPayment = await tx.payment.findFirst({
                            where: { userId, eventId: id }
                        });
                        if (!existingPayment) {
                            await tx.payment.create({
                                data: {
                                    userId,
                                    eventId: id,
                                    attendeeId: exists.id,
                                    amount: 0,
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
                const ownerPhone = process.env.OWNER_PHONE;
                const isOwner = ownerPhone && user.phone === ownerPhone;
                const isPaymentFree = isOwner || user.isPaymentFree === true;
                if (isPaymentFree) {
                    await tx.payment.create({
                        data: {
                            userId,
                            eventId: id,
                            attendeeId: at.id,
                            amount: 0,
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
    async getCurrentEvent() {
        const specificEventId = process.env.CURRENT_EVENT_ID;
        let event;
        if (specificEventId) {
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
        }
        else {
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
            throw new common_1.NotFoundException({
                success: false,
                message: 'رویداد فعالی یافت نشد',
                error: 'NO_ACTIVE_EVENT',
            });
        }
        const currentRegistrations = await this.prisma.attendee.count({
            where: { eventId: event.id },
        });
        const defaultPrice = parseFloat(process.env.DEFAULT_EVENT_PRICE || '150000');
        const currency = process.env.PAYMENT_CURRENCY || 'IRR';
        const capacity = parseInt(process.env.DEFAULT_EVENT_CAPACITY || '1000');
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
        const coverAsset = event.assets?.find(a => a.role === 'cover');
        const imageUrl = coverAsset?.asset?.url || null;
        const organizer = event.createdBy
            ? `${event.createdBy.firstname} ${event.createdBy.lastname}`.trim()
            : null;
        const category = event.tags?.length > 0 ? event.tags[0].tag.name : null;
        const now = new Date();
        const registrationStart = process.env.REGISTRATION_START_DATE
            ? new Date(process.env.REGISTRATION_START_DATE)
            : new Date(event.createdAt);
        const registrationEnd = process.env.REGISTRATION_END_DATE
            ? new Date(process.env.REGISTRATION_END_DATE)
            : new Date(event.start.getTime() - 24 * 60 * 60 * 1000);
        const registrationOpen = now >= registrationStart && now <= registrationEnd;
        const isActive = now <= event.end;
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], EventsService);
