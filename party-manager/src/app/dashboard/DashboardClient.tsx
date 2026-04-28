'use client';

import type { Event, Payment, User } from '@/lib/models/types';
import { computeEventTotals } from '@/lib/services/payments';
import { computeRanking } from '@/lib/services/ranking';
import CountdownTimer from '@/components/CountdownTimer';
import RankingList from '@/components/RankingList';
import SpotifyEmbed from '@/components/SpotifyEmbed';
import CommentFeed from '@/components/CommentFeed';
import PageTransition from '@/components/PageTransition';
import AnimatedSection from '@/components/AnimatedSection';

interface DashboardClientProps {
  event: Event;
  payments: Payment[];
  users: Pick<User, 'id' | 'name'>[];
  userName: string;
  userId: string;
}

export default function DashboardClient({
  event,
  payments,
  users,
  userName,
  userId,
}: DashboardClientProps) {
  const { totalCollected, remaining } = computeEventTotals(
    payments,
    event.total_required
  );
  const ranking = computeRanking(payments, users);

  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <PageTransition>
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
          🔥 {event.name}
        </h1>
        <span className="text-sm text-[var(--muted-foreground)]">
          Olá, {userName}
        </span>
      </div>

      {/* Event Info */}
      <AnimatedSection
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-3"
        aria-label="Informações do evento"
        delay={0.05}
      >
        <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
          Detalhes do Evento
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[var(--muted-foreground)]">Data:</span>{' '}
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Horário:</span>{' '}
            {formattedTime}
          </div>
          <div className="sm:col-span-2">
            <span className="text-[var(--muted-foreground)]">Local:</span>{' '}
            {event.location}
          </div>
        </div>
      </AnimatedSection>

      {/* Countdown */}
      <CountdownTimer targetDate={eventDate} />

      {/* Financial Summary */}
      <AnimatedSection
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-3"
        aria-label="Resumo financeiro"
        delay={0.1}
      >
        <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
          Resumo Financeiro
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-md bg-[var(--muted)] p-3 text-center">
            <p className="text-xs text-[var(--muted-foreground)]">Total Necessário</p>
            <p className="text-xl font-bold">
              R$ {event.total_required.toFixed(2)}
            </p>
          </div>
          <div className="rounded-md bg-[var(--muted)] p-3 text-center">
            <p className="text-xs text-[var(--muted-foreground)]">Total Arrecadado</p>
            <p className="text-xl font-bold text-[var(--success)]">
              R$ {totalCollected.toFixed(2)}
            </p>
          </div>
          <div className="rounded-md bg-[var(--muted)] p-3 text-center">
            <p className="text-xs text-[var(--muted-foreground)]">Faltam</p>
            <p className="text-xl font-bold text-[var(--primary)]">
              R$ {remaining.toFixed(2)}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Ranking */}
      <RankingList ranking={ranking} />

      {/* Comments */}
      <CommentFeed eventId={event.id} userId={userId} userName={userName} />

      {/* Spotify Embed */}
      {event.spotify_playlist_url && (
        <SpotifyEmbed playlistUrl={event.spotify_playlist_url} />
      )}
    </main>
    </PageTransition>
  );
}
