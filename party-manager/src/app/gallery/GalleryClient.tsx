'use client';

import { useState } from 'react';
import type { Photo, Event } from '@/lib/models/types';
import { groupPhotosByYear } from '@/lib/utils/photos';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoGallery from '@/components/PhotoGallery';
import PageTransition from '@/components/PageTransition';
import AnimatedSection from '@/components/AnimatedSection';

interface GalleryClientProps {
  activeEvent: Event;
  events: Event[];
  photos: Photo[];
  userId: string;
}

export default function GalleryClient({
  activeEvent,
  events,
  photos: initialPhotos,
  userId,
}: GalleryClientProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const groups = groupPhotosByYear(photos, events);

  function handleUploadComplete() {
    // Re-fetch photos client-side after upload
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      supabase
        .from('fotos')
        .select('*')
        .then(({ data }) => {
          if (data) setPhotos(data as Photo[]);
        });
    });
  }

  return (
    <PageTransition>
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
        📸 Galeria de Fotos
      </h1>

      <AnimatedSection
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6"
        aria-label="Upload de fotos"
        delay={0.05}
      >
        <PhotoUpload
          eventId={activeEvent.id}
          userId={userId}
          onUploadComplete={handleUploadComplete}
        />
      </AnimatedSection>

      <AnimatedSection
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6"
        aria-label="Galeria de fotos"
        delay={0.1}
      >
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
          Fotos por Ano
        </h2>
        <PhotoGallery groups={groups} />
      </AnimatedSection>
    </main>
    </PageTransition>
  );
}
