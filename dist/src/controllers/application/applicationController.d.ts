import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class ApplicationController {
    getEventApplications(req: AuthenticatedRequest, res: Response): Promise<void>;
    getMyApplications(req: AuthenticatedRequest, res: Response): Promise<void>;
    getPendingApplications(req: AuthenticatedRequest, res: Response): Promise<void>;
    getApplicationById(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    withdrawApplication(req: AuthenticatedRequest, res: Response): Promise<void>;
    getApplicationStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=applicationController.d.ts.map