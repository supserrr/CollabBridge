"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const database_1 = require("../../config/database");
const errorHandler_1 = require("../../middleware/errorHandler");
class MessageController {
    async getConversations(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const conversations = await database_1.prisma.conversations.findMany({
                where: {
                    users: {
                        some: { id: userId },
                    },
                },
                skip,
                take: Number(limit),
                orderBy: { updatedAt: 'desc' },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            role: true,
                        },
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            content: true,
                            messageType: true,
                            createdAt: true,
                            users_messages_senderIdTousers: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            messages: {
                                where: {
                                    senderId: { not: userId },
                                    isRead: false,
                                },
                            },
                        },
                    },
                },
            });
            res.json({
                success: true,
                conversations,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getConversationMessages(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { page = 1, limit = 50 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            // Verify user is part of conversation
            const conversation = await database_1.prisma.conversations.findFirst({
                where: {
                    id,
                    users: {
                        some: { id: userId },
                    },
                },
            });
            if (!conversation) {
                throw (0, errorHandler_1.createError)('Conversation not found or access denied', 404);
            }
            const messages = await database_1.prisma.messages.findMany({
                where: { conversationId: id },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    users_messages_senderIdTousers: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            });
            res.json({
                success: true,
                messages: messages.reverse(), // Return in chronological order
            });
        }
        catch (error) {
            throw error;
        }
    }
    async sendMessage(req, res) {
        try {
            const userId = req.user.id;
            const { recipientId, content, messageType = 'TEXT', metadata } = req.body;
            // Find or create conversation
            let conversation = await database_1.prisma.conversations.findFirst({
                where: {
                    AND: [
                        { users: { some: { id: userId } } },
                        { users: { some: { id: recipientId } } },
                    ],
                },
            });
            if (!conversation) {
                conversation = await database_1.prisma.conversations.create({
                    data: {
                        users: {
                            connect: [{ id: userId }, { id: recipientId }],
                        },
                    },
                });
            }
            // Create message
            const message = await database_1.prisma.messages.create({
                data: {
                    conversationId: conversation.id,
                    senderId: userId,
                    recipientId,
                    content,
                    messageType,
                    metadata,
                },
                include: {
                    users_messages_senderIdTousers: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                    users_messages_recipientIdTousers: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            // Update conversation timestamp
            await database_1.prisma.conversations.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() },
            });
            res.status(201).json({
                success: true,
                message,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            // Update all unread messages in the conversation
            await database_1.prisma.messages.updateMany({
                where: {
                    conversationId: id,
                    recipientId: userId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
            res.json({
                success: true,
                message: 'Messages marked as read',
            });
        }
        catch (error) {
            throw error;
        }
    }
    async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const message = await database_1.prisma.messages.findUnique({
                where: { id },
            });
            if (!message) {
                throw (0, errorHandler_1.createError)('Message not found', 404);
            }
            if (message.senderId !== userId) {
                throw (0, errorHandler_1.createError)('Not authorized to delete this message', 403);
            }
            await database_1.prisma.messages.delete({
                where: { id },
            });
            res.json({
                success: true,
                message: 'Message deleted successfully',
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.MessageController = MessageController;
//# sourceMappingURL=messageController.js.map