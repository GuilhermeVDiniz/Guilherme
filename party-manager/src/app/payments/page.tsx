import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Event, Payment } from '@/lib/models/types';
import PaymentsClient from './PaymentsClient';

export default async function PaymentsPage() {
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
          <h1 className="text-3xl font-bold text-[var(--primary)]">🔥 Pagamentos</h1>
          <p className="text-[var(--muted-foreground)]">
            Nenhum evento agendado no momento.
          </p>
        </div>
      </main>
    );
  }

  // Fetch user payments for this event
  const { data: userPayments } = await supabase
    .from('pagamentos')
    .select('*')
    .eq('user_id', authUser.id)
    .eq('event_id', event.id);

  return (
    <PaymentsClient
      event={event as Event}
      payments={(userPayments ?? []) as Payment[]}
      userId={authUser.id}
      userRole={(profile?.role ?? 'user') as 'user' | 'admin'}
    />
  );
}
