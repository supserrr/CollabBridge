import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class UploadController {
    uploadSingle(req: AuthenticatedRequest, res: Response): Promise<void>;
    uploadMultiple(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteFile(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=uploadController.d.ts.map