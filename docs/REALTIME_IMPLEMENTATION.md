# Real-time Messaging & Notifications Implementation

This document outlines the comprehensive real-time messaging and notification system implemented in CollabBridge.

## Features Implemented

### 🔔 Real-time Notifications
- **Toast notifications** with Sonner for immediate feedback
- **Notification dropdown** with unread count badges
- **Notification types**: Messages, bookings, applications, system alerts
- **Persistent storage** of notification state
- **Mark as read** functionality
- **Clear all** notifications option

### 💬 Real-time Messaging
- **Live messaging interface** with Socket.IO integration
- **Conversation management** with participant tracking
- **Online/offline status** indicators
- **Message read receipts** 
- **Real-time message delivery** and updates
- **Conversation search** and filtering
- **Message timestamps** with smart formatting

### 🌐 WebSocket Integration
- **Socket.IO client** with automatic reconnection
- **Authentication middleware** for secure connections
- **Room-based messaging** for private conversations
- **Online user tracking** across the platform
- **Connection status** monitoring and display

## Architecture

### Backend Socket Handlers
Located in `/backend/src/socket/`:
- `io.ts` - Socket.IO server initialization
- `handlers.ts` - Event handlers and authentication
- `events.ts` - Socket event definitions

### Frontend Components

#### Core Hooks
- **`useRealTimeUpdates`** - Main hook for Socket.IO integration
- **`useNotifications`** - Notification state management

#### UI Components
- **`NotificationDropdown`** - Header notification panel
- **`MessagingInterface`** - Chat interface component
- **`ConversationsList`** - Sidebar conversation list
- **`ConnectionStatus`** - WebSocket connection indicator

#### Providers
- **`NotificationProvider`** - Global notification context
- **`AuthProvider`** - User authentication state

## Socket Events

### Client → Server
```typescript
// Join/leave conversations
socket.emit('join_conversation', conversationId)
socket.emit('leave_conversation', conversationId)

// Send messages
socket.emit('send_message', {
  conversationId,
  content,
  messageType: 'text' | 'image' | 'file'
})

// Mark messages as read
socket.emit('mark_message_read', { messageId, conversationId })
```

### Server → Client
```typescript
// New messages
socket.on('new_message', (message: Message) => {})

// Notifications
socket.on('new_notification', (notification: Notification) => {})

// User status
socket.on('user_online', (userId: string) => {})
socket.on('user_offline', (userId: string) => {})

// Conversation updates
socket.on('conversation_updated', (conversation: Conversation) => {})
```

## Data Types

### Message Interface
```typescript
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  conversationId: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  senderName?: string;
  senderAvatar?: string;
}
```

### Notification Interface
```typescript
interface Notification {
  id: string;
  type: 'message' | 'booking' | 'application' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  data?: any;
}
```

### Conversation Interface
```typescript
interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}
```

## Configuration

### Environment Variables
```bash
# Backend
FRONTEND_URL=http://localhost:3000  # For CORS configuration
JWT_SECRET=your_jwt_secret          # For socket authentication

# Frontend  
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

### Dependencies Added
```json
{
  "socket.io-client": "^4.7.0",
  "@types/socket.io-client": "^3.0.0",
  "sonner": "^1.4.0"
}
```

## Usage

### Setting Up Real-time Updates
```tsx
import { useRealTimeUpdates } from '@/hooks/use-real-time-updates';

function MyComponent() {
  const {
    isConnected,
    notifications,
    messages,
    sendMessage,
    joinConversation,
    markMessageAsRead
  } = useRealTimeUpdates();

  // Component logic here
}
```

### Using Notifications
```tsx
import { useNotifications } from '@/components/providers/notification-provider';

function NotificationExample() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}: {notif.message}
        </div>
      ))}
    </div>
  );
}
```

## Security Features

### Authentication
- JWT token validation on socket connection
- User verification against active status
- Room-based access control for conversations

### Data Protection
- Message content sanitization
- User permission checking
- Rate limiting on message sending

## Performance Optimizations

### Client-side
- **Connection pooling** with automatic reconnection
- **Message caching** to reduce API calls
- **Lazy loading** of conversation history
- **Debounced typing** indicators

### Server-side
- **Room-based messaging** to limit broadcast scope
- **User session management** for online status
- **Message queuing** for offline users
- **Database indexing** for fast message retrieval

## Future Enhancements

### Planned Features
- [ ] File/image sharing in messages
- [ ] Typing indicators
- [ ] Message reactions and emoji support
- [ ] Voice/video calling integration
- [ ] Message search functionality
- [ ] Push notifications for mobile
- [ ] Message encryption
- [ ] Conversation threads/replies

### Technical Improvements
- [ ] Message pagination for large conversations
- [ ] Offline message queuing
- [ ] WebRTC for peer-to-peer messaging
- [ ] Message delivery confirmations
- [ ] Advanced notification filtering
- [ ] Real-time collaboration features

## Testing

### Manual Testing Checklist
- [ ] Socket connection establishment
- [ ] Message sending/receiving
- [ ] Notification delivery
- [ ] Online status updates
- [ ] Connection recovery after network issues
- [ ] Authentication on socket connection
- [ ] Cross-browser compatibility

### Performance Testing
- [ ] Message delivery latency
- [ ] Connection stability under load
- [ ] Memory usage monitoring
- [ ] Battery usage on mobile devices

## Deployment Notes

### Production Considerations
1. **Load Balancing**: Use Socket.IO adapter for multiple server instances
2. **Monitoring**: Implement socket connection metrics
3. **Scaling**: Consider Redis adapter for horizontal scaling
4. **Error Handling**: Comprehensive error logging and recovery
5. **Rate Limiting**: Implement message rate limits per user

### Environment Setup
1. Ensure WebSocket support in production environment
2. Configure proper CORS settings
3. Set up SSL/TLS for secure WebSocket connections
4. Monitor socket connection metrics

This implementation provides a solid foundation for real-time communication in CollabBridge, enhancing user engagement and collaboration between event planners and creative professionals.
