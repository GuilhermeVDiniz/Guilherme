import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateChecklistDescription } from '../checklist';

// **Feature: churrasco-manager, Property 12: Checklist item description validation**
// **Validates: Requirements 7.2**
describe('Property 12: Checklist item description validation', () => {
  it('rejects empty or whitespace-only descriptions', () => {
    const whitespaceArb = fc.array(
      fc.constantFrom(' ', '\t', '\n', '\r'),
    ).map(chars => chars.join(''));

    fc.assert(
      fc.property(whitespaceArb, (desc) => {
        const result = validateChecklistDescription(desc);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('accepts non-empty descriptions with at least one non-whitespace character', () => {
    const nonEmptyArb = fc.string({ minLength: 1 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(nonEmptyArb, (desc) => {
        const result = validateChecklistDescription(desc);
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
