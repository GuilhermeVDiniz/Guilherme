import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateCountdown } from '../countdown';

// **Feature: churrasco-manager, Property 2: Countdown calculation correctness**
// **Validates: Requirements 2.2**
describe('Property 2: Countdown calculation correctness', () => {
  it('returns non-negative values and reconstructing from components matches the original difference (within 1s)', () => {
    fc.assert(
      fc.property(
        // targetDate in the future relative to now
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }).filter(d => !isNaN(d.getTime())),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }).filter(d => !isNaN(d.getTime())),
        (a, b) => {
          // Ensure targetDate > now
          const [now, targetDate] = a < b ? [a, b] : [b, a];
          if (now.getTime() === targetDate.getTime()) return; // skip equal dates

          const result = calculateCountdown(targetDate, now);

          // All values are non-negative
          expect(result.days).toBeGreaterThanOrEqual(0);
          expect(result.hours).toBeGreaterThanOrEqual(0);
          expect(result.minutes).toBeGreaterThanOrEqual(0);
          expect(result.seconds).toBeGreaterThanOrEqual(0);

          // Hours, minutes, seconds are within their natural bounds
          expect(result.hours).toBeLessThan(24);
          expect(result.minutes).toBeLessThan(60);
          expect(result.seconds).toBeLessThan(60);

          // Reconstructing the total seconds from components should match the actual difference (within 1s)
          const reconstructedSeconds =
            result.days * 86400 +
            result.hours * 3600 +
            result.minutes * 60 +
            result.seconds;

          const actualDiffSeconds = Math.floor(
            (targetDate.getTime() - now.getTime()) / 1000
          );

          expect(Math.abs(reconstructedSeconds - actualDiffSeconds)).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns all zeros when targetDate is in the past or equal to now', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }).filter(d => !isNaN(d.getTime())),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }).filter(d => !isNaN(d.getTime())),
        (a, b) => {
          // Ensure now >= targetDate
          const [targetDate, now] = a < b ? [a, b] : [b, a];

          const result = calculateCountdown(targetDate, now);

          expect(result.days).toBe(0);
          expect(result.hours).toBe(0);
          expect(result.minutes).toBe(0);
          expect(result.seconds).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
