import { EventsService } from './events.service';
import { FindEventsDto } from './dto/find-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterAttendeeDto } from './dto/register-attendee.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findMany(q: FindEventsDto): Promise<{
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
    getActiveEvent(): Promise<{
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
    getEventSpeakers(id: string): Promise<{
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
            eventId: string;
            role: string | null;
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
            eventId: string;
            userId: string;
            role: string | null;
            order: number | null;
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
            eventId: string;
            tagId: string;
        })[];
    } & {
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
    }>;
    create(dto: CreateEventDto, req: any): Promise<{
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
    }>;
    update(id: string, dto: UpdateEventDto, req: any): Promise<{
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
    }>;
    patch(id: string, dto: UpdateEventDto, req: any): Promise<{
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
    }>;
    register(id: string, dto: RegisterAttendeeDto, req: any): Promise<{
        id: string;
        eventId: string;
        createdAt: Date;
        userId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        email: string | null;
        phone: string | null;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.AttendeeRole;
        ticketType: string | null;
        checkedIn: boolean;
        avatar: string | null;
        firstName: string;
        lastName: string;
        showCompany: boolean;
        showEmail: boolean;
        showPhone: boolean;
    }>;
    listAttendees(id: string, q: any): Promise<{
        data: any;
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
}
