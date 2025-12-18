
import { User, Assignment, ChatMessage, Notification, AssignmentStatus, SystemLog } from '../types';
import { db } from './db';
import { paymentGateway } from './payment';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const logger = async (method: SystemLog['method'], endpoint: string, start: number, statusCode: number = 200) => {
  const log: SystemLog = {
    id: `log-${Date.now()}`,
    method,
    endpoint,
    statusCode,
    duration: Date.now() - start,
    timestamp: new Date().toISOString()
  };
  db.addLog(log);
};

export const api = {
  // Authentication
  async login(email: string): Promise<User> {
    const start = Date.now();
    await delay(800);
    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      await logger('POST', '/auth/login', start, 401);
      throw new Error('User not found');
    }

    // Update last active on login
    users[userIndex].lastActive = new Date().toISOString();
    db.saveUsers(users);

    await logger('POST', '/auth/login', start);
    return users[userIndex];
  },

  async register(user: User): Promise<User> {
    const start = Date.now();
    await delay(1000);
    const newUser = { ...user, lastActive: new Date().toISOString() };
    db.addUser(newUser);
    await logger('POST', '/auth/register', start);
    return newUser;
  },

  async getUser(id: string): Promise<User | null> {
    const start = Date.now();
    const user = db.getUsers().find(u => u.id === id) || null;
    await logger('GET', `/users/${id}`, start);
    return user;
  },

  async ping(id: string): Promise<void> {
    const users = db.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx].lastActive = new Date().toISOString();
      db.saveUsers(users);
    }
  },

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    const start = Date.now();
    await delay(400);
    const data = db.getAssignments();
    await logger('GET', '/assignments', start);
    return data;
  },

  async createAssignment(assignment: Assignment): Promise<Assignment> {
    const start = Date.now();
    await delay(1200);
    
    // Simulate Payment logic on creation (Escrow)
    await paymentGateway.processPayment(assignment.id, assignment.budget);
    
    const asgns = db.getAssignments();
    const newAsgn = { ...assignment, paymentStatus: 'ESCROW' as const };
    asgns.unshift(newAsgn);
    db.saveAssignments(asgns);
    
    await logger('POST', '/assignments', start);
    return newAsgn;
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const start = Date.now();
    await delay(600);
    const asgns = db.getAssignments();
    const idx = asgns.findIndex(a => a.id === id);
    if (idx === -1) {
      await logger('PUT', `/assignments/${id}`, start, 404);
      throw new Error('Assignment not found');
    }

    const updatedAsgn = { ...asgns[idx], ...updates };

    // Auto-release payment logic when completed
    if (updates.status === AssignmentStatus.COMPLETED && updatedAsgn.paymentStatus === 'ESCROW' && updatedAsgn.writerId) {
      await paymentGateway.releaseEscrow(id, updatedAsgn.budget, updatedAsgn.writerId);
      updatedAsgn.paymentStatus = 'RELEASED';
    }

    asgns[idx] = updatedAsgn;
    db.saveAssignments(asgns);
    await logger('PUT', `/assignments/${id}`, start);
    return asgns[idx];
  },

  // Chat
  async getAllMessages(): Promise<ChatMessage[]> {
    const start = Date.now();
    await delay(300);
    const data = db.getMessages();
    await logger('GET', '/messages', start);
    return data;
  },

  async sendMessage(message: ChatMessage): Promise<ChatMessage> {
    const start = Date.now();
    await delay(200);
    const msgs = db.getMessages();
    msgs.push(message);
    db.saveMessages(msgs);
    await logger('POST', '/messages', start);
    return message;
  },

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    const start = Date.now();
    await delay(200);
    const data = db.getNotifications().filter(n => n.userId === userId);
    await logger('GET', `/notifications/${userId}`, start);
    return data;
  },

  async addNotification(notif: Notification): Promise<Notification> {
    const notifs = db.getNotifications();
    notifs.unshift(notif);
    db.saveNotifications(notifs);
    return notif;
  },

  async markNotificationsRead(userId: string): Promise<void> {
    const start = Date.now();
    const notifs = db.getNotifications();
    const updated = notifs.map(n => n.userId === userId ? { ...n, isRead: true } : n);
    db.saveNotifications(updated);
    await logger('PUT', `/notifications/${userId}/read`, start);
  },

  // Backend Health (Admin only)
  async getSystemLogs(): Promise<SystemLog[]> {
    return db.getLogs();
  },

  async getTransactions(): Promise<any[]> {
    return db.getTransactions();
  }
};
