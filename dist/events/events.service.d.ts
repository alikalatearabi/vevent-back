import { PrismaClient } from '@prisma/client';
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    get db(): any;
    findMany(opts: any): Promise<{
        data: {
            exhibitorId: string;
            title: string;
            name: string;
            id: string;
            location: string;
            color: string;
            start: Date;
            end: Date;
            timed: boolean;
            timezone: string;
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
            id: string;
            tagId: string;
            eventId: string;
        })[];
        exhibitor: {
            name: string;
            id: string;
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
        };
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
            eventId: string;
        })[];
        attendees: {
            name: string;
            id: string;
            email: string;
        }[];
        speakers: ({
            user: {
                id: string;
                email: string;
                firstname: string;
                lastname: string;
            };
        } & {
            id: string;
            role: string | null;
            eventId: string;
            userId: string;
            order: number | null;
        })[];
    } & {
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
    }>;
    create(data: any, userId?: string): Promise<{
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
    }>;
    update(id: string, data: any): Promise<{
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
    }>;
    softDelete(id: string): Promise<{
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
    }>;
    register(id: string, payload: any): Promise<{
        createdAt: Date;
        name: string;
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        eventId: string;
        email: string;
        userId: string | null;
        ticketType: string | null;
        checkedIn: boolean;
    }>;
}
