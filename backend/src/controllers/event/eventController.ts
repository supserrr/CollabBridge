import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';

export class EventController {
  async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Event controller - create method' });
  }

  async getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Event controller - get method' });
  }
}
