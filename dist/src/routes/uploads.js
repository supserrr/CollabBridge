"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const upload_1 = require("../middleware/upload");
const uploadController_1 = require("../controllers/upload/uploadController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const uploadController = new uploadController_1.UploadController();
// Apply upload-specific rate limiting
router.use(rateLimiter_1.rateLimiters.upload);
// All routes require authentication
router.use(auth_1.authenticate);
// Single file upload
router.post('/single', (0, upload_1.uploadSingle)('file'), (0, errorHandler_1.asyncHandler)(uploadController.uploadSingle.bind(uploadController)));
// Multiple file upload
router.post('/multiple', (0, upload_1.uploadMultiple)('files', 5), (0, errorHandler_1.asyncHandler)(uploadController.uploadMultiple.bind(uploadController)));
// Delete file
router.delete('/:publicId', (0, errorHandler_1.asyncHandler)(uploadController.deleteFile.bind(uploadController)));
exports.default = router;
//# sourceMappingURL=uploads.js.map