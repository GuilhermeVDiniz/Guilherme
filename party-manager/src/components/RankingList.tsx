'use client';

import { motion } from 'framer-motion';
import type { RankingEntry } from '@/lib/models/types';

interface RankingListProps {
  ranking: RankingEntry[];
}

export default function RankingList({ ranking }: RankingListProps) {
  if (ranking.length === 0) {
    return null;
  }

  return (
    <motion.section
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-3"
      aria-label="Ranking de contribuições"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
    >
      <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
        Ranking de Contribuições
      </h2>
      <ul className="space-y-2">
        {ranking.map((entry) => (
          <li
            key={entry.user_id}
            className="flex items-center justify-between rounded-md bg-[var(--muted)] px-4 py-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[var(--muted-foreground)] w-6 text-center">
                {entry.rank}º
              </span>
              <span className="text-sm font-medium">
                {entry.user_name}
              </span>
              {entry.is_top_contributor && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-semibold text-[var(--primary-foreground)]"
                  title="Pagador Oficial do Churras"
                >
                  🏆 Pagador Oficial
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-[var(--success)]">
              R$ {entry.total_paid.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
