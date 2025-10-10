import { PrismaClient } from '@prisma/client';
export declare class ExhibitorsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findMany(opts: any): Promise<{
        data: {
            id: any;
            name: any;
            title: any;
            description: any;
            location: any;
            sponsor: any;
            website: any;
            favoriteCount: any;
            coverUrl: any;
            tags: any;
        }[];
        meta: {
            page: any;
            limit: number;
            total: number;
        };
    }>;
    findById(id: string): Promise<{
        products: ({
            assets: ({
                asset: {
                    id: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    createdBy: string | null;
                    url: string;
                    type: string | null;
                    meta: import("@prisma/client/runtime/library").JsonValue | null;
                };
            } & {
                id: string;
                assetId: string;
                role: string | null;
                productId: string;
            })[];
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            exhibitorId: string;
            price: import("@prisma/client/runtime/library").Decimal | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        assets: ({
            asset: {
                id: string;
                createdAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                url: string;
                type: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            assetId: string;
            exhibitorId: string;
            role: string | null;
        })[];
        tags: ({
            tag: {
                id: string;
                name: string;
                title: string | null;
                createdAt: Date;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            exhibitorId: string;
            tagId: string;
        })[];
        events: {
            id: string;
            name: string;
            title: string;
            description: string | null;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdById: string | null;
            exhibitorId: string | null;
            start: Date;
            color: string | null;
            end: Date;
            timed: boolean;
            timezone: string | null;
            published: boolean;
        }[];
    } & {
        id: string;
        name: string;
        title: string | null;
        description: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdById: string | null;
    }>;
    create(data: any, userId?: string): Promise<{
        id: string;
        name: string;
        title: string | null;
        description: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdById: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
        title: string | null;
        description: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdById: string | null;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        name: string;
        title: string | null;
        description: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdById: string | null;
    }>;
    linkAsset(exhibitorId: string, assetId: string, role?: string): Promise<{
        asset: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            url: string;
            type: string | null;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        assetId: string;
        exhibitorId: string;
        role: string | null;
    }>;
}
