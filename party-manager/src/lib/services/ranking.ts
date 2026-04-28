import type { Payment, User, RankingEntry } from '../models/types';

/**
 * Compute the contribution ranking for an event.
 * Only confirmed payments count. Users are sorted by total paid descending.
 * The user(s) with the highest total receive the "Pagador Oficial do Churras" badge.
 * Requirements: 6.1, 6.2
 */
export function computeRanking(
  payments: Payment[],
  users: Pick<User, 'id' | 'name'>[]
): RankingEntry[] {
  // Sum confirmed payments per user
  const totals = new Map<string, number>();
  for (const p of payments) {
    if (p.status === 'confirmed') {
      totals.set(p.user_id, (totals.get(p.user_id) ?? 0) + p.amount);
    }
  }

  // Build entries for users that have at least one confirmed payment
  const entries: RankingEntry[] = [];
  for (const user of users) {
    const totalPaid = totals.get(user.id) ?? 0;
    if (totalPaid > 0) {
      entries.push({
        user_id: user.id,
        user_name: user.name,
        total_paid: totalPaid,
        rank: 0,
        is_top_contributor: false,
      });
    }
  }

  // Sort descending by total_paid
  entries.sort((a, b) => b.total_paid - a.total_paid);

  // Assign ranks and badge
  const topAmount = entries.length > 0 ? entries[0].total_paid : 0;
  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
    entries[i].is_top_contributor = entries[i].total_paid === topAmount;
  }

  return entries;
}
