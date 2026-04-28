import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Event, Payment, User } from '@/lib/models/types';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // Fetch active event
  const { data: event } = await supabase
    .from('eventos')
    .select('*')
    .eq('is_active', true)
    .single();

  if (!event) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[var(--primary)]">🔥 Churrasco Manager</h1>
          <p className="text-[var(--muted-foreground)]">
            Nenhum evento agendado no momento.
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Peça ao admin para criar um evento.
          </p>
        </div>
      </main>
    );
  }

  // Fetch all confirmed payments for the event (for financial summary + ranking)
  const { data: allPayments } = await supabase
    .from('pagamentos')
    .select('*')
    .eq('event_id', event.id);

  // Fetch all users for ranking
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, name');

  return (
    <DashboardClient
      event={event as Event}
      payments={(allPayments ?? []) as Payment[]}
      users={(allUsers ?? []) as Pick<User, 'id' | 'name'>[]}
      userName={profile?.name ?? 'Usuário'}
      userId={authUser.id}
    />
  );
}
