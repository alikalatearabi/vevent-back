import { AttendeesService } from './attendees.service';
import { ConnectionRequestService } from './connection-request.service';
import { CreateConnectionRequestDto, UpdateConnectionRequestDto } from './dto/connection-request.dto';
export declare class AttendeesController {
    private readonly attendeesService;
    private readonly connectionRequestService;
    constructor(attendeesService: AttendeesService, connectionRequestService: ConnectionRequestService);
    checkin(id: string, req: any): Promise<{
        ok: boolean;
    }>;
    getEventAttendees(eventId: string, req: any): Promise<{
        data: {
            id: string;
            firstName: string;
            lastName: string;
            company: string;
            jobTitle: string;
            email: string;
            phone: string;
            avatar: string;
            role: import(".prisma/client").$Enums.AttendeeRole;
            checkedIn: boolean;
            privacy: {
                showPhone: boolean;
                showCompany: boolean;
                showEmail: boolean;
            };
            user: {
                email: string;
            };
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getEventSpeakers(eventId: string, req: any): Promise<{
        data: {
            id: string;
            firstName: string;
            lastName: string;
            company: string;
            jobTitle: string;
            email: string;
            phone: string;
            avatar: string;
            role: import(".prisma/client").$Enums.AttendeeRole;
            checkedIn: boolean;
            privacy: {
                showPhone: boolean;
                showCompany: boolean;
                showEmail: boolean;
            };
            user: {
                email: string;
            };
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getEventVisitors(eventId: string, req: any): Promise<{
        data: {
            id: string;
            firstName: string;
            lastName: string;
            company: string;
            jobTitle: string;
            email: string;
            phone: string;
            avatar: string;
            role: import(".prisma/client").$Enums.AttendeeRole;
            checkedIn: boolean;
            privacy: {
                showPhone: boolean;
                showCompany: boolean;
                showEmail: boolean;
            };
            user: {
                email: string;
            };
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    createConnectionRequest(dto: CreateConnectionRequestDto, req: any): Promise<{
        requestId: string;
        requesterId: string;
        receiverId: string;
        requestDateTime: string;
        requestStatus: string;
        requestType: string;
    }>;
    getConnectionRequests(req: any, eventId?: string): Promise<{
        incomingRequests: {
            requesterId: string;
            receiverId: string;
            requestDateTime: string;
            requestStatus: string;
            requestType: string;
            message: string;
            requester: {
                id: any;
                firstName: any;
                lastName: any;
                company: any;
                jobTitle: any;
                email: any;
                phone: any;
                avatar: any;
                role: any;
            };
        }[];
        outgoingRequests: {
            requesterId: string;
            receiverId: string;
            requestDateTime: string;
            requestStatus: string;
            requestType: string;
            message: string;
            receiver: {
                id: any;
                firstName: any;
                lastName: any;
                company: any;
                jobTitle: any;
                email: any;
                phone: any;
                avatar: any;
                role: any;
            };
        }[];
        connections: {
            requesterId: string;
            receiverId: string;
            requestDateTime: string;
            requestStatus: string;
            requestType: string;
            connectedUser: {
                id: any;
                firstName: any;
                lastName: any;
                company: any;
                jobTitle: any;
                email: any;
                phone: any;
                avatar: any;
                role: any;
            };
        }[];
    }>;
    updateConnectionRequest(requestId: string, dto: UpdateConnectionRequestDto, req: any): Promise<{
        requestId: string;
        requesterId: string;
        receiverId: string;
        requestDateTime: string;
        responseDateTime: string;
        requestStatus: string;
        requestType: string;
    }>;
    deleteConnectionRequest(requestId: string, req: any): Promise<{
        message: string;
    }>;
}
