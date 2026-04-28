import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { groupPhotosByYear } from '../photos';
import type { Photo, Event } from '../../models/types';

// Arbitrary for generating an Event with a specific year
function eventArb(year: number): fc.Arbitrary<Event> {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    event_date: fc.constant(new Date(`${year}-06-15T12:00:00.000Z`).toISOString()),
    location: fc.string({ minLength: 1, maxLength: 30 }),
    total_required: fc.double({ min: 100, max: 10000, noNaN: true }),
    spotify_playlist_url: fc.constant(null),
    is_active: fc.boolean(),
    created_at: fc.constant(new Date().toISOString()),
  });
}

// Arbitrary for generating a Photo linked to a given event id
function photoArb(eventId: string): fc.Arbitrary<Photo> {
  return fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    event_id: fc.constant(eventId),
    storage_path: fc.string({ minLength: 1, maxLength: 50 }),
    url: fc.webUrl(),
    created_at: fc.constant(new Date().toISOString()),
  });
}

// **Feature: churrasco-manager, Property 10: Photos grouped by event year**
// **Validates: Requirements 5.4**
describe('Property 10: Photos grouped by event year', () => {
  it('every photo in a year group belongs to an event from that year', () => {
    // Generate 2-4 distinct years, each with an event and 1-5 photos
    const distinctYears = fc.uniqueArray(fc.integer({ min: 2000, max: 2099 }), { minLength: 2, maxLength: 4 });

    fc.assert(
      fc.property(distinctYears, (years) => {
        // We need to build events and photos synchronously from the years
        // Use deterministic data keyed on year
        const events: Event[] = years.map((year, i) => ({
          id: `event-${year}-${i}`,
          name: `Event ${year}`,
          event_date: new Date(`${year}-06-15T12:00:00.000Z`).toISOString(),
          location: 'Test Location',
          total_required: 1000,
          spotify_playlist_url: null,
          is_active: i === 0,
          created_at: new Date().toISOString(),
        }));

        const photos: Photo[] = [];
        for (const event of events) {
          const count = (parseInt(event.id.split('-')[1]) % 3) + 1; // 1-3 photos per event
          for (let j = 0; j < count; j++) {
            photos.push({
              id: `photo-${event.id}-${j}`,
              user_id: 'user-1',
              event_id: event.id,
              storage_path: `/photos/${event.id}/${j}.jpg`,
              url: `https://example.com/${event.id}/${j}.jpg`,
              created_at: new Date().toISOString(),
            });
          }
        }

        const groups = groupPhotosByYear(photos, events);

        // Build a lookup: event_id -> year
        const eventYearMap = new Map<string, number>();
        for (const event of events) {
          eventYearMap.set(event.id, new Date(event.event_date).getFullYear());
        }

        // Every photo in a group must belong to an event from that group's year
        for (const group of groups) {
          for (const photo of group.photos) {
            expect(eventYearMap.get(photo.event_id)).toBe(group.year);
          }
        }

        // All photos should be accounted for
        const totalGrouped = groups.reduce((sum, g) => sum + g.photos.length, 0);
        expect(totalGrouped).toBe(photos.length);

        // Groups should be sorted by year descending
        for (let i = 1; i < groups.length; i++) {
          expect(groups[i - 1].year).toBeGreaterThan(groups[i].year);
        }
      }),
      { numRuns: 100 }
    );
  });
});
