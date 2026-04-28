import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Photo, Event } from '@/lib/models/types';
import GalleryClient from './GalleryClient';

export default async function GalleryPage() {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/');
  }

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
          <h1 className="text-3xl font-bold text-[var(--primary)]">📸 Galeria</h1>
          <p className="text-[var(--muted-foreground)]">
            Nenhum evento agendado no momento.
          </p>
        </div>
      </main>
    );
  }

  // Fetch all events for year grouping
  const { data: allEvents } = await supabase
    .from('eventos')
    .select('*');

  // Fetch all photos
  const { data: photos } = await supabase
    .from('fotos')
    .select('*');

  return (
    <GalleryClient
      activeEvent={event as Event}
      events={(allEvents ?? []) as Event[]}
      photos={(photos ?? []) as Photo[]}
      userId={authUser.id}
    />
  );
}
