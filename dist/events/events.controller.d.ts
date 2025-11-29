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
        attendees: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        }[];
        assets: ({
            asset: {
                id: string;
                createdAt: Date;
                deletedAt: Date | null;
                url: string;
                type: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
                createdBy: string | null;
            };
        } & {
            id: string;
            role: string | null;
            eventId: string;
            assetId: string;
        })[];
        exhibitor: {
            id: string;
            name: string;
            assets: ({
                asset: {
                    id: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    url: string;
                    type: string | null;
                    meta: import("@prisma/client/runtime/library").JsonValue | null;
                    createdBy: string | null;
                };
            } & {
                id: string;
                role: string | null;
                exhibitorId: string;
                assetId: string;
            })[];
        };
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
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
                name: string;
                title: string | null;
                color: string | null;
            };
        } & {
            id: string;
            eventId: string;
            tagId: string;
        })[];
    } & {
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
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        createdById: string | null;
    }>;
    create(dto: CreateEventDto, req: any): Promise<{
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
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        createdById: string | null;
    }>;
    update(id: string, dto: UpdateEventDto, req: any): Promise<{
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
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        createdById: string | null;
    }>;
    patch(id: string, dto: UpdateEventDto, req: any): Promise<{
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
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        createdById: string | null;
    }>;
    register(id: string, dto: RegisterAttendeeDto, req: any): Promise<{
        id: string;
        email: string | null;
        phone: string | null;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.AttendeeRole;
        createdAt: Date;
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
    listAttendees(id: string, q: any): Promise<{
        data: any;
        meta: {
            page: number;
            limit: number;
            total: any;
        };
    }>;
}
