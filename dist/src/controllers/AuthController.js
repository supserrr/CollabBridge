"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
    async register(req, res) {
        try {
            const { email, name, role, firebaseUid, location, bio } = req.body;
            // Verify Firebase user exists
            await firebase_admin_1.default.auth().getUsers(firebaseUid);
            // Check if user already exists
            const existingusers = await database_1.prisma.users.findFirst({
                where: {
                    OR: [{ email }, { firebaseUid }],
                },
            });
            if (existingusers) {
                throw (0, errorHandler_1.createError)('users already exists', 409);
            }
            // Create user
            const user = await database_1.prisma.users.create({
                data: {
                    email,
                    name,
                    role,
                    firebaseUid,
                    location,
                    bio,
                },
            });
            // Create role-specific profile
            if (role === 'EVENT_PLANNER') {
                await database_1.prisma.event_planners.create({
                    data: { userId: user.id },
                });
            }
            else if (role === 'CREATIVE_PROFESSIONAL') {
                await database_1.prisma.creative_profiles.create({
                    data: { userId: user.id },
                });
            }
            res.status(201).json({
                message: 'users registered successfully',
                users: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
    async verifyToken(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                throw (0, errorHandler_1.createError)('Token is required', 400);
            }
            const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token);
            const user = await database_1.prisma.users.findUnique({
                where: { firebaseUid: decodedToken.uid },
                include: {
                    event_planners: true,
                    creative_profiles: true,
                },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('users not found', 404);
            }
            res.json({
                valid: true,
                users: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profile: user.event_planners || user.creative_profiles,
                },
            });
        }
        catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ valid: false, error: 'Invalid token' });
        }
    }
    async refreshToken(req, res) {
        // This would typically involve Firebase Admin SDK
        res.json({ message: 'Token refresh handled by Firebase client SDK' });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map