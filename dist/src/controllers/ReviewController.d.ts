import { Request, Response } from 'express';
import { AuthRequest } from '../types/express';
export declare class ReviewController {
    private notificationService;
    create(req: AuthRequest, res: Response): Promise<void>;
    getReviews(req: Request, res: Response): Promise<void>;
    getMyReviews(req: AuthRequest, res: Response): Promise<void>;
    updateReview(req: AuthRequest, res: Response): Promise<void>;
    deleteReview(req: AuthRequest, res: Response): Promise<void>;
    checkExistingReview(req: AuthRequest): Promise<boolean>;
}
//# sourceMappingURL=ReviewController.d.ts.map