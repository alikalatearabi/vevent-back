import { ExhibitorsService } from './exhibitors.service';
import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { UpdateExhibitorDto } from './dto/update-exhibitor.dto';
import { AssetService } from '../common/services/asset.service';
export declare class ExhibitorsAdminController {
    private readonly exhibitorsService;
    private readonly assetService;
    constructor(exhibitorsService: ExhibitorsService, assetService: AssetService);
    create(dto: CreateExhibitorDto, req: any, res: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        title: string | null;
        description: string | null;
        location: string | null;
        createdById: string | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    update(id: string, dto: UpdateExhibitorDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        title: string | null;
        description: string | null;
        location: string | null;
        createdById: string | null;
        website: string | null;
        sponsor: boolean;
        favoriteCount: number;
    }>;
    remove(id: string, req: any, res: any): Promise<void>;
    uploadAssets(id: string, files: Array<Express.Multer.File>, req: any): Promise<{
        message: string;
        assets: any[];
    }>;
}
