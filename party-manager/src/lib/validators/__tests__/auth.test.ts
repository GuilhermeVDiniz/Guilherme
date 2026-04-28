import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateEmail, validatePassword } from '../auth';

// **Feature: churrasco-manager, Property 1: Input validation rejects invalid credentials**
// **Validates: Requirements 1.3**
describe('Property 1: Input validation rejects invalid credentials', () => {
  it('rejects strings that are not valid email format', () => {
    const invalidEmailArb = fc.oneof(
      // No @ sign at all
      fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
      // Nothing before @
      fc.string({ minLength: 1 }).map(s => `@${s}`),
      // Nothing after @
      fc.string({ minLength: 1 }).map(s => `${s}@`),
      // Whitespace in email
      fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))
        .map(([a, b]) => `${a} ${b}@example.com`),
    );

    fc.assert(
      fc.property(invalidEmailArb, (email) => {
        const result = validateEmail(email);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('accepts valid email addresses', () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('rejects passwords shorter than 6 characters', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 5 }), (password) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('accepts passwords with 6 or more characters', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 6, maxLength: 200 }), (password) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
