import { Request, Response } from 'express';
import { AuthRequest } from '../types/express';
export declare class UploadController {
    uploadImage(req: AuthRequest, res: Response): Promise<void>;
    uploadDocument(req: AuthRequest, res: Response): Promise<void>;
    uploadMultiple(req: AuthRequest, res: Response): Promise<void>;
    uploadFile(req: Request, res: Response): Promise<void>;
    deleteFile(req: AuthRequest, res: Response): Promise<void>;
    getSignedUrl(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=UploadController.d.ts.map