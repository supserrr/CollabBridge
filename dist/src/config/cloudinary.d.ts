import { v2 as cloudinary } from 'cloudinary';
export declare const setupCloudinary: () => void;
export interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
}
export declare const uploadToCloudinary: (buffer: Buffer, folder: string, options?: Record<string, any>) => Promise<CloudinaryResponse>;
export { cloudinary };
//# sourceMappingURL=cloudinary.d.ts.map