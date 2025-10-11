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
            exhibitorId: string;
            assetId: string;
            role: string | null;
        })[];
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
                productId: string;
                role: string | null;
            })[];
        } & {
            id: string;
            exhibitorId: string;
            name: string;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        })[];
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                title: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            exhibitorId: string;
            tagId: string;
        })[];
        events: {
            id: string;
            exhibitorId: string | null;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            title: string;
            location: string | null;
            createdById: string | null;
            color: string | null;
            start: Date;
            end: Date;
            timed: boolean;
            timezone: string | null;
            published: boolean;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    create(data: any, userId?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        title: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
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
        exhibitorId: string;
        assetId: string;
        role: string | null;
    }>;
}
