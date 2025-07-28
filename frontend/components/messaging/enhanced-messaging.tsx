import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Image, 
  File, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Archive,
  Star,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  Smile,
  Mic,
  MicOff
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'SYSTEM';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
    voiceDuration?: number;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  deliveredAt?: string;
  editedAt?: string;
  replyTo?: string;
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  displayName?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  role: string;
}

interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  timestamp: number;
}

interface VoiceRecording {
  isRecording: boolean;
  duration: number;
  audioBlob?: Blob;
}

export default function EnhancedMessaging() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording>({
    isRecording: false,
    duration: 0
  });
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to messaging server');
    });

    socketInstance.on('message:new', (message: Message) => {
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages(prev => [...prev, message]);
        // Mark as read if conversation is active
        socketInstance.emit('message:mark-read', { messageId: message.id });
      }
      
      // Update conversation list
      setConversations(prev => prev.map(conv => 
        conv.id === message.conversationId 
          ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
          : conv
      ));
    });

    socketInstance.on('message:delivered', (data: { messageId: string; deliveredAt: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, deliveredAt: data.deliveredAt }
          : msg
      ));
    });

    socketInstance.on('message:read', (data: { messageId: string; readAt: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, isRead: true, readAt: data.readAt }
          : msg
      ));
    });

    socketInstance.on('user:typing', (data: TypingIndicator) => {
      setTypingIndicators(prev => {
        const filtered = prev.filter(t => t.userId !== data.userId || t.conversationId !== data.conversationId);
        return [...filtered, data];
      });
    });

    socketInstance.on('user:stop-typing', (data: { userId: string; conversationId: string }) => {
      setTypingIndicators(prev => 
        prev.filter(t => !(t.userId === data.userId && t.conversationId === data.conversationId))
      );
    });

    socketInstance.on('user:online', (data: { userId: string }) => {
      setConversations(prev => prev.map(conv => ({
        ...conv,
        participants: conv.participants.map(p => 
          p.id === data.userId ? { ...p, isOnline: true } : p
        )
      })));
    });

    socketInstance.on('user:offline', (data: { userId: string; lastSeen: string }) => {
      setConversations(prev => prev.map(conv => ({
        ...conv,
        participants: conv.participants.map(p => 
          p.id === data.userId ? { ...p, isOnline: false, lastSeen: data.lastSeen } : p
        )
      })));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [activeConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up typing indicators older than 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingIndicators(prev => 
        prev.filter(t => now - t.timestamp < 5000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages);
        
        // Mark messages as read
        const unreadMessages = data.data.messages.filter((msg: Message) => !msg.isRead);
        if (unreadMessages.length > 0 && socket) {
          unreadMessages.forEach((msg: Message) => {
            socket.emit('message:mark-read', { messageId: msg.id });
          });
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversation(conversation);
    loadMessages(conversation.id);
    
    // Reset unread count
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !socket) return;

    const messageData = {
      conversationId: activeConversation.id,
      content: newMessage.trim(),
      messageType: 'TEXT',
      replyTo: replyingTo?.id
    };

    try {
      socket.emit('message:send', messageData);
      setNewMessage('');
      setReplyingTo(null);
      handleStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Message failed to send",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleTyping = () => {
    if (!activeConversation || !socket || isTyping) return;

    setIsTyping(true);
    socket.emit('user:typing', {
      conversationId: activeConversation.id,
      timestamp: Date.now()
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!activeConversation || !socket || !isTyping) return;

    setIsTyping(false);
    socket.emit('user:stop-typing', {
      conversationId: activeConversation.id
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!activeConversation || !socket) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', activeConversation.id);

      try {
        const response = await fetch('/api/uploads/message-attachment', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          
          const messageData = {
            conversationId: activeConversation.id,
            content: data.data.url,
            messageType: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              imageUrl: file.type.startsWith('image/') ? data.data.url : undefined
            }
          };

          socket.emit('message:send', messageData);
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
        toast({
          title: "File upload failed",
          description: "Please try again",
          variant: "destructive"
        });
      }
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setVoiceRecording(prev => ({ ...prev, audioBlob }));
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      setVoiceRecording({ isRecording: true, duration: 0 });
      
      // Start timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        setVoiceRecording(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000)
        }));
      }, 1000);

      // Stop recording after 5 minutes max
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopVoiceRecording();
        }
        clearInterval(timer);
      }, 300000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording failed",
        description: "Please check microphone permissions",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setVoiceRecording(prev => ({ ...prev, isRecording: false }));
    }
  };

  const sendVoiceMessage = async () => {
    if (!voiceRecording.audioBlob || !activeConversation || !socket) return;

    const formData = new FormData();
    formData.append('file', voiceRecording.audioBlob, 'voice-message.wav');
    formData.append('conversationId', activeConversation.id);

    try {
      const response = await fetch('/api/uploads/voice-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        const messageData = {
          conversationId: activeConversation.id,
          content: data.data.url,
          messageType: 'VOICE',
          metadata: {
            voiceDuration: voiceRecording.duration,
            fileSize: voiceRecording.audioBlob.size
          }
        };

        socket.emit('message:send', messageData);
        setVoiceRecording({ isRecording: false, duration: 0 });
      }
    } catch (error) {
      console.error('Failed to send voice message:', error);
      toast({
        title: "Voice message failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.isRead) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else if (message.deliveredAt) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    } else {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.displayName && p.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ScrollArea className="h-full">
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== 'current-user-id');
              const isTypingInThis = typingIndicators.some(t => t.conversationId === conversation.id);
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    activeConversation?.id === conversation.id 
                      ? 'bg-blue-100 border border-blue-200' 
                      : 'hover:bg-white'
                  }`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback>
                        {otherParticipant?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {otherParticipant?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {otherParticipant?.displayName || otherParticipant?.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {conversation.isStarred && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="text-xs px-1">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessage && formatMessageTime(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {isTypingInThis ? (
                          <span className="text-blue-500 italic">typing...</span>
                        ) : conversation.lastMessage ? (
                          conversation.lastMessage.messageType === 'TEXT' 
                            ? conversation.lastMessage.content
                            : `📎 ${conversation.lastMessage.messageType.toLowerCase()}`
                        ) : (
                          'No messages yet'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={activeConversation.participants[0]?.avatar} />
                  <AvatarFallback>
                    {activeConversation.participants[0]?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {activeConversation.participants[0]?.displayName || activeConversation.participants[0]?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {activeConversation.participants[0]?.isOnline 
                      ? 'Online' 
                      : `Last seen ${formatMessageTime(activeConversation.participants[0]?.lastSeen || '')}`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === 'current-user-id'; // Replace with actual user ID
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                        {replyingTo?.id === message.id && (
                          <div className="text-xs text-muted-foreground mb-1 px-3">
                            Replying to: {message.content.substring(0, 50)}...
                          </div>
                        )}
                        
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            isOwn
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          {message.messageType === 'TEXT' && (
                            <p className="text-sm">{message.content}</p>
                          )}
                          
                          {message.messageType === 'IMAGE' && (
                            <div>
                              <img 
                                src={message.metadata?.imageUrl} 
                                alt="Shared image"
                                className="rounded max-w-full"
                              />
                              {message.content && (
                                <p className="text-sm mt-2">{message.content}</p>
                              )}
                            </div>
                          )}
                          
                          {message.messageType === 'FILE' && (
                            <div className="flex items-center space-x-2">
                              <File className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium">{message.metadata?.fileName}</p>
                                <p className="text-xs opacity-75">
                                  {Math.round((message.metadata?.fileSize || 0) / 1024)}KB
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {message.messageType === 'VOICE' && (
                            <div className="flex items-center space-x-2">
                              <Mic className="h-4 w-4" />
                              <span className="text-sm">Voice message ({message.metadata?.voiceDuration}s)</span>
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex items-center space-x-1 mt-1 text-xs text-muted-foreground ${
                          isOwn ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {isOwn && getMessageStatus(message)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicators */}
                {typingIndicators
                  .filter(t => t.conversationId === activeConversation.id)
                  .map(indicator => (
                    <div key={indicator.userId} className="flex justify-start">
                      <div className="bg-gray-200 rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  ))
                }
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Preview */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Replying to:</span>
                  <span className="font-medium truncate max-w-xs">
                    {replyingTo.content.substring(0, 50)}...
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setReplyingTo(null)}
                >
                  ×
                </Button>
              </div>
            )}

            {/* Voice Recording UI */}
            {voiceRecording.isRecording && (
              <div className="px-4 py-3 bg-red-50 border-t flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording... {voiceRecording.duration}s</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={stopVoiceRecording}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={sendVoiceMessage}>
                    Send
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onBlur={handleStopTyping}
                    placeholder="Type a message..."
                    className="min-h-0 resize-none"
                    rows={1}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={startVoiceRecording}
                  onMouseUp={stopVoiceRecording}
                  onMouseLeave={stopVoiceRecording}
                >
                  {voiceRecording.isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
