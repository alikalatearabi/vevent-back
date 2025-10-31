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
                type: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
                url: string;
            };
        } & {
            id: string;
            role: string | null;
            exhibitorId: string;
            assetId: string;
        })[];
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
        events: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            title: string;
            description: string | null;
            color: string | null;
            start: Date;
            end: Date;
            timed: boolean;
            location: string | null;
            exhibitorId: string | null;
            timezone: string | null;
            published: boolean;
            createdById: string | null;
        }[];
        products: ({
            assets: ({
                asset: {
                    id: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    createdBy: string | null;
                    type: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            title: string | null;
            description: string | null;
            exhibitorId: string;
            categoryId: string | null;
            inStock: boolean;
            featured: boolean;
            shortDescription: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            imageUrl: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        title: string | null;
        description: string | null;
        location: string | null;
        createdById: string | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    create(data: any, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        title: string | null;
        description: string | null;
        location: string | null;
        createdById: string | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        title: string | null;
        description: string | null;
        location: string | null;
        createdById: string | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        title: string | null;
        description: string | null;
        location: string | null;
        createdById: string | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    linkAsset(exhibitorId: string, assetId: string, role?: string): Promise<{
        asset: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            type: string | null;
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
