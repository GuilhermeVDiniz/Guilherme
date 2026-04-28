import type { ChecklistItem } from '../models/types';

/**
 * Toggle the completion status of a checklist item.
 * Returns a new item with is_completed flipped.
 * Requirements: 7.3
 */
export function toggleChecklistItem(item: ChecklistItem): ChecklistItem {
  return {
    ...item,
    is_completed: !item.is_completed,
  };
}
