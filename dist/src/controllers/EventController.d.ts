import { Response } from 'express';
import { AuthRequest } from '../types/express';
export declare class EventController {
    private verifyEventAccess;
    create(req: AuthRequest, res: Response): Promise<void>;
    private createEventWithData;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    apply(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=EventController.d.ts.map