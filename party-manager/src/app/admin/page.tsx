import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Event, Payment, User } from '@/lib/models/types';
import AdminClient from './AdminClient';

/**
 * Admin page — server component with admin-only access check.
 * Non-admin users are redirected to the dashboard.
 * Requirements: 1.4
 */
export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/');
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // Redirect non-admin users to dashboard
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch active event (may be null)
  const { data: event } = await supabase
    .from('eventos')
    .select('*')
    .eq('is_active', true)
    .single();

  // Fetch all users
  const { data: allUsers } = await supabase
    .from('users')
    .select('*');

  // Fetch all payments for the active event (if exists)
  let allPayments: Payment[] = [];
  if (event) {
    const { data: payments } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('event_id', event.id);
    allPayments = (payments ?? []) as Payment[];
  }

  return (
    <AdminClient
      event={(event as Event) ?? null}
      users={(allUsers ?? []) as User[]}
      payments={allPayments}
    />
  );
}
