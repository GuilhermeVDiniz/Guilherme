import type { Payment } from '../models/types';

/**
 * Compute a user's balance for an event based on their confirmed payments.
 * Requirements: 3.1
 */
export function computeUserBalance(
  payments: Payment[],
  totalRequired: number
): { paid: number; remaining: number } {
  const paid = payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, totalRequired - paid);
  return { paid, remaining };
}

/**
 * Compute event-level totals from all confirmed payments.
 * Requirements: 2.3, 4.5, 10.3
 */
export function computeEventTotals(
  payments: Payment[],
  totalRequired: number
): { totalCollected: number; remaining: number } {
  const totalCollected = payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, totalRequired - totalCollected);
  return { totalCollected, remaining };
}

/**
 * Create a payment record with the correct status based on the creator's role.
 * Users create "pending" payments; admins create "confirmed" payments.
 * Requirements: 3.3, 4.4
 */
export function createPaymentRecord(
  amount: number,
  role: 'user' | 'admin'
): { amount: number; status: 'pending' | 'confirmed' } {
  return {
    amount,
    status: role === 'admin' ? 'confirmed' : 'pending',
  };
}

/**
 * Sort payments by creation date in ascending chronological order.
 * Requirements: 3.4
 */
export function sortPaymentsByDate(payments: Payment[]): Payment[] {
  return [...payments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}
