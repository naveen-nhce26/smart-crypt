
export enum UserRole {
  ADMIN = 'Admin',
  LEVEL1 = 'Level 1',
  LEVEL2 = 'Level 2',
  LEVEL3 = 'Level 3',
  LEVEL4 = 'Level 4',
}

export enum UserStatus {
  ACTIVE = 'Active',
  BLOCKED = 'Blocked',
  SUSPENDED = 'Suspended',
}

export interface User {
  id: string;
  username: string;
  password?: string; // only for creation
  role: UserRole;
  roleName: string;
  status: UserStatus;
  organization?: string;
  attributes?: string[];
  department?: string;
}

export interface FileItem {
  id: string;
  filename: string;
  dateUploaded: string;
  uploader: string;
  uploaderId: string;
  isEncrypted?: boolean;
  sharedWith?: string[];
  decryptionKey?: string;
  downloadedBy?: string[];
  content?: string; // Base64 encoded content
  mimeType?: string;
  encryptionType?: 'standard' | 'abe';
  accessPolicy?: string;
  accessPolicyMode?: 'AND' | 'OR';
}

export enum ActivityType {
    UPLOAD = 'Upload',
    SHARE = 'Share',
    LOGIN = 'Login',
}

export interface ActivityLog {
  id:string;
  username: string;
  actionType: ActivityType;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ThreatAnalysisResult {
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  potentialThreats: string[];
  recommendations: string[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  read: boolean;
}