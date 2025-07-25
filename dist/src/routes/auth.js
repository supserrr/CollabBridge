"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/auth/authController");
const traditionalAuthController_1 = require("../controllers/auth/traditionalAuthController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const database_1 = require("../config/database");
const firebase_1 = require("../config/firebase");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
const traditionalAuthController = new traditionalAuthController_1.TraditionalAuthController();
// Apply auth-specific rate limiting
router.use(rateLimiter_1.rateLimiters.auth);
// Traditional Auth Routes (Email/Password)
router.post('/signup', (0, validation_1.validate)([
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('firstName').trim().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('lastName').trim().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('role').isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
    (0, express_validator_1.body)('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/)
]), (0, errorHandler_1.asyncHandler)(traditionalAuthController.signup.bind(traditionalAuthController)));
router.post('/signin', (0, validation_1.validate)([
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
]), (0, errorHandler_1.asyncHandler)(traditionalAuthController.signin.bind(traditionalAuthController)));
// Firebase Auth Routes
router.post('/register', (0, validation_1.validate)([
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('role').isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
    (0, express_validator_1.body)('firebaseUid').optional().notEmpty(),
    (0, express_validator_1.body)('token').optional().notEmpty(),
    (0, express_validator_1.body)('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    (0, express_validator_1.body)().custom((value, { req }) => {
        if (!req.body.firebaseUid && !req.body.token) {
            throw new Error('Either firebaseUid or token is required');
        }
        return true;
    }),
]), (0, errorHandler_1.asyncHandler)(authController.register.bind(authController)));
router.post('/verify-token', (0, validation_1.validate)([
    (0, express_validator_1.body)('token').notEmpty(),
]), (0, errorHandler_1.asyncHandler)(authController.verifyToken.bind(authController)));
router.post('/verify-firebase-token', (0, validation_1.validate)([
    (0, express_validator_1.body)('token').notEmpty(),
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.body;
    try {
        // Verify Firebase token
        const decodedToken = await (0, firebase_1.verifyFirebaseToken)(token);
        // Find user by Firebase UID
        const user = await database_1.prisma.users.findUnique({
            where: { firebaseUid: decodedToken.uid },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                username: true,
                isVerified: true,
                isActive: true,
            },
        });
        if (!user || !user.isActive) {
            return res.status(404).json({ error: 'User not found or inactive' });
        }
        res.json({
            success: true,
            user,
        });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid Firebase token' });
    }
}));
router.get('/me', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(authController.getCurrentusers.bind(authController)));
router.get('/check-username', (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { username } = req.query;
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
    }
    const existingUser = await database_1.prisma.users.findUnique({
        where: { username: username }
    });
    res.json({ available: !existingUser });
}));
router.put('/update-profile', auth_1.authenticate, (0, validation_1.validate)([
    (0, express_validator_1.body)('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    (0, express_validator_1.body)('role').optional().isIn(['EVENT_PLANNER', 'CREATIVE_PROFESSIONAL']),
]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { username, role } = req.body;
    const userId = req.user.id;
    const updateData = {};
    if (username) {
        // Check if username is already taken by another user
        const existingUser = await database_1.prisma.users.findFirst({
            where: {
                username,
                id: { not: userId }
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        updateData.username = username;
    }
    if (role) {
        updateData.role = role;
    }
    const updatedUser = await database_1.prisma.users.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            username: true,
            isVerified: true,
            isActive: true,
        }
    });
    res.json({ success: true, user: updatedUser });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map