import { Request, Response, NextFunction } from 'express';
import { users } from '@prisma/client';
export interface AuthRequest extends Request {
    user?: users;
}
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        firebaseUid: string | null;
        isActive: boolean;
    };
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map