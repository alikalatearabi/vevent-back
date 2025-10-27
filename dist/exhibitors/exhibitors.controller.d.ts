import { ExhibitorsService } from './exhibitors.service';
import { FindExhibitorsDto } from './dto/find-exhibitors.dto';
export declare class ExhibitorsController {
    private readonly exhibitorsService;
    constructor(exhibitorsService: ExhibitorsService);
    findMany(query: FindExhibitorsDto): Promise<{
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
        id: string;
        name: string;
        title: string;
        description: string;
        website: string;
        coverUrl: string;
        images: any[];
        location: string;
        sponsor: boolean;
        tags: any[];
        products: {
            id: any;
            name: any;
            description: any;
            price: any;
            assets: any;
        }[];
        events: {
            id: any;
            title: any;
            start: any;
            timezone: any;
        }[];
    }>;
}
