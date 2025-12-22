
export type UserRole = 'STUDENT' | 'WRITER' | 'ADMIN';

export enum AssignmentStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  REVISION = 'REVISION'
}

export interface User {
  id:string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  balance?: number; // Simulated wallet
  lastActive?: string; // ISO timestamp
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  studentId: string;
  writerId?: string;
  deadline: string;
  status: AssignmentStatus;
  subject: string;
  budget: number;
  files: string[];
  submission?: string;
  feedback?: string;
  createdAt: string;
  paymentStatus: 'UNPAID' | 'ESCROW' | 'RELEASED';
}

export interface Transaction {
  id: string;
  assignmentId: string;
  amount: number;
  type: 'PAYMENT' | 'PAYOUT' | 'REFUND';
  timestamp: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface SystemLog {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  statusCode: number;
  duration: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  assignmentId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  replyTo?: {
    id: string;
    text: string;
    senderId: string;
  };
  attachment?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
