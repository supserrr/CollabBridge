import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class AdminController {
    getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserss(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateusersStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    getEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateEventFeatured(req: AuthenticatedRequest, res: Response): Promise<void>;
    getReports(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateusers(req: AuthenticatedRequest, res: Response): Promise<void>;
    resolveReport(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=adminController.d.ts.map