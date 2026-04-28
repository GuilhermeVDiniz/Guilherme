import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  computeUserBalance,
  computeEventTotals,
  createPaymentRecord,
  sortPaymentsByDate,
} from '../payments';
import type { Payment } from '../../models/types';

/** Helper: generate a valid Payment arbitrary */
const isoDateArb = fc
  .integer({ min: new Date('2000-01-01').getTime(), max: new Date('2100-01-01').getTime() })
  .map((ts) => new Date(ts).toISOString());

const paymentArb = (status?: 'pending' | 'confirmed') =>
  fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    event_id: fc.uuid(),
    amount: fc.double({ min: 0.01, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
    status: status ? fc.constant(status) : fc.constantFrom('pending' as const, 'confirmed' as const),
    created_at: isoDateArb,
  });

// **Feature: churrasco-manager, Property 3: Payment consistency invariant**
// **Validates: Requirements 2.3, 4.5, 10.3**
describe('Property 3: Payment consistency invariant', () => {
  it('sum of confirmed payments equals totalCollected and remaining equals totalRequired minus totalCollected', () => {
    fc.assert(
      fc.property(
        fc.array(paymentArb(), { minLength: 0, maxLength: 30 }),
        fc.double({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        (payments, totalRequired) => {
          const { totalCollected, remaining } = computeEventTotals(payments, totalRequired);

          const expectedCollected = payments
            .filter((p) => p.status === 'confirmed')
            .reduce((sum, p) => sum + p.amount, 0);

          // totalCollected must equal the sum of confirmed payments
          expect(Math.abs(totalCollected - expectedCollected)).toBeLessThan(1e-9);
          // remaining must equal max(0, totalRequired - totalCollected)
          expect(remaining).toBeCloseTo(Math.max(0, totalRequired - totalCollected), 5);
        }
      ),
      { numRuns: 100 }
    );
  });
});


// **Feature: churrasco-manager, Property 4: User balance computation**
// **Validates: Requirements 3.1**
describe('Property 4: User balance computation', () => {
  it('paid equals sum of confirmed payments and remaining is clamped to zero minimum', () => {
    fc.assert(
      fc.property(
        fc.array(paymentArb(), { minLength: 0, maxLength: 30 }),
        fc.double({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        (payments, totalRequired) => {
          const { paid, remaining } = computeUserBalance(payments, totalRequired);

          const expectedPaid = payments
            .filter((p) => p.status === 'confirmed')
            .reduce((sum, p) => sum + p.amount, 0);

          expect(Math.abs(paid - expectedPaid)).toBeLessThan(1e-9);
          expect(remaining).toBeCloseTo(Math.max(0, totalRequired - paid), 5);
          expect(remaining).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});


// **Feature: churrasco-manager, Property 5: Payment creation status by role**
// **Validates: Requirements 3.3, 4.4**
describe('Property 5: Payment creation status by role', () => {
  it('user role produces pending, admin role produces confirmed', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        fc.constantFrom('user' as const, 'admin' as const),
        (amount, role) => {
          const record = createPaymentRecord(amount, role);

          expect(record.amount).toBe(amount);

          if (role === 'admin') {
            expect(record.status).toBe('confirmed');
          } else {
            expect(record.status).toBe('pending');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


// **Feature: churrasco-manager, Property 7: Payment history chronological order**
// **Validates: Requirements 3.4**
describe('Property 7: Payment history chronological order', () => {
  it('returns payments sorted by created_at in ascending order with all required fields', () => {
    fc.assert(
      fc.property(
        fc.array(paymentArb(), { minLength: 0, maxLength: 30 }),
        (payments) => {
          const sorted = sortPaymentsByDate(payments);

          // Same length — no payments lost or added
          expect(sorted.length).toBe(payments.length);

          // Ascending chronological order
          for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1].created_at).getTime();
            const curr = new Date(sorted[i].created_at).getTime();
            expect(prev).toBeLessThanOrEqual(curr);
          }

          // Each entry has amount, date, and status
          for (const p of sorted) {
            expect(typeof p.amount).toBe('number');
            expect(typeof p.created_at).toBe('string');
            expect(['pending', 'confirmed']).toContain(p.status);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
