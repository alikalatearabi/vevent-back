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
        attendees: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        }[];
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
        tags: ({
            tag: {
                id: string;
                name: string;
                title: string | null;
                color: string | null;
                createdAt: Date;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            eventId: string;
            tagId: string;
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
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    getEventSpeakers(eventId: string): Promise<{
        data: {
            id: any;
            firstName: any;
            lastName: any;
            email: any;
            phone: any;
            company: any;
            jobTitle: any;
            role: any;
            order: any;
        }[];
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
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
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
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
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
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    register(id: string, payload: any): Promise<{
        id: string;
        createdAt: Date;
        email: string | null;
        phone: string | null;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.AttendeeRole;
        userId: string | null;
        eventId: string;
        ticketType: string | null;
        checkedIn: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        avatar: string | null;
        firstName: string;
        lastName: string;
        showCompany: boolean;
        showEmail: boolean;
        showPhone: boolean;
    }>;
    getCurrentEvent(): Promise<{
        success: boolean;
        data: {
            id: any;
            name: any;
            title: any;
            description: any;
            start: any;
            end: any;
            location: any;
            timezone: any;
            price: number;
            currency: any;
            features: any;
            published: any;
            isActive: boolean;
            registrationOpen: boolean;
            registrationStart: string;
            registrationEnd: string;
            capacity: number;
            currentRegistrations: number;
            imageUrl: any;
            organizer: string;
            category: any;
            tags: any;
        };
    }>;
}
