export declare class CreateEventDto {
    name: string;
    title: string;
    description?: string;
    color?: string;
    start: string;
    end: string;
    timezone?: string;
    timed?: boolean;
    location?: string;
    exhibitorId?: string;
    tags?: string[];
    speakers?: string[];
    published?: boolean;
}
