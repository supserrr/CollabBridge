"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const io_1 = require("../socket/io");
const errorHandler_1 = require("../middleware/errorHandler");
class MessageController {
    async sendMessage(req, res) {
        try {
            const { recipientId, content, messageType = client_1.MessageType.TEXT, eventId } = req.body;
            const io = (0, io_1.getIO)();
            const recipient = await database_1.prisma.users.findUnique({
                where: { id: recipientId },
            });
            if (!recipient) {
                throw (0, errorHandler_1.createError)('Recipient not found', 404);
            }
            // Find or create conversation
            const conversation = await database_1.prisma.conversations.create({
                data: {
                    users: {
                        connect: [
                            { id: req.user.id },
                            { id: recipientId }
                        ]
                    }
                }
            });
            const message = await database_1.prisma.messages.create({
                data: {
                    content,
                    messageType,
                    conversationId: conversation.id,
                    senderId: req.user.id,
                    recipientId,
                    metadata: eventId ? { eventId } : undefined
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
                            avatar: true,
                        },
                    },
                },
            });
            // Emit real-time message via Socket.IO
            io.to(`user:${recipientId}`).emit('newMessage', message);
            res.status(201).json({ message: 'Message sent successfully', data: message });
        }
        catch (error) {
            throw error;
        }
    }
    async getConversations(req, res) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const conversations = await database_1.prisma.conversations.findMany({
                where: {
                    users: {
                        some: {
                            id: req.user.id
                        }
                    }
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            isActive: true
                        }
                    },
                    messages: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 1,
                        include: {
                            users_messages_senderIdTousers: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                skip,
                take: Number(limit)
            });
            const conversationDetails = await Promise.all(conversations.map(async (conv) => {
                const otherusers = conv.users.find(p => p.id !== req.user.id);
                const unreadCount = await database_1.prisma.messages.count({
                    where: {
                        conversationId: conv.id,
                        recipientId: req.user.id,
                        isRead: false,
                    },
                });
                return {
                    id: conv.id,
                    otherusers,
                    lastMessage: conv.messages[0],
                    unreadCount,
                    updatedAt: conv.updatedAt
                };
            }));
            res.json({
                conversations: conversationDetails,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const [messages, total] = await Promise.all([
                database_1.prisma.messages.findMany({
                    where: {
                        conversationId
                    },
                    include: {
                        users_messages_senderIdTousers: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        },
                        users_messages_recipientIdTousers: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: Number(limit),
                }),
                database_1.prisma.messages.count({
                    where: {
                        conversationId
                    }
                }),
            ]);
            // Mark messages as read
            await database_1.prisma.messages.updateMany({
                where: {
                    conversationId,
                    recipientId: req.user.id,
                    isRead: false,
                },
                data: { isRead: true },
            });
            res.json({
                messages: messages.reverse(),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async markAsRead(req, res) {
        try {
            const { messageId } = req.params;
            const message = await database_1.prisma.messages.findUnique({
                where: { id: messageId },
            });
            if (!message) {
                throw (0, errorHandler_1.createError)('Message not found', 404);
            }
            if (message.recipientId !== req.user.id) {
                throw (0, errorHandler_1.createError)('Not authorized to mark this message as read', 403);
            }
            await database_1.prisma.messages.update({
                where: { id: messageId },
                data: { isRead: true },
            });
            res.json({ message: 'Message marked as read' });
        }
        catch (error) {
            throw error;
        }
    }
    async getUnreadCount(req, res) {
        try {
            const unreadCount = await database_1.prisma.messages.count({
                where: {
                    recipientId: req.user.id,
                    isRead: false,
                },
            });
            res.json({ unreadCount });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.MessageController = MessageController;
//# sourceMappingURL=MessageController.js.map