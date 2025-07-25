import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
export declare const verifyUsernameOwnership: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyProjectOwnership: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ownership.d.ts.map