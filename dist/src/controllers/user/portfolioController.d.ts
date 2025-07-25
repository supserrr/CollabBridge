import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class PortfolioController {
    getPortfolio(req: Request, res: Response): Promise<void>;
    getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    getDashboardProjects(req: AuthenticatedRequest, res: Response): Promise<void>;
    createProject(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateProject(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteProject(req: AuthenticatedRequest, res: Response): Promise<void>;
    updatePortfolioSettings(req: AuthenticatedRequest, res: Response): Promise<void>;
    private trackPortfolioView;
}
//# sourceMappingURL=portfolioController.d.ts.map