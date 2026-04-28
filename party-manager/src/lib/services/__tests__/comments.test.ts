import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sortCommentsReverseChronological } from '../comments';

const isoDateArb = fc
  .integer({ min: new Date('2000-01-01').getTime(), max: new Date('2100-01-01').getTime() })
  .map((ts) => new Date(ts).toISOString());

const commentArb = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  event_id: fc.uuid(),
  content: fc.string({ minLength: 1, maxLength: 200 }),
  created_at: isoDateArb,
});

// **Feature: churrasco-manager, Property 8: Comments reverse chronological order**
// **Validates: Requirements 5.1**
describe('Property 8: Comments reverse chronological order', () => {
  it('returns comments sorted by created_at in descending order without losing any', () => {
    fc.assert(
      fc.property(
        fc.array(commentArb, { minLength: 0, maxLength: 30 }),
        (comments) => {
          const sorted = sortCommentsReverseChronological(comments);

          // Same length — no comments lost or added
          expect(sorted.length).toBe(comments.length);

          // Descending chronological order
          for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1].created_at).getTime();
            const curr = new Date(sorted[i].created_at).getTime();
            expect(prev).toBeGreaterThanOrEqual(curr);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
