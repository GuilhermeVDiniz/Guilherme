'use client';

import type { PhotoGroup } from '@/lib/utils/photos';

interface PhotoGalleryProps {
  groups: PhotoGroup[];
}

export default function PhotoGallery({ groups }: PhotoGalleryProps) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        Nenhuma foto ainda. Envie a primeira!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.year} aria-label={`Fotos de ${group.year}`}>
          <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-3">
            {group.year}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {group.photos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square overflow-hidden rounded-lg border border-[var(--border)]"
              >
                <img
                  src={photo.url}
                  alt={`Foto do evento`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
