import type { Comment } from '../models/types';

/**
 * Sort comments by creation date in descending (reverse chronological) order.
 * Requirements: 5.1
 */
export function sortCommentsReverseChronological(comments: Comment[]): Comment[] {
  return [...comments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
