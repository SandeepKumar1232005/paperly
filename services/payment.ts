
import { db } from './db';
import { Transaction } from '../types';

export const paymentGateway = {
  async processPayment(assignmentId: string, amount: number): Promise<boolean> {
    const transaction: Transaction = {
      id: `tr-${Date.now()}`,
      assignmentId,
      amount,
      type: 'PAYMENT',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    };
    
    const transactions = db.getTransactions();
    transactions.unshift(transaction);
    db.saveTransactions(transactions);
    
    return true;
  },

  async releaseEscrow(assignmentId: string, amount: number, writerId: string): Promise<void> {
    // Release funds to writer balance
    const users = db.getUsers();
    const writerIdx = users.findIndex(u => u.id === writerId);
    if (writerIdx !== -1) {
      users[writerIdx].balance = (users[writerIdx].balance || 0) + (amount * 0.85); // 15% platform fee
      db.saveUsers(users);
    }

    const transaction: Transaction = {
      id: `payout-${Date.now()}`,
      assignmentId,
      amount: amount * 0.85,
      type: 'PAYOUT',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS'
    };

    const transactions = db.getTransactions();
    transactions.unshift(transaction);
    db.saveTransactions(transactions);
  }
};
