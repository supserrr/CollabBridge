import multer from 'multer';
import { Request } from 'express';
declare const FILE_TYPES: {
    images: {
        extensions: string[];
        mimeTypes: string[];
        maxSize: number;
    };
    documents: {
        extensions: string[];
        mimeTypes: string[];
        maxSize: number;
    };
    portfolioFiles: {
        extensions: string[];
        mimeTypes: string[];
        maxSize: number;
    };
    profileImages: {
        extensions: string[];
        mimeTypes: string[];
        maxSize: number;
    };
    eventImages: {
        extensions: string[];
        mimeTypes: string[];
        maxSize: number;
    };
};
export declare const uploadProfileImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadEventImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadPortfolioFiles: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadDocuments: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
declare const upload: multer.Multer;
export declare const uploadSingle: (fieldName: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadMultiple: (fieldName: string, maxCount?: number) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadFields: (fields: {
    name: string;
    maxCount: number;
}[]) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const handleUploadError: (error: any, req: Request, res: any, next: any) => any;
export { upload, FILE_TYPES };
//# sourceMappingURL=upload.d.ts.map