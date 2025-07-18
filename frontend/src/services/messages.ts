import api, { handleApiResponse, handleApiError } from '../lib/api';
import type { 
  Message, 
  Conversation, 
  MessageType, 
  ApiResponse 
} from '../types';

class MessageService {
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get<ApiResponse<Conversation[]>>('/messages/conversations');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getConversationMessages(conversationId: string, page = 1, limit = 50): Promise<Message[]> {
    try {
      const response = await api.get<ApiResponse<Message[]>>(`/messages/conversations/${conversationId}/messages`, {
        params: { page, limit }
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async sendMessage(data: {
    conversationId?: string;
    recipientId?: string;
    content: string;
    messageType?: MessageType;
    attachments?: File[];
  }): Promise<Message> {
    try {
      const formData = new FormData();
      
      // Append text fields
      if (data.conversationId) formData.append('conversationId', data.conversationId);
      if (data.recipientId) formData.append('recipientId', data.recipientId);
      formData.append('content', data.content);
      if (data.messageType) formData.append('messageType', data.messageType);

      // Append attachments
      if (data.attachments) {
        Array.from(data.attachments).forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await api.post<ApiResponse<Message>>('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await api.patch(`/messages/conversations/${conversationId}/read`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await api.delete(`/messages/${messageId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>('/messages/unread-count');
      const data = handleApiResponse(response);
      return data.count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async searchMessages(query: string): Promise<Message[]> {
    try {
      const response = await api.get<ApiResponse<Message[]>>('/messages/search', {
        params: { q: query }
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createConversation(participantIds: string[]): Promise<Conversation> {
    try {
      const response = await api.post<ApiResponse<Conversation>>('/messages/conversations', {
        participantIds
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new MessageService();
