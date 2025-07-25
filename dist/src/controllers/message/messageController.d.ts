import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class MessageController {
    getConversations(req: AuthenticatedRequest, res: Response): Promise<void>;
    getConversationMessages(req: AuthenticatedRequest, res: Response): Promise<void>;
    sendMessage(req: AuthenticatedRequest, res: Response): Promise<void>;
    markAsRead(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=messageController.d.ts.map