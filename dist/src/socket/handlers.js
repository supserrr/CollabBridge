"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSocketNotification = exports.setupSocketHandlers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const setupSocketHandlers = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await database_1.prisma.users.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, role: true, isActive: true },
            });
            if (!user || !user.isActive) {
                return next(new Error('users not found or inactive'));
            }
            socket.user = user;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`users connected: ${socket.user?.id}`);
        socket.join(`user_${socket.user?.id}`);
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
        });
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
        });
        socket.on('send_message', async (data) => {
            try {
                const { conversationId, content, messageType = 'TEXT' } = data;
                socket.to(`conversation_${conversationId}`).emit('new_message', {
                    id: 'temp_id',
                    content,
                    messageType,
                    users_messages_senderIdTousers: socket.user?.id,
                    conversationId,
                    createdAt: new Date().toISOString(),
                });
            }
            catch (error) {
                logger_1.logger.error('Socket message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        socket.on('typing_start', (conversationId) => {
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId: socket.user?.id,
                conversationId,
            });
        });
        socket.on('typing_stop', (conversationId) => {
            socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
                userId: socket.user?.id,
                conversationId,
            });
        });
        socket.on('disconnect', () => {
            logger_1.logger.info(`users disconnected: ${socket.user?.id}`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
const sendSocketNotification = (io, userId, notification) => {
    io.to(`user_${userId}`).emit('notification', notification);
};
exports.sendSocketNotification = sendSocketNotification;
//# sourceMappingURL=handlers.js.map