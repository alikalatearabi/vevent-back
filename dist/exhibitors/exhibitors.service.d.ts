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
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                name: string;
                title: string | null;
                color: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            exhibitorId: string;
            tagId: string;
        })[];
        assets: ({
            asset: {
                id: string;
                createdAt: Date;
                deletedAt: Date | null;
                type: string | null;
                createdBy: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
                url: string;
            };
        } & {
            id: string;
            role: string | null;
            exhibitorId: string;
            assetId: string;
        })[];
        events: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            exhibitorId: string | null;
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
        products: ({
            assets: ({
                asset: {
                    id: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    type: string | null;
                    createdBy: string | null;
                    meta: import("@prisma/client/runtime/library").JsonValue | null;
                    url: string;
                };
            } & {
                id: string;
                role: string | null;
                assetId: string;
                productId: string;
            })[];
        } & {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            exhibitorId: string;
            categoryId: string | null;
            inStock: boolean;
            featured: boolean;
            shortDescription: string | null;
            title: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            imageUrl: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    create(data: any, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
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
            type: string | null;
            createdBy: string | null;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            url: string;
        };
    } & {
        id: string;
        role: string | null;
        exhibitorId: string;
        assetId: string;
    }>;
}
