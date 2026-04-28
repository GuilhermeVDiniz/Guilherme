'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Event, Payment, User } from '@/lib/models/types';
import { createClient } from '@/lib/supabase/client';
import { computeUserBalance, computeEventTotals } from '@/lib/services/payments';
import { validatePaymentAmount } from '@/lib/validators/payment';
import PageTransition from '@/components/PageTransition';

interface AdminClientProps {
  event: Event | null;
  users: User[];
  payments: Payment[];
}

export default function AdminClient({ event, users, payments }: AdminClientProps) {
  const router = useRouter();

  return (
    <PageTransition>
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
        ⚙️ Painel Admin
      </h1>

      <EventManagementSection event={event} />

      {event && (
        <UserManagementSection
          event={event}
          users={users}
          payments={payments}
        />
      )}
    </main>
    </PageTransition>
  );
}


/* ------------------------------------------------------------------ */
/* Event Management Section                                           */
/* Requirements: 4.1, 4.2, 8.1                                       */
/* ------------------------------------------------------------------ */

function EventManagementSection({ event }: { event: Event | null }) {
  const router = useRouter();
  const [name, setName] = useState(event?.name ?? '');
  const [eventDate, setEventDate] = useState(
    event ? event.event_date.slice(0, 10) : ''
  );
  const [eventTime, setEventTime] = useState(
    event ? event.event_date.slice(11, 16) : ''
  );
  const [location, setLocation] = useState(event?.location ?? '');
  const [totalRequired, setTotalRequired] = useState(
    event ? String(event.total_required) : ''
  );
  const [spotifyUrl, setSpotifyUrl] = useState(
    event?.spotify_playlist_url ?? ''
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('Nome do evento é obrigatório.');
      return;
    }
    if (!eventDate) {
      setError('Data do evento é obrigatória.');
      return;
    }
    if (!eventTime) {
      setError('Horário do evento é obrigatório.');
      return;
    }
    if (!location.trim()) {
      setError('Local do evento é obrigatório.');
      return;
    }
    const numTotal = parseFloat(totalRequired);
    if (isNaN(numTotal) || numTotal <= 0) {
      setError('Valor total deve ser um número positivo.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const isoDate = `${eventDate}T${eventTime}:00`;

    const payload = {
      name: name.trim(),
      event_date: isoDate,
      location: location.trim(),
      total_required: numTotal,
      spotify_playlist_url: spotifyUrl.trim() || null,
      is_active: true,
    };

    if (event) {
      // Update existing event
      const { error: updateError } = await supabase
        .from('eventos')
        .update(payload)
        .eq('id', event.id);

      setLoading(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccessMsg('Evento atualizado com sucesso.');
    } else {
      // Create new event
      const { error: insertError } = await supabase
        .from('eventos')
        .insert(payload);

      setLoading(false);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setSuccessMsg('Evento criado com sucesso.');
    }

    router.refresh();
  }

  return (
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-4"
      aria-label="Gerenciamento de evento"
    >
      <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
        {event ? 'Editar Evento' : 'Criar Novo Evento'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="event-name" className="block text-sm font-medium mb-1">
            Nome
          </label>
          <input
            id="event-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Churrasco de Fim de Ano"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="event-date" className="block text-sm font-medium mb-1">
              Data
            </label>
            <input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label htmlFor="event-time" className="block text-sm font-medium mb-1">
              Horário
            </label>
            <input
              id="event-time"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="event-location" className="block text-sm font-medium mb-1">
            Local
          </label>
          <input
            id="event-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Casa do João"
          />
        </div>

        <div>
          <label htmlFor="event-total" className="block text-sm font-medium mb-1">
            Valor Total Necessário (R$)
          </label>
          <input
            id="event-total"
            type="number"
            step="0.01"
            min="0.01"
            value={totalRequired}
            onChange={(e) => setTotalRequired(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="500.00"
          />
        </div>

        <div>
          <label htmlFor="event-spotify" className="block text-sm font-medium mb-1">
            Spotify Playlist URL (opcional)
          </label>
          <input
            id="event-spotify"
            type="url"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="https://open.spotify.com/playlist/..."
          />
        </div>

        {error && (
          <p className="text-xs text-[var(--destructive)]" role="alert">
            {error}
          </p>
        )}
        {successMsg && (
          <p className="text-xs text-[var(--success)]" role="status">
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading
            ? 'Salvando...'
            : event
              ? 'Atualizar Evento'
              : 'Criar Evento'}
        </button>
      </form>
    </section>
  );
}


/* ------------------------------------------------------------------ */
/* User Management Section                                            */
/* Requirements: 4.3, 4.4, 4.5                                       */
/* ------------------------------------------------------------------ */

function UserManagementSection({
  event,
  users,
  payments,
}: {
  event: Event;
  users: User[];
  payments: Payment[];
}) {
  const router = useRouter();
  const { totalCollected, remaining: eventRemaining } = computeEventTotals(
    payments,
    event.total_required
  );

  return (
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-4"
      aria-label="Gerenciamento de usuários"
    >
      <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
        Usuários e Pagamentos — {event.name}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="rounded-md bg-[var(--muted)] p-3 text-center">
          <p className="text-xs text-[var(--muted-foreground)]">Total Arrecadado</p>
          <p className="text-xl font-bold text-[var(--success)]">
            R$ {totalCollected.toFixed(2)}
          </p>
        </div>
        <div className="rounded-md bg-[var(--muted)] p-3 text-center">
          <p className="text-xs text-[var(--muted-foreground)]">Faltam</p>
          <p className="text-xl font-bold text-[var(--primary)]">
            R$ {eventRemaining.toFixed(2)}
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Nenhum usuário cadastrado.
        </p>
      ) : (
        <ul className="space-y-3">
          {users.map((user) => {
            const userPayments = payments.filter((p) => p.user_id === user.id);
            return (
              <UserRow
                key={user.id}
                user={user}
                userPayments={userPayments}
                event={event}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Individual User Row with payment actions                           */
/* ------------------------------------------------------------------ */

function UserRow({
  user,
  userPayments,
  event,
}: {
  user: User;
  userPayments: Payment[];
  event: Event;
}) {
  const router = useRouter();
  const { paid, remaining } = computeUserBalance(userPayments, event.total_required);
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    const validation = validatePaymentAmount(numericAmount);
    if (!validation.valid) {
      setError(validation.error ?? 'Valor inválido');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Admin creates confirmed payments (Requirement 4.4)
    const { error: insertError } = await supabase.from('pagamentos').insert({
      user_id: user.id,
      event_id: event.id,
      amount: numericAmount,
      status: 'confirmed',
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAmount('');
    setShowAddForm(false);
    router.refresh();
  }

  async function handleDeletePayment(paymentId: string) {
    const supabase = createClient();
    await supabase.from('pagamentos').delete().eq('id', paymentId);
    router.refresh();
  }

  const confirmedPayments = userPayments.filter((p) => p.status === 'confirmed');
  const pendingPayments = userPayments.filter((p) => p.status === 'pending');

  return (
    <li className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-4 space-y-3">
      {/* User info header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">
            Pago:{' '}
            <span className="font-semibold text-[var(--success)]">
              R$ {paid.toFixed(2)}
            </span>
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Restante: R$ {remaining.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payment list */}
      {userPayments.length > 0 && (
        <ul className="space-y-1">
          {userPayments.map((payment) => {
            const date = new Date(payment.created_at);
            const formatted = date.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            return (
              <li
                key={payment.id}
                className="flex items-center justify-between rounded bg-[var(--card)] px-3 py-2 text-xs"
              >
                <span>
                  R$ {payment.amount.toFixed(2)} — {formatted} —{' '}
                  <span
                    className={
                      payment.status === 'confirmed'
                        ? 'text-[var(--success)]'
                        : 'text-[var(--primary)]'
                    }
                  >
                    {payment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleDeletePayment(payment.id)}
                  className="text-[var(--destructive)] hover:opacity-70 transition-opacity"
                  aria-label={`Remover pagamento de R$ ${payment.amount.toFixed(2)}`}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add payment form */}
      {!showAddForm ? (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="text-xs text-[var(--primary)] hover:underline"
        >
          + Adicionar pagamento manual
        </button>
      ) : (
        <form onSubmit={handleAddPayment} className="flex gap-2 items-end">
          <div className="flex-1">
            <label
              htmlFor={`add-payment-${user.id}`}
              className="block text-xs font-medium mb-1"
            >
              Valor (R$)
            </label>
            <input
              id={`add-payment-${user.id}`}
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="0.00"
            />
            {error && (
              <p className="mt-1 text-xs text-[var(--destructive)]" role="alert">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? '...' : 'Adicionar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(false);
              setError(null);
              setAmount('');
            }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:bg-[var(--card)] transition-colors"
          >
            Cancelar
          </button>
        </form>
      )}
    </li>
  );
}
