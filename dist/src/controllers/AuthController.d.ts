import { Request, Response } from 'express';
export declare class AuthController {
    register(req: Request, res: Response): Promise<void>;
    verifyToken(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map