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
exports.ExhibitorsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ExhibitorsService = class ExhibitorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(opts) {
        const page = opts.page || 1;
        const limit = Math.min(opts.limit || 20, 100);
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (opts.sponsor !== undefined)
            where.sponsor = opts.sponsor;
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
                    assets: { where: { role: 'cover' }, select: { asset: { select: { url: true } } } },
                    tags: { select: { tag: true } },
                },
                orderBy: opts.sort ? { [opts.sort]: 'desc' } : { favoriteCount: 'desc' },
            }),
            this.prisma.exhibitor.count({ where }),
        ]);
        const formatted = data.map((e) => ({
            id: e.id,
            name: e.name,
            title: e.title,
            description: e.description,
            location: e.location,
            sponsor: e.sponsor,
            website: e.website,
            favoriteCount: e.favoriteCount,
            coverUrl: e.assets?.[0]?.asset?.url || null,
            tags: e.tags?.map((t) => t.tag) || [],
        }));
        return { data: formatted, meta: { page, limit, total } };
    }
    async findById(id) {
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
    async create(data, userId) {
        const tags = data.tags || [];
        return this.prisma.$transaction(async (tx) => {
            const createData = {
                name: data.name,
                title: data.title,
                description: data.description,
                website: data.website,
                location: data.location,
                sponsor: data.sponsor || false,
            };
            if (userId)
                createData.createdBy = { connect: { id: userId } };
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
    async update(id, data) {
        const tags = data.tags;
        const { tags: _t, ...updateFields } = data;
        return this.prisma.$transaction(async (tx) => {
            const up = await tx.exhibitor.update({ where: { id }, data: updateFields });
            if (tags) {
                await tx.tagOnExhibitor.deleteMany({ where: { exhibitorId: id } });
                for (const t of tags) {
                    const tag = await tx.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
                    await tx.tagOnExhibitor.create({ data: { tagId: tag.id, exhibitorId: id } });
                }
            }
            return up;
        });
    }
    async softDelete(id) {
        return this.prisma.exhibitor.update({ where: { id }, data: { deletedAt: new Date() } });
    }
    async linkAsset(exhibitorId, assetId, role) {
        return this.prisma.assetOnExhibitor.create({
            data: { exhibitorId, assetId, role },
            include: { asset: true },
        });
    }
};
exports.ExhibitorsService = ExhibitorsService;
exports.ExhibitorsService = ExhibitorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], ExhibitorsService);
