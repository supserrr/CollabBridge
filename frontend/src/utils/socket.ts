import { io, Socket } from 'socket.io-client';
import { ENV, SOCKET_CONFIG } from '@/config';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = SOCKET_CONFIG.reconnectionAttempts;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = ENV.API_URL.replace('/api', '');
    
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: SOCKET_CONFIG.reconnectionDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: SOCKET_CONFIG.timeout,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  joinRoom(roomId: string) {
    this.emit('join_room', { roomId });
  }

  leaveRoom(roomId: string) {
    this.emit('leave_room', { roomId });
  }

  // Message-related methods
  joinConversation(conversationId: string) {
    this.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.emit('leave_conversation', conversationId);
  }

  sendMessage(data: { conversationId: string; content: string; messageType?: string }) {
    this.emit('send_message', data);
  }

  startTyping(conversationId: string) {
    this.emit('typing_start', conversationId);
  }

  stopTyping(conversationId: string) {
    this.emit('typing_stop', conversationId);
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
