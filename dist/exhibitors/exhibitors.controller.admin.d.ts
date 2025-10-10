import { ExhibitorsService } from './exhibitors.service';
import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { UpdateExhibitorDto } from './dto/update-exhibitor.dto';
export declare class ExhibitorsAdminController {
    private readonly exhibitorsService;
    constructor(exhibitorsService: ExhibitorsService);
    create(dto: CreateExhibitorDto, req: any, res: any): Promise<{
        id: string;
        name: string;
        title: string | null;
        description: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdById: string | null;
    }>;
    update(id: string, dto: UpdateExhibitorDto, req: any): Promise<{
        id: string;
        name: string;
        title: string | null;
        description: string | null;
        website: string | null;
        location: string | null;
        sponsor: boolean;
        favoriteCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdById: string | null;
    }>;
    remove(id: string, req: any, res: any): Promise<void>;
    uploadAssets(id: string, files: Array<Express.Multer.File>, req: any): Promise<any[]>;
}
