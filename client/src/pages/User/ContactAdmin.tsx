// src/pages/User/ContactAdmin.tsx
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { 
  ArrowLeft, Send, Paperclip, MessageSquare, 
  AlertCircle, CheckCircle, Loader, X, File
} from 'lucide-react';

const ContactAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { contactAdmin, loading, error } = useChat();
  const [message, setMessage] = useState<string>('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (!message.trim() && !attachment) return;
    
    try {
      setIsSending(true);
      
      await contactAdmin(message, attachment || undefined);
      
      // Show success message
      setSuccess(true);
      
      // Clear form
      setMessage('');
      clearAttachment();
      
      // Redirect to messages after a delay
      setTimeout(() => {
        navigate('/user/messages');
      }, 2000);
    } catch (err) {
      console.error('Error contacting admin:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/user/dashboard" className="flex items-center text-blue-600 mb-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                <MessageSquare size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Contact Admin</h1>
                <p className="text-sm text-gray-500">Send a message to our support team</p>
              </div>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
                <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-700">Your message has been sent successfully!</p>
                  <p className="text-green-600 text-sm mt-1">Redirecting to messages...</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How can we help you?"
                  required={!attachment}
                  disabled={isSending || success}
                ></textarea>
              </div>
              
              {/* Attachment section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment (Optional)
                </label>
                
                {attachment ? (
                  <div className="p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {attachmentPreview ? (
                          <div className="w-16 h-16 rounded-md overflow-hidden">
                            <img 
                              src={attachmentPreview} 
                              alt="Attachment Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                            <File size={24} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={clearAttachment}
                        className="p-1 text-gray-400 hover:text-gray-500"
                        disabled={isSending || success}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md">
                    <button
                      type="button"
                      onClick={handleAttachmentClick}
                      className="flex items-center text-blue-600 hover:text-blue-500"
                      disabled={isSending || success}
                    >
                      <Paperclip size={18} className="mr-2" />
                      <span>Add an attachment</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSending || success || (!message.trim() && !attachment)}
                >
                  {isSending ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactAdmin;