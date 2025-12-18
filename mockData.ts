
import { User, Assignment, AssignmentStatus } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alice Student', email: 'alice@student.com', role: 'STUDENT', avatar: 'https://picsum.photos/seed/alice/100/100' },
  { id: '2', name: 'Bob Writer', email: 'bob@writer.com', role: 'WRITER', avatar: 'https://picsum.photos/seed/bob/100/100' },
  { id: '3', name: 'Charlie Admin', email: 'charlie@admin.com', role: 'ADMIN', avatar: 'https://picsum.photos/seed/charlie/100/100' },
  { id: '4', name: 'David Scholar', email: 'david@writer.com', role: 'WRITER', avatar: 'https://picsum.photos/seed/david/100/100' },
  { id: '5', name: 'Elena Pro', email: 'elena@writer.com', role: 'WRITER', avatar: 'https://picsum.photos/seed/elena/100/100' },
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asgn-1',
    title: 'Advanced Calculus Theory',
    description: 'Provide a detailed breakdown of partial differential equations.',
    studentId: '1',
    subject: 'Mathematics',
    budget: 150,
    status: AssignmentStatus.PENDING,
    deadline: '2024-12-30',
    files: [],
    createdAt: '2024-12-01T10:00:00Z',
    // Fix: Added missing paymentStatus property
    paymentStatus: 'UNPAID',
  },
  {
    id: 'asgn-2',
    title: 'Modern Literature Essay',
    description: 'Compare themes of isolation in Kafka and Camus.',
    studentId: '1',
    writerId: '2',
    subject: 'English Literature',
    budget: 85,
    status: AssignmentStatus.IN_PROGRESS,
    deadline: '2024-12-25',
    files: [],
    createdAt: '2024-11-15T10:00:00Z',
    // Fix: Added missing paymentStatus property
    paymentStatus: 'ESCROW',
  },
  {
    id: 'asgn-3',
    title: 'Chemistry Lab Report',
    description: 'Thermodynamics experiment results and analysis.',
    studentId: '1',
    writerId: '2',
    subject: 'Chemistry',
    budget: 120,
    status: AssignmentStatus.COMPLETED,
    deadline: '2024-11-20',
    files: [],
    submission: 'The thermodynamics of a closed system follows the first law...',
    createdAt: '2024-10-10T10:00:00Z',
    // Fix: Added missing paymentStatus property
    paymentStatus: 'RELEASED',
  },
  {
    id: 'asgn-4',
    title: 'Economics Market Analysis',
    description: 'Impact of inflation on consumer spending.',
    studentId: '1',
    writerId: '4',
    subject: 'Economics',
    budget: 200,
    status: AssignmentStatus.COMPLETED,
    deadline: '2024-10-05',
    files: [],
    submission: 'Inflationary pressures lead to a shift in consumer behavior...',
    createdAt: '2024-09-12T10:00:00Z',
    // Fix: Added missing paymentStatus property
    paymentStatus: 'RELEASED',
  },
  {
    id: 'asgn-5',
    title: 'World History Timeline',
    description: 'Key events of the Industrial Revolution.',
    studentId: '1',
    writerId: '5',
    subject: 'History',
    budget: 90,
    status: AssignmentStatus.COMPLETED,
    deadline: '2024-09-20',
    files: [],
    submission: 'The industrial revolution began in Britain in the late 1700s...',
    createdAt: '2024-08-05T10:00:00Z',
    // Fix: Added missing paymentStatus property
    paymentStatus: 'RELEASED',
  },
  {
    id: 'asgn-6',
    title: 'Biochemistry Protein Folding',
    description: 'Discussion on chaperones and protein stability.',
    studentId: '1',
    writerId: '4',
    subject: 'Biology',
    budget: 175,
    status: AssignmentStatus.COMPLETED,
    deadline: '2024-11-05',
    files: [],
    submission: 'Protein folding is a highly regulated process...',
    createdAt: '2024-10-25T10:00:00Z',
    // Fix: Added missing paymentStatus property
    paymentStatus: 'RELEASED',
  }
];
