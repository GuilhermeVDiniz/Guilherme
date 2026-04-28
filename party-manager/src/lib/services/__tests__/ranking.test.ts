import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeRanking } from '../ranking';
import type { Payment } from '../../models/types';

const isoDateArb = fc
  .integer({ min: new Date('2000-01-01').getTime(), max: new Date('2100-01-01').getTime() })
  .map((ts) => new Date(ts).toISOString());

const userArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
});

// **Feature: churrasco-manager, Property 11: Ranking sorted with badge assignment**
// **Validates: Requirements 6.1, 6.2**
describe('Property 11: Ranking sorted with badge assignment', () => {
  it('ranking is sorted descending by total_paid and badge is assigned to top contributor(s)', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 1, maxLength: 10 }).chain((users) => {
          // Generate confirmed payments referencing these users
          const paymentArb = fc.record({
            id: fc.uuid(),
            user_id: fc.constantFrom(...users.map((u) => u.id)),
            event_id: fc.constant('event-1'),
            amount: fc.double({ min: 0.01, max: 100_000, noNaN: true, noDefaultInfinity: true }),
            status: fc.constant('confirmed' as const),
            created_at: isoDateArb,
          });
          return fc.tuple(
            fc.constant(users),
            fc.array(paymentArb, { minLength: 1, maxLength: 30 })
          );
        }),
        ([users, payments]) => {
          const ranking = computeRanking(payments as Payment[], users);

          // Sorted descending by total_paid
          for (let i = 1; i < ranking.length; i++) {
            expect(ranking[i - 1].total_paid).toBeGreaterThanOrEqual(ranking[i].total_paid);
          }

          if (ranking.length > 0) {
            const topAmount = ranking[0].total_paid;

            // Badge assigned to exactly the user(s) with the highest total
            for (const entry of ranking) {
              if (entry.total_paid === topAmount) {
                expect(entry.is_top_contributor).toBe(true);
              } else {
                expect(entry.is_top_contributor).toBe(false);
              }
            }

            // At least one top contributor exists
            expect(ranking.some((e) => e.is_top_contributor)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
