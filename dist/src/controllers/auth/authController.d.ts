import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class AuthController {
    register(req: Request, res: Response): Promise<void>;
    verifyToken(req: Request, res: Response): Promise<void>;
    getCurrentusers(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map