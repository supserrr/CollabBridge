import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';

export class SearchController {
  async searchProfessionals(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Search controller - professionals method' });
  }

  async searchEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Search controller - events method' });
  }
}
