import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { ChecklistItem } from '@/lib/models/types';
import ChecklistClient from './ChecklistClient';

/**
 * Checklist page — server component that fetches checklist data.
 * Requirements: 7.1, 7.2, 7.3
 */
export default async function ChecklistPage() {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/');
  }

  // Fetch user profile to determine role
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
          <h1 className="text-3xl font-bold text-[var(--primary)]">✅ Checklist</h1>
          <p className="text-[var(--muted-foreground)]">
            Nenhum evento agendado no momento.
          </p>
        </div>
      </main>
    );
  }

  // Fetch checklist items for the active event
  const { data: items } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true });

  const isAdmin = profile?.role === 'admin';

  return (
    <ChecklistClient
      eventId={event.id}
      items={(items ?? []) as ChecklistItem[]}
      isAdmin={isAdmin}
      userId={authUser.id}
    />
  );
}
