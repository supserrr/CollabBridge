"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const firebase_1 = require("../../config/firebase");
const errorHandler_1 = require("../../middleware/errorHandler");
class AuthController {
    async register(req, res) {
        const { email, name, role, firebaseUid, token: firebaseToken, username } = req.body;
        try {
            // Verify Firebase token if provided
            let verifiedFirebaseUser;
            if (firebaseToken) {
                verifiedFirebaseUser = await (0, firebase_1.verifyFirebaseToken)(firebaseToken);
                if (verifiedFirebaseUser.email !== email) {
                    throw (0, errorHandler_1.createError)('Email mismatch with Firebase token', 400);
                }
            }
            else if (firebaseUid) {
                // For backward compatibility, handle direct firebaseUid
                verifiedFirebaseUser = { uid: firebaseUid, email };
            }
            else {
                throw (0, errorHandler_1.createError)('Either token or firebaseUid is required', 400);
            }
            const actualFirebaseUid = verifiedFirebaseUser.uid;
            // Check if user already exists
            const existingusers = await database_1.prisma.users.findFirst({
                where: {
                    OR: [
                        { email },
                        { firebaseUid: actualFirebaseUid }
                    ]
                }
            });
            if (existingusers) {
                throw (0, errorHandler_1.createError)('User already exists', 409);
            }
            // Create user in database
            const newusers = await database_1.prisma.users.create({
                data: {
                    email,
                    name,
                    role: role || 'user',
                    firebaseUid: actualFirebaseUid,
                    username: username || null // Don't auto-generate username for Google users
                }
            });
            // Create role-specific profile
            if (role === 'EVENT_PLANNER') {
                await database_1.prisma.event_planners.create({
                    data: { userId: newusers.id },
                });
            }
            else if (role === 'CREATIVE_PROFESSIONAL') {
                await database_1.prisma.creative_profiles.create({
                    data: { userId: newusers.id },
                });
            }
            // Generate JWT token
            const jwtToken = jsonwebtoken_1.default.sign({ userId: newusers.id, email: newusers.email, role: newusers.role }, process.env.JWT_SECRET || 'default-secret-key', { expiresIn: '7d' });
            res.status(201).json({
                success: true,
                message: 'users registered successfully',
                user: newusers,
                token: jwtToken,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async verifyToken(req, res) {
        const { token } = req.body;
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await database_1.prisma.users.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isVerified: true,
                    isActive: true,
                },
            });
            if (!user || !user.isActive) {
                throw (0, errorHandler_1.createError)('Invalid or inactive user', 401);
            }
            res.json({
                success: true,
                user,
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Invalid token', 401);
        }
    }
    async getCurrentusers(req, res) {
        try {
            const user = await database_1.prisma.users.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    location: true,
                    bio: true,
                    avatar: true,
                    phone: true,
                    isVerified: true,
                    language: true,
                    createdAt: true,
                },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('users not found', 404);
            }
            res.json({
                success: true,
                user,
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map