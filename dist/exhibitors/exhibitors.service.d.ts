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
                createdBy: string | null;
                deletedAt: Date | null;
                type: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
                url: string;
            };
        } & {
            id: string;
            exhibitorId: string;
            role: string | null;
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
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdById: string | null;
            name: string;
            title: string;
            color: string | null;
            start: Date;
            end: Date;
            timed: boolean;
            location: string | null;
            exhibitorId: string | null;
            timezone: string | null;
            published: boolean;
            price: import("@prisma/client/runtime/library").Decimal | null;
            currency: string | null;
            deletedAt: Date | null;
        }[];
        products: ({
            assets: ({
                asset: {
                    id: string;
                    createdAt: Date;
                    createdBy: string | null;
                    deletedAt: Date | null;
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
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            title: string | null;
            exhibitorId: string;
            price: import("@prisma/client/runtime/library").Decimal | null;
            deletedAt: Date | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            categoryId: string | null;
            inStock: boolean;
            featured: boolean;
            shortDescription: string | null;
            imageUrl: string | null;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        name: string;
        title: string | null;
        location: string | null;
        deletedAt: Date | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    create(data: any, userId?: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        name: string;
        title: string | null;
        location: string | null;
        deletedAt: Date | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        name: string;
        title: string | null;
        location: string | null;
        deletedAt: Date | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        name: string;
        title: string | null;
        location: string | null;
        deletedAt: Date | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    linkAsset(exhibitorId: string, assetId: string, role?: string): Promise<{
        asset: {
            id: string;
            createdAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            type: string | null;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            url: string;
        };
    } & {
        id: string;
        exhibitorId: string;
        role: string | null;
        assetId: string;
    }>;
}
