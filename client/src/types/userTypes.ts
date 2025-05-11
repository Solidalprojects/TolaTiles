// src/types/userTypes.ts
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  role: UserRole;
  profile_image?: string;
  bio?: string;
  phone?: string;
  address?: string;
  created_at: string;
  last_login?: string;
}

export interface UserProfile {
  user: number;
  bio: string;
  profile_image: string;
  phone: string;
  address: string;
  preferences: Record<string, any>;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  address?: string;
  profile_image?: File;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// src/types/chatTypes.ts
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export interface ChatMessage {
  id: number;
  sender: number;
  sender_username: string;
  sender_profile_image?: string;
  receiver: number;
  receiver_username: string;
  content: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  status: MessageStatus;
  is_admin_message: boolean;
}

export interface Conversation {
  id: number;
  participants: number[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatAttachment {
  id: number;
  message: number;
  file: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

export interface SendMessageData {
  receiver_id: number;
  content: string;
  attachment?: File;
}

// Add role-based permissions type
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'all';
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.USER]: Permission[];
  [UserRole.GUEST]: Permission[];
}