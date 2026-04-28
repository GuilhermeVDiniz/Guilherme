import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { toggleChecklistItem } from '../checklist';

const isoDateArb = fc
  .integer({ min: new Date('2000-01-01').getTime(), max: new Date('2100-01-01').getTime() })
  .map((ts) => new Date(ts).toISOString());

const checklistItemArb = fc.record({
  id: fc.uuid(),
  event_id: fc.uuid(),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  is_completed: fc.boolean(),
  completed_by: fc.option(fc.uuid(), { nil: null }),
  created_at: isoDateArb,
});

// **Feature: churrasco-manager, Property 13: Checklist toggle round-trip**
// **Validates: Requirements 7.3**
describe('Property 13: Checklist toggle round-trip', () => {
  it('toggling a checklist item twice returns it to its original completion state', () => {
    fc.assert(
      fc.property(checklistItemArb, (item) => {
        const toggled = toggleChecklistItem(item);
        const toggledBack = toggleChecklistItem(toggled);

        expect(toggledBack.is_completed).toBe(item.is_completed);

        // Single toggle flips the value
        expect(toggled.is_completed).toBe(!item.is_completed);

        // All other fields remain unchanged
        expect(toggledBack.id).toBe(item.id);
        expect(toggledBack.event_id).toBe(item.event_id);
        expect(toggledBack.description).toBe(item.description);
        expect(toggledBack.completed_by).toBe(item.completed_by);
        expect(toggledBack.created_at).toBe(item.created_at);
      }),
      { numRuns: 100 }
    );
  });
});
