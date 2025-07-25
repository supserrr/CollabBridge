import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class EventController {
    createEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    getEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
    getEventById(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    getMyEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
    applyToEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=eventController.d.ts.map