"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const database_1 = require("../../config/database");
const errorHandler_1 = require("../../middleware/errorHandler");
class usersController {
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await database_1.prisma.users.findUnique({
                where: { id: userId },
                include: {
                    event_planners: true,
                    creative_profiles: {
                        include: {
                            reviews: {
                                include: {
                                    users_reviews_reviewerIdTousers: {
                                        select: {
                                            id: true,
                                            name: true,
                                            avatar: true,
                                        },
                                    },
                                },
                                orderBy: { createdAt: 'desc' },
                                take: 5,
                            },
                        },
                    },
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
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, bio, location, phone } = req.body;
            const updatedusers = await database_1.prisma.users.update({
                where: { id: userId },
                data: {
                    name,
                    bio,
                    location,
                    phone,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    bio: true,
                    location: true,
                    phone: true,
                    avatar: true,
                    updatedAt: true,
                },
            });
            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: updatedusers,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async updateAvatar(req, res) {
        try {
            const userId = req.user.id;
            if (!req.file) {
                throw (0, errorHandler_1.createError)('No file uploaded', 400);
            }
            // File is already uploaded to Cloudinary via middleware
            const avatarUrl = req.file.path;
            const updatedusers = await database_1.prisma.users.update({
                where: { id: userId },
                data: { avatar: avatarUrl },
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            });
            res.json({
                success: true,
                message: 'Avatar updated successfully',
                user: updatedusers,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async deactivateAccount(req, res) {
        try {
            const userId = req.user.id;
            await database_1.prisma.users.update({
                where: { id: userId },
                data: { isActive: false },
            });
            res.json({
                success: true,
                message: 'Account deactivated successfully',
            });
        }
        catch (error) {
            throw error;
        }
    }
    async updateUsername(req, res) {
        try {
            const userId = req.user.id;
            const { username } = req.body;
            // Check if username is already taken
            const existingUser = await database_1.prisma.users.findUnique({
                where: { username }
            });
            if (existingUser && existingUser.id !== userId) {
                throw (0, errorHandler_1.createError)('Username is already taken', 400);
            }
            const updatedUser = await database_1.prisma.users.update({
                where: { id: userId },
                data: { username },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    updatedAt: true
                }
            });
            res.json({
                success: true,
                message: 'Username updated successfully',
                user: updatedUser
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.usersController = usersController;
//# sourceMappingURL=userController.js.map