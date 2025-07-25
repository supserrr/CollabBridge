"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const errorHandler_1 = require("../../middleware/errorHandler");
const cloudinary_1 = require("../../config/cloudinary");
class UploadController {
    async uploadSingle(req, res) {
        try {
            if (!req.file) {
                throw (0, errorHandler_1.createError)('No file uploaded', 400);
            }
            const file = req.file;
            res.json({
                success: true,
                message: 'File uploaded successfully',
                file: {
                    url: file.path,
                    publicId: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    format: file.format,
                },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async uploadMultiple(req, res) {
        try {
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                throw (0, errorHandler_1.createError)('No files uploaded', 400);
            }
            const files = req.files.map(file => ({
                url: file.path,
                publicId: file.filename,
                originalName: file.originalname,
                size: file.size,
                format: file.format,
            }));
            res.json({
                success: true,
                message: 'Files uploaded successfully',
                files,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async deleteFile(req, res) {
        try {
            const { publicId } = req.params;
            const result = await cloudinary_1.cloudinary.uploader.destroy(publicId);
            if (result.result !== 'ok') {
                throw (0, errorHandler_1.createError)('Failed to delete file', 400);
            }
            res.json({
                success: true,
                message: 'File deleted successfully',
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.UploadController = UploadController;
//# sourceMappingURL=uploadController.js.map