import { Response } from 'express';
import { AuthRequest } from '../types/express';
export declare class MessageController {
    sendMessage(req: AuthRequest, res: Response): Promise<void>;
    getConversations(req: AuthRequest, res: Response): Promise<void>;
    getMessages(req: AuthRequest, res: Response): Promise<void>;
    markAsRead(req: AuthRequest, res: Response): Promise<void>;
    getUnreadCount(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=MessageController.d.ts.map