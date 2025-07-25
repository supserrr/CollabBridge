"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioController = void 0;
const database_1 = require("../../config/database");
const errorHandler_1 = require("../../middleware/errorHandler");
class PortfolioController {
    // Get public portfolio by username
    async getPortfolio(req, res) {
        try {
            const { username } = req.params;
            const user = await database_1.prisma.users.findUnique({
                where: { username },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    displayName: true,
                    bio: true,
                    avatar: true,
                    location: true,
                    isPublic: true,
                    createdAt: true,
                    projects: {
                        where: { isPublic: true },
                        orderBy: [
                            { isFeatured: 'desc' },
                            { sortOrder: 'asc' },
                            { createdAt: 'desc' }
                        ],
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            imageUrl: true,
                            projectUrl: true,
                            tags: true,
                            isFeatured: true,
                            viewCount: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                    creative_profiles: {
                        select: {
                            categories: true,
                            skills: true,
                            hourlyRate: true,
                            experience: true,
                            portfolioLinks: true
                        }
                    }
                }
            });
            if (!user || !user.isPublic) {
                throw (0, errorHandler_1.createError)('Portfolio not found', 404);
            }
            // Track portfolio view
            const clientIp = req.ip || req.connection.remoteAddress || '';
            const userAgent = req.get('User-Agent') || '';
            const referrer = req.get('Referer') || '';
            await this.trackPortfolioView(user.id, clientIp, userAgent, referrer);
            res.json({
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    displayName: user.displayName || user.name,
                    bio: user.bio,
                    avatar: user.avatar,
                    location: user.location,
                    memberSince: user.createdAt,
                    projects: user.projects,
                    profile: user.creative_profiles
                }
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Get dashboard stats for authenticated user
    async getDashboardStats(req, res) {
        try {
            const userId = req.user.id;
            const { username } = req.params;
            // Verify ownership
            const user = await database_1.prisma.users.findUnique({
                where: { username },
                select: { id: true }
            });
            if (!user || user.id !== userId) {
                throw (0, errorHandler_1.createError)('Unauthorized', 403);
            }
            // Get stats
            const [totalProjects, totalViews, recentViews] = await Promise.all([
                database_1.prisma.projects.count({
                    where: { userId }
                }),
                database_1.prisma.portfolio_views.count({
                    where: { userId }
                }),
                database_1.prisma.portfolio_views.findMany({
                    where: { userId },
                    orderBy: { viewedAt: 'desc' },
                    take: 30,
                    select: {
                        viewedAt: true,
                        viewerIp: true
                    }
                })
            ]);
            // Calculate views in last 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const recentViewsCount = recentViews.filter(view => view.viewedAt >= thirtyDaysAgo).length;
            res.json({
                success: true,
                data: {
                    totalProjects,
                    totalViews,
                    recentViews: recentViewsCount,
                    viewsHistory: recentViews
                }
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Get all projects for dashboard (including private ones)
    async getDashboardProjects(req, res) {
        try {
            const userId = req.user.id;
            const { username } = req.params;
            // Verify ownership
            const user = await database_1.prisma.users.findUnique({
                where: { username },
                select: { id: true }
            });
            if (!user || user.id !== userId) {
                throw (0, errorHandler_1.createError)('Unauthorized', 403);
            }
            const projects = await database_1.prisma.projects.findMany({
                where: { userId },
                orderBy: [
                    { isFeatured: 'desc' },
                    { sortOrder: 'asc' },
                    { createdAt: 'desc' }
                ]
            });
            res.json({
                success: true,
                data: projects
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Create new project
    async createProject(req, res) {
        try {
            const userId = req.user.id;
            const { username } = req.params;
            const { title, description, imageUrl, projectUrl, tags, isPublic, isFeatured } = req.body;
            // Verify ownership
            const user = await database_1.prisma.users.findUnique({
                where: { username },
                select: { id: true }
            });
            if (!user || user.id !== userId) {
                throw (0, errorHandler_1.createError)('Unauthorized', 403);
            }
            const project = await database_1.prisma.projects.create({
                data: {
                    userId,
                    title,
                    description,
                    imageUrl,
                    projectUrl,
                    tags: tags || [],
                    isPublic: isPublic !== false, // default to true
                    isFeatured: isFeatured || false
                }
            });
            res.status(201).json({
                success: true,
                message: 'Project created successfully',
                data: project
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Update project
    async updateProject(req, res) {
        try {
            const userId = req.user.id;
            const { username, projectId } = req.params;
            const { title, description, imageUrl, projectUrl, tags, isPublic, isFeatured, sortOrder } = req.body;
            // Verify ownership
            const user = await database_1.prisma.users.findUnique({
                where: { username },
                select: { id: true }
            });
            if (!user || user.id !== userId) {
                throw (0, errorHandler_1.createError)('Unauthorized', 403);
            }
            // Verify project ownership
            const existingProject = await database_1.prisma.projects.findFirst({
                where: { id: projectId, userId }
            });
            if (!existingProject) {
                throw (0, errorHandler_1.createError)('Project not found', 404);
            }
            const project = await database_1.prisma.projects.update({
                where: { id: projectId },
                data: {
                    title,
                    description,
                    imageUrl,
                    projectUrl,
                    tags,
                    isPublic,
                    isFeatured,
                    sortOrder,
                    updatedAt: new Date()
                }
            });
            res.json({
                success: true,
                message: 'Project updated successfully',
                data: project
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Delete project
    async deleteProject(req, res) {
        try {
            const userId = req.user.id;
            const { username, projectId } = req.params;
            // Verify ownership
            const user = await database_1.prisma.users.findUnique({
                where: { username },
                select: { id: true }
            });
            if (!user || user.id !== userId) {
                throw (0, errorHandler_1.createError)('Unauthorized', 403);
            }
            // Verify project ownership and delete
            const deletedProject = await database_1.prisma.projects.deleteMany({
                where: { id: projectId, userId }
            });
            if (deletedProject.count === 0) {
                throw (0, errorHandler_1.createError)('Project not found', 404);
            }
            res.json({
                success: true,
                message: 'Project deleted successfully'
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Update portfolio settings
    async updatePortfolioSettings(req, res) {
        try {
            const userId = req.user.id;
            const { username } = req.params;
            const { displayName, bio, isPublic } = req.body;
            // Verify ownership
            const user = await database_1.prisma.users.findUnique({
                where: { username },
                select: { id: true }
            });
            if (!user || user.id !== userId) {
                throw (0, errorHandler_1.createError)('Unauthorized', 403);
            }
            const updatedUser = await database_1.prisma.users.update({
                where: { id: userId },
                data: {
                    displayName,
                    bio,
                    isPublic,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    bio: true,
                    isPublic: true,
                    updatedAt: true
                }
            });
            res.json({
                success: true,
                message: 'Portfolio settings updated successfully',
                data: updatedUser
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Private method to track portfolio views
    async trackPortfolioView(userId, viewerIp, userAgent, referrer) {
        try {
            // Check if this IP has viewed this portfolio in the last hour to avoid spam
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentView = await database_1.prisma.portfolio_views.findFirst({
                where: {
                    userId,
                    viewerIp,
                    viewedAt: { gte: oneHourAgo }
                }
            });
            if (!recentView) {
                await database_1.prisma.portfolio_views.create({
                    data: {
                        userId,
                        viewerIp,
                        userAgent,
                        referrer
                    }
                });
            }
        }
        catch (error) {
            // Don't throw error for tracking failures
            console.error('Failed to track portfolio view:', error);
        }
    }
}
exports.PortfolioController = PortfolioController;
//# sourceMappingURL=portfolioController.js.map