"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const upload_1 = require("../middleware/upload");
const userController_1 = require("../controllers/user/userController");
const router = (0, express_1.Router)();
const userController = new userController_1.usersController();
// All routes require authentication
router.use(auth_1.authenticate);
// Get user profile
router.get('/profile', (0, errorHandler_1.asyncHandler)(userController.getProfile.bind(userController)));
// Update user profile
router.put('/profile', (0, validation_1.validate)([
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('bio').optional().isLength({ max: 500 }),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 100 }),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any'),
]), (0, errorHandler_1.asyncHandler)(userController.updateProfile.bind(userController)));
// Update username
router.put('/username', (0, validation_1.validate)([
    (0, express_validator_1.body)('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/)
]), (0, errorHandler_1.asyncHandler)(userController.updateUsername.bind(userController)));
// Update avatar
router.post('/avatar', (0, upload_1.uploadSingle)('avatar'), (0, errorHandler_1.asyncHandler)(userController.updateAvatar.bind(userController)));
// Deactivate account
router.delete('/account', (0, errorHandler_1.asyncHandler)(userController.deactivateAccount.bind(userController)));
exports.default = router;
//# sourceMappingURL=users.js.map