import { PrismaClient } from '@prisma/client';
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    get db(): any;
    findMany(opts: any): Promise<{
        data: {
            id: string;
            name: string;
            title: string;
            color: string;
            start: Date;
            end: Date;
            timed: boolean;
            location: string;
            exhibitorId: string;
            timezone: string;
        }[];
        meta: {
            page: any;
            limit: number;
            total: number;
        };
    }>;
    findById(id: string): Promise<{
        exhibitor: {
            id: string;
            name: string;
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
                role: string | null;
                assetId: string;
            })[];
        };
        speakers: ({
            user: {
                id: string;
                firstname: string;
                lastname: string;
                email: string;
            };
        } & {
            id: string;
            role: string | null;
            userId: string;
            eventId: string;
            order: number | null;
        })[];
        attendees: {
            id: string;
            name: string;
            email: string;
        }[];
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
            eventId: string;
            tagId: string;
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
            role: string | null;
            eventId: string;
            assetId: string;
        })[];
    } & {
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    create(data: any, userId?: string): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    softDelete(id: string): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    register(id: string, payload: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        userId: string | null;
        eventId: string;
        ticketType: string | null;
        checkedIn: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
