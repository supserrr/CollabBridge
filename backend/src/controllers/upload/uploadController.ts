import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';

export class UploadController {
  async uploadSingle(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Upload controller - single method' });
  }

  async uploadMultiple(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Upload controller - multiple method' });
  }

  async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Upload controller - avatar method' });
  }

  async uploadPortfolio(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Upload controller - portfolio method' });
  }

  async deleteFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Upload controller - delete method' });
  }
}
