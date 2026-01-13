
import { User, Assignment, AssignmentStatus } from './types';

export const mockUsers: User[] = [
    {
        id: 'admin-1',
        name: 'Charlie Admin',
        email: 'charlie@admin.com',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        lastActive: new Date().toISOString()
    }
];

export const initialAssignments: Assignment[] = [];
