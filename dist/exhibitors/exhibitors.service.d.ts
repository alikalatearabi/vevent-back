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
                createdAt: Date;
                title: string | null;
                name: string;
                id: string;
                color: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            exhibitorId: string;
            id: string;
            tagId: string;
        })[];
        assets: ({
            asset: {
                createdAt: Date;
                id: string;
                deletedAt: Date | null;
                createdBy: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
                url: string;
                type: string | null;
            };
        } & {
            exhibitorId: string;
            id: string;
            role: string | null;
            assetId: string;
        })[];
        products: ({
            assets: ({
                asset: {
                    createdAt: Date;
                    id: string;
                    deletedAt: Date | null;
                    createdBy: string | null;
                    meta: import("@prisma/client/runtime/library").JsonValue | null;
                    url: string;
                    type: string | null;
                };
            } & {
                id: string;
                role: string | null;
                assetId: string;
                productId: string;
            })[];
        } & {
            exhibitorId: string;
            categoryId: string | null;
            inStock: boolean;
            featured: boolean;
            createdAt: Date;
            shortDescription: string | null;
            description: string | null;
            title: string | null;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal | null;
            id: string;
            imageUrl: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            updatedAt: Date;
            deletedAt: Date | null;
        })[];
        events: {
            exhibitorId: string | null;
            createdAt: Date;
            description: string | null;
            title: string;
            name: string;
            id: string;
            updatedAt: Date;
            deletedAt: Date | null;
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
        createdAt: Date;
        description: string | null;
        title: string | null;
        name: string;
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    create(data: any, userId?: string): Promise<{
        createdAt: Date;
        description: string | null;
        title: string | null;
        name: string;
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    update(id: string, data: any): Promise<{
        createdAt: Date;
        description: string | null;
        title: string | null;
        name: string;
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    softDelete(id: string): Promise<{
        createdAt: Date;
        description: string | null;
        title: string | null;
        name: string;
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdById: string | null;
    }>;
    linkAsset(exhibitorId: string, assetId: string, role?: string): Promise<{
        asset: {
            createdAt: Date;
            id: string;
            deletedAt: Date | null;
            createdBy: string | null;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            url: string;
            type: string | null;
        };
    } & {
        exhibitorId: string;
        id: string;
        role: string | null;
        assetId: string;
    }>;
}
