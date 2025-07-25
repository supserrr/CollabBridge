export interface SendMessageData {
    recipientId: string;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'BOOKING_REQUEST';
    metadata?: any;
}
export interface MessageFilters {
    conversationId?: string;
    page?: number;
    limit?: number;
}
export declare class MessageService {
    sendMessage(senderId: string, messageData: SendMessageData): Promise<{
        users_messages_recipientIdTousers: {
            name: string;
            id: string;
            avatar: string | null;
        };
        users_messages_senderIdTousers: {
            name: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        isRead: boolean;
        readAt: Date | null;
        conversationId: string;
        senderId: string;
        recipientId: string;
        content: string;
        messageType: import(".prisma/client").$Enums.MessageType;
    }>;
    getConversations(userId: string, page?: number, limit?: number): Promise<{
        conversations: {
            unreadCount: number;
            otherParticipant: {
                name: string;
                isActive: boolean;
                id: string;
                avatar: string | null;
            };
            lastMessage: {
                users_messages_senderIdTousers: {
                    name: string;
                    id: string;
                    avatar: string | null;
                };
            } & {
                id: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                isRead: boolean;
                readAt: Date | null;
                conversationId: string;
                senderId: string;
                recipientId: string;
                content: string;
                messageType: import(".prisma/client").$Enums.MessageType;
            };
            messages: ({
                users_messages_senderIdTousers: {
                    name: string;
                    id: string;
                    avatar: string | null;
                };
            } & {
                id: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                createdAt: Date;
                isRead: boolean;
                readAt: Date | null;
                conversationId: string;
                senderId: string;
                recipientId: string;
                content: string;
                messageType: import(".prisma/client").$Enums.MessageType;
            })[];
            users: {
                name: string;
                isActive: boolean;
                id: string;
                avatar: string | null;
            }[];
            _count: {
                messages: number;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getMessages(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
        messages: ({
            users_messages_senderIdTousers: {
                name: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            isRead: boolean;
            readAt: Date | null;
            conversationId: string;
            senderId: string;
            recipientId: string;
            content: string;
            messageType: import(".prisma/client").$Enums.MessageType;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    markMessagesAsRead(conversationId: string, userId: string): Promise<number>;
    deleteMessage(messageId: string, userId: string): Promise<boolean>;
    getUnreadCount(userId: string): Promise<number>;
    searchMessages(userId: string, query: string, conversationId?: string): Promise<{
        otherParticipant: {
            name: string;
            id: string;
            avatar: string | null;
        };
        conversations: {
            users: {
                name: string;
                id: string;
                avatar: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        users_messages_senderIdTousers: {
            name: string;
            id: string;
            avatar: string | null;
        };
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        isRead: boolean;
        readAt: Date | null;
        conversationId: string;
        senderId: string;
        recipientId: string;
        content: string;
        messageType: import(".prisma/client").$Enums.MessageType;
    }[]>;
}
export declare const messageService: MessageService;
//# sourceMappingURL=MessageService.d.ts.map