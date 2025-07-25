import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class ReviewController {
    createReview(req: AuthenticatedRequest, res: Response): Promise<void>;
    getReviews(req: AuthenticatedRequest, res: Response): Promise<void>;
    getReviewById(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateReview(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteReview(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=reviewController.d.ts.map