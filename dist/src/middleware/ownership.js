"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProjectOwnership = exports.verifyUsernameOwnership = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("./errorHandler");
const verifyUsernameOwnership = async (req, res, next) => {
    try {
        const { username } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            throw (0, errorHandler_1.createError)('Authentication required', 401);
        }
        const user = await database_1.prisma.users.findUnique({
            where: { username },
            select: { id: true }
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('User not found', 404);
        }
        if (user.id !== userId) {
            throw (0, errorHandler_1.createError)('Access denied', 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyUsernameOwnership = verifyUsernameOwnership;
const verifyProjectOwnership = async (req, res, next) => {
    try {
        const { username, projectId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            throw (0, errorHandler_1.createError)('Authentication required', 401);
        }
        // First verify username ownership
        const user = await database_1.prisma.users.findUnique({
            where: { username },
            select: { id: true }
        });
        if (!user || user.id !== userId) {
            throw (0, errorHandler_1.createError)('Access denied', 403);
        }
        // Then verify project ownership
        const project = await database_1.prisma.projects.findFirst({
            where: {
                id: projectId,
                userId
            }
        });
        if (!project) {
            throw (0, errorHandler_1.createError)('Project not found', 404);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyProjectOwnership = verifyProjectOwnership;
//# sourceMappingURL=ownership.js.map