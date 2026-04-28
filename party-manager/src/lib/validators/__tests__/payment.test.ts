import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validatePaymentAmount } from '../payment';

// **Feature: churrasco-manager, Property 6: Payment amount validation**
// **Validates: Requirements 3.5**
describe('Property 6: Payment amount validation', () => {
  it('rejects zero or negative amounts', () => {
    fc.assert(
      fc.property(
        fc.double({ max: 0, noNaN: true, noDefaultInfinity: true }),
        (amount) => {
          const result = validatePaymentAmount(amount);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts positive amounts', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        (amount) => {
          const result = validatePaymentAmount(amount);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects NaN and Infinity', () => {
    expect(validatePaymentAmount(NaN).valid).toBe(false);
    expect(validatePaymentAmount(Infinity).valid).toBe(false);
    expect(validatePaymentAmount(-Infinity).valid).toBe(false);
  });
});
