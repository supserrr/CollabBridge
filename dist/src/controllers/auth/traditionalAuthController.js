"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraditionalAuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const errorHandler_1 = require("../../middleware/errorHandler");
const logger_1 = require("../../utils/logger");
class TraditionalAuthController {
    async signup(req, res) {
        const { email, password, firstName, lastName, username, role } = req.body;
        try {
            // Check if user already exists
            const existingUser = await database_1.prisma.users.findFirst({
                where: {
                    OR: [
                        { email },
                        { username: username || undefined }
                    ]
                }
            });
            if (existingUser) {
                if (existingUser.email === email) {
                    throw (0, errorHandler_1.createError)('Email already exists', 409);
                }
                if (existingUser.username === username) {
                    throw (0, errorHandler_1.createError)('Username already taken', 409);
                }
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            // Create user
            const user = await database_1.prisma.users.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: `${firstName} ${lastName}`,
                    username: username || null,
                    role: role.toUpperCase(),
                    isVerified: false,
                    isActive: true,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                },
            });
            // Create role-specific profile
            if (role.toUpperCase() === 'EVENT_PLANNER') {
                await database_1.prisma.event_planners.create({
                    data: { userId: user.id },
                });
            }
            else if (role.toUpperCase() === 'CREATIVE_PROFESSIONAL') {
                await database_1.prisma.creative_profiles.create({
                    data: { userId: user.id },
                });
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default-secret-key', { expiresIn: '7d' });
            logger_1.logger.info(`User signed up successfully: ${user.email}`);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user,
                token,
            });
        }
        catch (error) {
            logger_1.logger.error('Signup error:', error);
            throw error;
        }
    }
    async signin(req, res) {
        const { email, password } = req.body;
        try {
            // Find user by email
            const user = await database_1.prisma.users.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    name: true,
                    username: true,
                    role: true,
                    isVerified: true,
                    isActive: true,
                },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('Invalid email or password', 401);
            }
            if (!user.isActive) {
                throw (0, errorHandler_1.createError)('Account is disabled', 401);
            }
            // Check password
            if (!user.password) {
                throw (0, errorHandler_1.createError)('Please use social login or reset your password', 401);
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw (0, errorHandler_1.createError)('Invalid email or password', 401);
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default-secret-key', { expiresIn: '7d' });
            logger_1.logger.info(`User signed in successfully: ${user.email}`);
            // Remove password from response
            const userResponse = {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive,
            };
            res.json({
                success: true,
                message: 'Signed in successfully',
                user: userResponse,
                token,
            });
        }
        catch (error) {
            logger_1.logger.error('Signin error:', error);
            throw error;
        }
    }
    async me(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw (0, errorHandler_1.createError)('User not authenticated', 401);
            }
            const user = await database_1.prisma.users.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    role: true,
                    isVerified: true,
                    isActive: true,
                    createdAt: true,
                },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            if (!user.isActive) {
                throw (0, errorHandler_1.createError)('Account is disabled', 401);
            }
            res.json({
                success: true,
                user,
            });
        }
        catch (error) {
            logger_1.logger.error('Get current user error:', error);
            throw error;
        }
    }
}
exports.TraditionalAuthController = TraditionalAuthController;
//# sourceMappingURL=traditionalAuthController.js.map