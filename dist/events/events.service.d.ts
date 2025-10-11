import { PrismaClient } from '@prisma/client';
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    get db(): any;
    findMany(opts: any): Promise<{
        data: {
            id: string;
            exhibitorId: string;
            name: string;
            title: string;
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
                assetId: string;
                role: string | null;
            })[];
        };
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
            eventId: string;
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
            eventId: string;
            tagId: string;
        })[];
        attendees: {
            id: string;
            name: string;
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
            userId: string;
            eventId: string;
            order: number | null;
        })[];
    } & {
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
    }>;
    create(data: any, userId?: string): Promise<{
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
    }>;
    update(id: string, data: any): Promise<{
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
    }>;
    softDelete(id: string): Promise<{
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
    }>;
    register(id: string, payload: any): Promise<{
        id: string;
        name: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string;
        userId: string | null;
        eventId: string;
        ticketType: string | null;
        checkedIn: boolean;
    }>;
}
