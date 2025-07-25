"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.uploadToCloudinary = exports.setupCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const logger_1 = require("../utils/logger");
const setupCloudinary = () => {
    try {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        logger_1.logger.info('✅ Cloudinary configured successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ Cloudinary configuration failed:', error);
        throw error;
    }
};
exports.setupCloudinary = setupCloudinary;
const uploadToCloudinary = async (buffer, folder, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            ...options
        }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error('Upload failed'));
            resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes
            });
        });
        uploadStream.end(buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
//# sourceMappingURL=cloudinary.js.map