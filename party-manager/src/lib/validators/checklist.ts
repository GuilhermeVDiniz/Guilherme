import type { ValidationResult } from './auth';

export function validateChecklistDescription(description: string): ValidationResult {
  if (description.trim().length === 0) {
    return { valid: false, error: 'Checklist item description must not be empty' };
  }
  return { valid: true };
}
