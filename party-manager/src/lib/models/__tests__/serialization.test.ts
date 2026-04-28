import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  serializeModel,
  deserializeModel,
  validateUser,
  validateEvent,
  validatePayment,
  validateComment,
  validatePhoto,
  validateChecklistItem,
} from '../serialization';
import type { User, Event, Payment, Comment, Photo, ChecklistItem } from '../types';

// --- Arbitraries ---

const isoDateArb = fc.integer({ min: 946684800000, max: 4102444800000 })
  .map(ts => new Date(ts).toISOString());

const uuidArb = fc.uuid();

const userArb: fc.Arbitrary<User> = fc.record({
  id: uuidArb,
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: fc.constantFrom('user' as const, 'admin' as const),
  created_at: isoDateArb,
});

const eventArb: fc.Arbitrary<Event> = fc.record({
  id: uuidArb,
  name: fc.string({ minLength: 1, maxLength: 200 }),
  event_date: isoDateArb,
  location: fc.string({ minLength: 1, maxLength: 200 }),
  total_required: fc.double({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
  spotify_playlist_url: fc.option(fc.webUrl(), { nil: null }),
  is_active: fc.boolean(),
  created_at: isoDateArb,
});

const paymentArb: fc.Arbitrary<Payment> = fc.record({
  id: uuidArb,
  user_id: uuidArb,
  event_id: uuidArb,
  amount: fc.double({ min: 0.01, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
  status: fc.constantFrom('pending' as const, 'confirmed' as const),
  created_at: isoDateArb,
});

const commentArb: fc.Arbitrary<Comment> = fc.record({
  id: uuidArb,
  user_id: uuidArb,
  event_id: uuidArb,
  content: fc.string({ minLength: 1, maxLength: 500 }),
  created_at: isoDateArb,
});

const photoArb: fc.Arbitrary<Photo> = fc.record({
  id: uuidArb,
  user_id: uuidArb,
  event_id: uuidArb,
  storage_path: fc.string({ minLength: 1, maxLength: 300 }),
  url: fc.webUrl(),
  created_at: isoDateArb,
});

const checklistItemArb: fc.Arbitrary<ChecklistItem> = fc.record({
  id: uuidArb,
  event_id: uuidArb,
  description: fc.string({ minLength: 1, maxLength: 300 }),
  is_completed: fc.boolean(),
  completed_by: fc.option(uuidArb, { nil: null }),
  created_at: isoDateArb,
});

// **Feature: churrasco-manager, Property 14: Data model serialization round-trip**
// **Validates: Requirements 11.1, 11.2**
describe('Property 14: Data model serialization round-trip', () => {
  it('User round-trip', () => {
    fc.assert(
      fc.property(userArb, (user) => {
        const result = deserializeModel(serializeModel(user), validateUser);
        expect(result).toEqual(user);
      }),
      { numRuns: 100 }
    );
  });

  it('Event round-trip', () => {
    fc.assert(
      fc.property(eventArb, (event) => {
        const result = deserializeModel(serializeModel(event), validateEvent);
        expect(result).toEqual(event);
      }),
      { numRuns: 100 }
    );
  });

  it('Payment round-trip', () => {
    fc.assert(
      fc.property(paymentArb, (payment) => {
        const result = deserializeModel(serializeModel(payment), validatePayment);
        expect(result).toEqual(payment);
      }),
      { numRuns: 100 }
    );
  });

  it('Comment round-trip', () => {
    fc.assert(
      fc.property(commentArb, (comment) => {
        const result = deserializeModel(serializeModel(comment), validateComment);
        expect(result).toEqual(comment);
      }),
      { numRuns: 100 }
    );
  });

  it('Photo round-trip', () => {
    fc.assert(
      fc.property(photoArb, (photo) => {
        const result = deserializeModel(serializeModel(photo), validatePhoto);
        expect(result).toEqual(photo);
      }),
      { numRuns: 100 }
    );
  });

  it('ChecklistItem round-trip', () => {
    fc.assert(
      fc.property(checklistItemArb, (item) => {
        const result = deserializeModel(serializeModel(item), validateChecklistItem);
        expect(result).toEqual(item);
      }),
      { numRuns: 100 }
    );
  });
});
