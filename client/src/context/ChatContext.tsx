// src/context/ChatContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage, Conversation, SendMessageData, MessageStatus } from '../types/userTypes';
import { useAuth } from './AuthContext';
import { apiClient } from '../api/header';
import { getStoredAuth } from '../services/auth';

// Define API endpoints for chat
const CHAT_API = {
  MESSAGES: '/api/chat/messages/',
  CONVERSATIONS: '/api/chat/conversations/',
  ADMIN_CONTACT: '/api/chat/admin-contact/',
};

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (data: SendMessageData) => Promise<void>;
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  fetchMessages: (conversationId: number) => Promise<void>;
  markAsRead: (messageIds: number[]) => Promise<void>;
  contactAdmin: (message: string, attachment?: File) => Promise<void>;
  hasUnreadMessages: boolean;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Set up periodic refresh for conversations
  useEffect(() => {
    let intervalId: number;
    
    if (isAuthenticated) {
      fetchConversations();
      
      // Refresh conversations every 30 seconds
      intervalId = window.setInterval(() => {
        fetchConversations();
      }, 30000);
    }
    
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isAuthenticated]);

  // Set up message polling for active conversation
  useEffect(() => {
    let intervalId: number;
    
    if (isAuthenticated && activeConversation) {
      fetchMessages(activeConversation.id);
      
      // Poll for new messages every 5 seconds
      intervalId = window.setInterval(() => {
        fetchMessages(activeConversation.id);
      }, 5000);
    }
    
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, activeConversation]);

  // Update unread messages status
  useEffect(() => {
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);
    setUnreadCount(totalUnread);
    setHasUnreadMessages(totalUnread > 0);
  }, [conversations]);

  const fetchConversations = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      
      const { token } = getStoredAuth();
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await apiClient.get(CHAT_API.CONVERSATIONS, token);
      setConversations(response);
      
      // If there's no active conversation but we have conversations, set the first one as active
      if (!activeConversation && response.length > 0) {
        setActiveConversation(response[0]);
      }
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
  if (!isAuthenticated) return;
  
  try {
    setLoading(true);
    
    const { token } = getStoredAuth();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await apiClient.get(`${CHAT_API.MESSAGES}?conversation=${conversationId}`, token);
    setMessages(response);
    
    // Mark messages as read - Add explicit ChatMessage type to msg parameter
    const unreadMessageIds = response
      .filter((msg: ChatMessage) => msg.receiver === user?.id && msg.status !== MessageStatus.READ)
      .map((msg: ChatMessage) => msg.id);
    
    if (unreadMessageIds.length > 0) {
      markAsRead(unreadMessageIds);
    }
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    setError(err.message || 'Failed to load messages');
  } finally {
    setLoading(false);
  }
};

  const sendMessage = async (data: SendMessageData) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      
      const { token } = getStoredAuth();
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      let formData;
      
      if (data.attachment) {
        formData = new FormData();
        formData.append('receiver_id', data.receiver_id.toString());
        formData.append('content', data.content);
        formData.append('attachment', data.attachment);
        
        // Use axios directly for FormData
        const response = await fetch(CHAT_API.MESSAGES, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
      } else {
        // Regular JSON request
        await apiClient.post(CHAT_API.MESSAGES, data, token);
      }
      
      // Refresh messages for the active conversation
      if (activeConversation) {
        fetchMessages(activeConversation.id);
      }
      
      // Also refresh conversations list to update the last message
      fetchConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageIds: number[]) => {
    if (!isAuthenticated || messageIds.length === 0) return;
    
    try {
      const { token } = getStoredAuth();
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      await apiClient.post(`${CHAT_API.MESSAGES}mark-read/`, { message_ids: messageIds }, token);
      
      // Update local messages status
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          messageIds.includes(msg.id) 
            ? { ...msg, status: MessageStatus.READ } 
            : msg
        )
      );
      
      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (err: any) {
      console.error('Error marking messages as read:', err);
      // Don't set error here as it's not critical
    }
  };

  const contactAdmin = async (message: string, attachment?: File) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      
      const { token } = getStoredAuth();
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      let formData;
      
      if (attachment) {
        formData = new FormData();
        formData.append('message', message);
        formData.append('attachment', attachment);
        
        // Use fetch directly for FormData
        const response = await fetch(CHAT_API.ADMIN_CONTACT, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to contact admin');
        }
      } else {
        // Regular JSON request
        await apiClient.post(CHAT_API.ADMIN_CONTACT, { message }, token);
      }
      
      // Refresh conversations to show the new admin conversation
      fetchConversations();
    } catch (err: any) {
      console.error('Error contacting admin:', err);
      setError(err.message || 'Failed to contact admin');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    sendMessage,
    fetchConversations,
    setActiveConversation,
    fetchMessages,
    markAsRead,
    contactAdmin,
    hasUnreadMessages,
    unreadCount
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;