import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import Layout from '@/components/layout/Layout'
import {
  ChatBubbleBottomCenterTextIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  type: 'TEXT' | 'IMAGE' | 'FILE'
  fileUrl?: string
}

interface Conversation {
  id: string
  participants: Array<{
    id: string
    name: string
    profileImage?: string
    role: string
  }>
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const { user } = useAuth()

  // Mock data
  const mockConversations: Conversation[] = [
    {
      id: '1',
      participants: [
        { id: '1', name: 'Sarah Johnson', role: 'Event Planner' },
        { id: '2', name: 'Alex Rivera', role: 'Photographer' }
      ],
      lastMessage: {
        id: '1',
        senderId: '1',
        content: 'Hi Alex! I loved your portfolio. Are you available for a wedding shoot on August 15th?',
        timestamp: '2025-07-19T10:30:00Z',
        type: 'TEXT'
      },
      unreadCount: 2,
      updatedAt: '2025-07-19T10:30:00Z'
    },
    {
      id: '2',
      participants: [
        { id: '1', name: 'Michael Chen', role: 'Event Planner' },
        { id: '3', name: 'Maya Patel', role: 'Decorator' }
      ],
      lastMessage: {
        id: '2',
        senderId: '3',
        content: 'Perfect! I can provide a detailed quote by tomorrow. The garden theme sounds amazing.',
        timestamp: '2025-07-19T09:15:00Z',
        type: 'TEXT'
      },
      unreadCount: 0,
      updatedAt: '2025-07-19T09:15:00Z'
    }
  ]

  const mockMessages: { [key: string]: Message[] } = {
    '1': [
      {
        id: '1',
        senderId: '1',
        content: 'Hi Alex! I loved your portfolio. Are you available for a wedding shoot on August 15th?',
        timestamp: '2025-07-19T10:30:00Z',
        type: 'TEXT'
      },
      {
        id: '2',
        senderId: '2',
        content: 'Hi Sarah! Thank you so much. Yes, I have that date available. Could you tell me more about the wedding details?',
        timestamp: '2025-07-19T10:35:00Z',
        type: 'TEXT'
      },
      {
        id: '3',
        senderId: '1',
        content: 'It\'s an outdoor garden wedding in Napa Valley for about 100 guests. The couple wants a mix of candid and formal shots.',
        timestamp: '2025-07-19T10:40:00Z',
        type: 'TEXT'
      }
    ],
    '2': [
      {
        id: '4',
        senderId: '1',
        content: 'Hi Maya! I saw your work on Instagram and I\'m planning a corporate event. Would love to discuss decoration ideas.',
        timestamp: '2025-07-19T09:00:00Z',
        type: 'TEXT'
      },
      {
        id: '5',
        senderId: '3',
        content: 'Perfect! I can provide a detailed quote by tomorrow. The garden theme sounds amazing.',
        timestamp: '2025-07-19T09:15:00Z',
        type: 'TEXT'
      }
    ]
  }

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setConversations(mockConversations)
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0].id)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      setMessages(mockMessages[conversationId] || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'TEXT'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update last message in conversation
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: message, updatedAt: message.timestamp }
        : conv
    ))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation)
  const otherParticipant = selectedConv?.participants.find(p => p.id !== user?.id)

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Please Sign In</h2>
            <p className="text-neutral-600">You need to be signed in to access messages.</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="h-screen bg-neutral-50 flex">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border-r border-neutral-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200">
            <h1 className="text-xl font-semibold text-neutral-900 mb-4">Messages</h1>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => {
                const otherUser = conversation.participants.find(p => p.id !== user.id)
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 ${
                      selectedConversation === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-neutral-300 rounded-full flex items-center justify-center">
                        {otherUser?.profileImage ? (
                          <img src={otherUser.profileImage} alt={otherUser.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <UserIcon className="h-6 w-6 text-neutral-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {otherUser?.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-xs text-neutral-500 mb-1">{otherUser?.role}</p>
                        <p className="text-sm text-neutral-600 truncate">
                          {conversation.lastMessage?.content}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center">
                <ChatBubbleBottomCenterTextIcon className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                <p className="text-neutral-600">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-neutral-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-neutral-300 rounded-full flex items-center justify-center">
                    {otherParticipant.profileImage ? (
                      <img src={otherParticipant.profileImage} alt={otherParticipant.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <UserIcon className="h-6 w-6 text-neutral-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">{otherParticipant.name}</h2>
                    <p className="text-sm text-neutral-500">{otherParticipant.role}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-neutral-200 text-neutral-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === user.id ? 'text-primary-100' : 'text-neutral-500'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-neutral-200 p-4">
                <div className="flex items-end space-x-2">
                  <button className="p-2 text-neutral-500 hover:text-neutral-700">
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-neutral-50">
              <div className="text-center">
                <ChatBubbleBottomCenterTextIcon className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Select a conversation</h3>
                <p className="text-neutral-600">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default MessagesPage
