
export type UserRole = 'STUDENT' | 'WRITER' | 'ADMIN';

export enum AssignmentStatus {
  PENDING = 'PENDING',
  PENDING_REVIEW = 'PENDING_REVIEW', // New
  QUOTED = 'QUOTED', // New
  CONFIRMED = 'CONFIRMED', // New
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  REVISION = 'REVISION',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string; // New: Added for checking registered username
  role: UserRole;
  avatar?: string;
  balance?: number; // Simulated wallet
  lastActive?: string; // ISO timestamp
  handwriting_samples?: string[];
  address?: string; // New
  availability_status?: 'ONLINE' | 'BUSY' | 'OFFLINE'; // New
  average_rating?: number;
  is_verified?: boolean; // For verification system
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
  quoted_amount?: number; // New
  revision_count?: number; // New
  writer_comment?: string; // New
  quotingWriterId?: string; // New - to track who quoted
  provider?: User; // New - to match backend structure if needed
  rejectedBy?: string[]; // New - IDs of writers who rejected this
  attachment?: string | null; // New - URL/Path to attached file
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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
    file?: File;
  };
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
