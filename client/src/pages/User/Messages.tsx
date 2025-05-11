// src/pages/User/Messages.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { ChatMessage, Conversation, MessageStatus } from '../../types/userTypes';
import { 
  ArrowLeft, Send, Paperclip, Image, File, X, 
  Check, CheckCheck, Loader, AlertCircle, UserCircle,
  Download, Maximize2, MoreVertical
} from 'lucide-react';

const MessageStatusIcon: React.FC<{ status: MessageStatus }> = ({ status }) => {
  switch (status) {
    case MessageStatus.SENT:
      return <Check size={14} className="text-gray-400" />;
    case MessageStatus.DELIVERED:
      return <CheckCheck size={14} className="text-gray-400" />;
    case MessageStatus.READ:
      return <CheckCheck size={14} className="text-blue-500" />;
    case MessageStatus.FAILED:
      return <AlertCircle size={14} className="text-red-500" />;
    default:
      return null;
  }
};

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { 
    conversations, activeConversation, messages, loading, error,
    fetchConversations, fetchMessages, sendMessage, setActiveConversation, 
    markAsRead
  } = useChat();
  
  const [messageText, setMessageText] = useState<string>('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment(file);
      
      // For images, create a preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachmentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For other files, just show the name
        setAttachmentPreview(null);
      }
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!messageText.trim() && !attachment) || !activeConversation || !user) return;
    
    try {
      setIsSending(true);
      
      // Find the other participant's ID
      const receiverId = activeConversation.participants.find(id => id !== user.id);
      
      if (!receiverId) {
        throw new Error('Could not determine message recipient');
      }
      
      await sendMessage({
        receiver_id: receiverId,
        content: messageText,
        attachment: attachment || undefined
      });
      
      // Clear input after sending
      setMessageText('');
      clearAttachment();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Helper function to format date
  const formatMessageDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Same day, return time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Within last 7 days, show day of week
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return `${date.toLocaleDateString([], { weekday: 'short' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
    });
  };

  // Function to group messages by date
  const groupMessagesByDate = (messages: ChatMessage[]): { date: string; messages: ChatMessage[] }[] => {
    const groupedMessages: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });
    
    return Object.entries(groupedMessages).map(([date, msgs]) => ({
      date,
      messages: msgs
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/user/dashboard" className="flex items-center text-blue-600 mb-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Conversations Sidebar */}
            <div className="md:col-span-1 border-r border-gray-200 overflow-y-auto max-h-[70vh]">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Messages</h2>
              </div>
              
              {loading && conversations.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <Loader size={24} className="animate-spin text-blue-600" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No conversations yet.</p>
                  <p className="mt-2 text-sm">
                    <Link to="/user/contact-admin" className="text-blue-600">
                      Contact an admin
                    </Link>
                    {' '}to get started.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map(conversation => {
                    // Find other participant
                    const otherParticipantId = conversation.participants.find(id => id !== user?.id);
                    const lastMessage = conversation.last_message;
                    
                    return (
                      <div 
                        key={conversation.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          activeConversation?.id === conversation.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {/* User avatar */}
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                              <UserCircle size={24} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {lastMessage?.is_admin_message ? 'Admin' : 'User'}
                              </p>
                              {lastMessage && (
                                <p className="text-xs text-gray-500">
                                  {formatMessageDate(lastMessage.created_at)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 truncate">
                                {lastMessage ? 
                                  lastMessage.content || 'Attachment' : 
                                  'No messages yet'
                                }
                              </p>
                              {conversation.unread_count > 0 && (
                                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Chat Area */}
            <div className="md:col-span-3 flex flex-col h-[70vh]">
              {!activeConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-4">
                      <MessageStatusIcon status={MessageStatus.DELIVERED} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a conversation to view messages
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                          <UserCircle size={20} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {activeConversation.participants.includes(0) ? 'Admin' : 'User'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {activeConversation.participants.includes(0) ? 'Support Team' : 'User'}
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  
                  {/* Messages List */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {loading && messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader size={24} className="animate-spin text-blue-600" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <p>No messages yet.</p>
                        <p className="mt-2 text-sm">Send a message to start the conversation.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {groupMessagesByDate(messages).map(group => (
                          <div key={group.date}>
                            <div className="flex justify-center mb-4">
                              <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                {new Date(group.date).toLocaleDateString(undefined, { 
                                  weekday: 'long', 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: new Date().getFullYear() !== new Date(group.date).getFullYear() ? 'numeric' : undefined
                                })}
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              {group.messages.map(message => {
                                const isSentByMe = message.sender === user?.id;
                                
                                return (
                                  <div 
                                    key={message.id}
                                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div className={`max-w-[70%] ${isSentByMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} rounded-lg px-4 py-2 shadow-sm`}>
                                      {message.content && (
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                      )}
                                      
                                      {message.attachment_url && (
                                        <div className="mt-2">
                                          {message.attachment_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                            <div className="relative">
                                              <img 
                                                src={message.attachment_url} 
                                                alt="Attachment" 
                                                className="rounded-md max-h-48 max-w-full"
                                              />
                                              <a 
                                                href={message.attachment_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                                              >
                                                <Maximize2 size={16} />
                                              </a>
                                            </div>
                                          ) : (
                                            <div className="flex items-center space-x-2">
                                              <div className="p-2 bg-gray-100 rounded-full">
                                                <File size={16} className={isSentByMe ? 'text-blue-200' : 'text-blue-500'} />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs truncate">Attachment</p>
                                              </div>
                                              <a 
                                                href={message.attachment_url} 
                                                download
                                                className="p-1 rounded-full hover:bg-gray-200"
                                              >
                                                <Download size={16} className={isSentByMe ? 'text-blue-200' : 'text-blue-500'} />
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      <div className={`text-xs ${isSentByMe ? 'text-blue-200' : 'text-gray-500'} text-right mt-1`}>
                                        <div className="flex items-center justify-end space-x-1">
                                          <span>{formatMessageDate(message.created_at)}</span>
                                          {isSentByMe && (
                                            <MessageStatusIcon status={message.status} />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="border-t border-gray-200 p-4">
                    <form onSubmit={handleSubmit}>
                      {/* Attachment preview */}
                      {attachment && (
                        <div className="mb-2 p-2 bg-gray-100 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {attachmentPreview ? (
                                <div className="w-12 h-12 rounded-md overflow-hidden">
                                  <img 
                                    src={attachmentPreview} 
                                    alt="Attachment Preview" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
                                  <File size={24} className="text-gray-500" />
                                </div>
                              )}
                              <span className="text-sm truncate">{attachment.name}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={clearAttachment}
                              className="p-1 hover:bg-gray-200 rounded-full"
                            >
                              <X size={16} className="text-gray-500" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          type="button" 
                          onClick={handleAttachmentClick}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <Paperclip size={20} className="text-gray-500" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full p-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSending}
                          />
                        </div>
                        <button 
                          type="submit" 
                          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300"
                          disabled={isSending || (!messageText.trim() && !attachment)}
                        >
                          {isSending ? (
                            <Loader size={20} className="animate-spin" />
                          ) : (
                            <Send size={20} />
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

