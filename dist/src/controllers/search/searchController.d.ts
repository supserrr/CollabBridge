import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class SearchController {
    searchProfessionals(req: AuthenticatedRequest, res: Response): Promise<void>;
    searchEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=searchController.d.ts.map