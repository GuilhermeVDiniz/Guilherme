import type { ValidationResult } from './auth';

export function validatePaymentAmount(amount: number): ValidationResult {
  if (!isFinite(amount) || amount <= 0) {
    return { valid: false, error: 'Payment amount must be a positive number' };
  }
  return { valid: true };
}
