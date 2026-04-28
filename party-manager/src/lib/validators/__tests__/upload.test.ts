import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateFileUpload } from '../upload';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

// **Feature: churrasco-manager, Property 9: File upload validation**
// **Validates: Requirements 5.3**
describe('Property 9: File upload validation', () => {
  it('rejects files with disallowed MIME types', () => {
    const invalidMimeArb = fc.string({ minLength: 1 })
      .filter(s => !ALLOWED_TYPES.includes(s));

    fc.assert(
      fc.property(
        invalidMimeArb,
        fc.integer({ min: 0, max: MAX_SIZE }),
        (mime, size) => {
          const result = validateFileUpload(mime, size);
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects files exceeding 5 MB', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALLOWED_TYPES),
        fc.integer({ min: MAX_SIZE + 1, max: MAX_SIZE * 10 }),
        (mime, size) => {
          const result = validateFileUpload(mime, size);
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts files with allowed type and size within 5 MB', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALLOWED_TYPES),
        fc.integer({ min: 0, max: MAX_SIZE }),
        (mime, size) => {
          const result = validateFileUpload(mime, size);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
