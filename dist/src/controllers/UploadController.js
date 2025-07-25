"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const cloudinary_1 = require("../config/cloudinary");
const errorHandler_1 = require("../middleware/errorHandler");
class UploadController {
    async uploadImage(req, res) {
        try {
            if (!req.user) {
                throw (0, errorHandler_1.createError)('users not authenticated', 401);
            }
            if (!req.file) {
                throw (0, errorHandler_1.createError)('No file uploaded', 400);
            }
            const result = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'images', {
                width: 1200,
                height: 800,
                crop: 'limit',
                quality: 'auto',
                fetch_format: 'auto',
            });
            res.json({
                message: 'Image uploaded successfully',
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async uploadDocument(req, res) {
        try {
            if (!req.user) {
                throw (0, errorHandler_1.createError)('users not authenticated', 401);
            }
            if (!req.file) {
                throw (0, errorHandler_1.createError)('No file uploaded', 400);
            }
            const result = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'documents', {
                resource_type: 'auto',
            });
            res.json({
                message: 'Document uploaded successfully',
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async uploadMultiple(req, res) {
        try {
            if (!req.user) {
                throw (0, errorHandler_1.createError)('users not authenticated', 401);
            }
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                throw (0, errorHandler_1.createError)('No files uploaded', 400);
            }
            const uploadPromises = req.files.map((file) => (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'uploads'));
            const results = await Promise.all(uploadPromises);
            res.json({
                message: 'Files uploaded successfully',
                files: results.map((result) => ({
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    bytes: result.bytes,
                })),
            });
        }
        catch (error) {
            throw error;
        }
    }
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                throw (0, errorHandler_1.createError)('No file uploaded', 400);
            }
            const result = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'uploads', { resource_type: 'auto' });
            res.json({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes
            });
        }
        catch (error) {
            throw error;
        }
    }
    async deleteFile(req, res) {
        try {
            const { publicId } = req.params;
            if (!publicId) {
                throw (0, errorHandler_1.createError)('Public ID is required', 400);
            }
            await cloudinary_1.cloudinary.uploader.destroy(publicId);
            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getSignedUrl(req, res) {
        try {
            const { publicId, transformation } = req.query;
            if (!publicId) {
                throw (0, errorHandler_1.createError)('Public ID is required', 400);
            }
            const signedUrl = cloudinary_1.cloudinary.url(publicId, {
                transformation: transformation ? JSON.parse(transformation) : {},
                sign_url: true,
                secure: true
            });
            res.json({
                success: true,
                url: signedUrl
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.UploadController = UploadController;
//# sourceMappingURL=UploadController.js.map