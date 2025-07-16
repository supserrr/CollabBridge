import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';

export class MessageController {
  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Message controller - conversations method' });
  }

  async getConversationMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Message controller - messages method' });
  }

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Message controller - send method' });
  }

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Message controller - mark read method' });
  }

  async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ message: 'Message controller - delete method' });
  }
}
