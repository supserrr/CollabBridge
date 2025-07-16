import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';

export class ReviewController {
  async createReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Review controller - create method' });
  }

  async getReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Review controller - get method' });
  }

  async getMyReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Review controller - my reviews method' });
  }

  async updateReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Review controller - update method' });
  }
}
