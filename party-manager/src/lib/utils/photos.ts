import type { Photo, Event } from '../models/types';

export interface PhotoGroup {
  year: number;
  photos: Photo[];
}

/**
 * Groups photos by the year of their associated event.
 * Returns groups sorted by year descending (most recent first).
 * Photos whose event_id doesn't match any provided event are excluded.
 */
export function groupPhotosByYear(
  photos: Photo[],
  events: Event[]
): PhotoGroup[] {
  const eventMap = new Map<string, Event>();
  for (const event of events) {
    eventMap.set(event.id, event);
  }

  const yearMap = new Map<number, Photo[]>();

  for (const photo of photos) {
    const event = eventMap.get(photo.event_id);
    if (!event) continue;

    const year = new Date(event.event_date).getFullYear();
    if (isNaN(year)) continue;

    const group = yearMap.get(year);
    if (group) {
      group.push(photo);
    } else {
      yearMap.set(year, [photo]);
    }
  }

  return Array.from(yearMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, photos]) => ({ year, photos }));
}
