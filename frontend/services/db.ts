
import { User, Assignment, ChatMessage, Notification, Transaction, SystemLog } from '../types';
import { mockUsers, initialAssignments } from '../mockData';

const STORAGE_KEYS = {
  USERS: 'paperly_users_v3',
  ASSIGNMENTS: 'paperly_assignments_v3',
  MESSAGES: 'paperly_messages_v3',
  NOTIFICATIONS: 'paperly_notifications_v3',
  TRANSACTIONS: 'paperly_transactions_v3',
  LOGS: 'paperly_logs_v3'
};

class LocalDB {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(initialAssignments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    }
  }

  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private save<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getUsers(): User[] { return this.get<User>(STORAGE_KEYS.USERS); }
  saveUsers(data: User[]) { this.save(STORAGE_KEYS.USERS, data); }
  addUser(user: User) {
    const users = this.getUsers();
    users.push(user);
    this.save(STORAGE_KEYS.USERS, users);
  }

  getAssignments(): Assignment[] { return this.get<Assignment>(STORAGE_KEYS.ASSIGNMENTS); }
  saveAssignments(data: Assignment[]) { this.save(STORAGE_KEYS.ASSIGNMENTS, data); }

  getMessages(): ChatMessage[] { return this.get<ChatMessage>(STORAGE_KEYS.MESSAGES); }
  saveMessages(data: ChatMessage[]) { this.save(STORAGE_KEYS.MESSAGES, data); }

  getNotifications(): Notification[] { return this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS); }
  saveNotifications(data: Notification[]) { this.save(STORAGE_KEYS.NOTIFICATIONS, data); }

  getTransactions(): Transaction[] { return this.get<Transaction>(STORAGE_KEYS.TRANSACTIONS); }
  saveTransactions(data: Transaction[]) { this.save(STORAGE_KEYS.TRANSACTIONS, data); }

  getLogs(): SystemLog[] { return this.get<SystemLog>(STORAGE_KEYS.LOGS).slice(0, 50); }
  addLog(log: SystemLog) {
    const logs = this.getLogs();
    logs.unshift(log);
    this.save(STORAGE_KEYS.LOGS, logs.slice(0, 50));
  }
}

export const db = new LocalDB();
