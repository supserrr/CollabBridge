import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class usersController {
    getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateAvatar(req: AuthenticatedRequest, res: Response): Promise<void>;
    deactivateAccount(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateUsername(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=userController.d.ts.map