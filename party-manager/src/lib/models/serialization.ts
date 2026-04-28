import type { User, Event, Payment, Comment, Photo, ChecklistItem } from './types';

export function serializeModel<T>(model: T): string {
  return JSON.stringify(model);
}

export function deserializeModel<T>(json: string, validator: (obj: unknown) => T): T {
  const parsed: unknown = JSON.parse(json);
  return validator(parsed);
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function assertString(obj: Record<string, unknown>, key: string): string {
  const val = obj[key];
  if (typeof val !== 'string') {
    throw new Error(`Expected string for "${key}", got ${typeof val}`);
  }
  return val;
}

function assertNumber(obj: Record<string, unknown>, key: string): number {
  const val = obj[key];
  if (typeof val !== 'number' || !isFinite(val)) {
    throw new Error(`Expected finite number for "${key}", got ${val}`);
  }
  return val;
}

function assertBoolean(obj: Record<string, unknown>, key: string): boolean {
  const val = obj[key];
  if (typeof val !== 'boolean') {
    throw new Error(`Expected boolean for "${key}", got ${typeof val}`);
  }
  return val;
}

function assertStringOrNull(obj: Record<string, unknown>, key: string): string | null {
  const val = obj[key];
  if (val === null) return null;
  if (typeof val !== 'string') {
    throw new Error(`Expected string or null for "${key}", got ${typeof val}`);
  }
  return val;
}

export function validateUser(obj: unknown): User {
  if (!isObject(obj)) throw new Error('Expected object for User');
  const role = assertString(obj, 'role');
  if (role !== 'user' && role !== 'admin') {
    throw new Error(`Invalid role: ${role}`);
  }
  return {
    id: assertString(obj, 'id'),
    email: assertString(obj, 'email'),
    name: assertString(obj, 'name'),
    role: role as 'user' | 'admin',
    created_at: assertString(obj, 'created_at'),
  };
}

export function validateEvent(obj: unknown): Event {
  if (!isObject(obj)) throw new Error('Expected object for Event');
  return {
    id: assertString(obj, 'id'),
    name: assertString(obj, 'name'),
    event_date: assertString(obj, 'event_date'),
    location: assertString(obj, 'location'),
    total_required: assertNumber(obj, 'total_required'),
    spotify_playlist_url: assertStringOrNull(obj, 'spotify_playlist_url'),
    is_active: assertBoolean(obj, 'is_active'),
    created_at: assertString(obj, 'created_at'),
  };
}

export function validatePayment(obj: unknown): Payment {
  if (!isObject(obj)) throw new Error('Expected object for Payment');
  const status = assertString(obj, 'status');
  if (status !== 'pending' && status !== 'confirmed') {
    throw new Error(`Invalid payment status: ${status}`);
  }
  return {
    id: assertString(obj, 'id'),
    user_id: assertString(obj, 'user_id'),
    event_id: assertString(obj, 'event_id'),
    amount: assertNumber(obj, 'amount'),
    status: status as 'pending' | 'confirmed',
    created_at: assertString(obj, 'created_at'),
  };
}

export function validateComment(obj: unknown): Comment {
  if (!isObject(obj)) throw new Error('Expected object for Comment');
  return {
    id: assertString(obj, 'id'),
    user_id: assertString(obj, 'user_id'),
    event_id: assertString(obj, 'event_id'),
    content: assertString(obj, 'content'),
    created_at: assertString(obj, 'created_at'),
  };
}

export function validatePhoto(obj: unknown): Photo {
  if (!isObject(obj)) throw new Error('Expected object for Photo');
  return {
    id: assertString(obj, 'id'),
    user_id: assertString(obj, 'user_id'),
    event_id: assertString(obj, 'event_id'),
    storage_path: assertString(obj, 'storage_path'),
    url: assertString(obj, 'url'),
    created_at: assertString(obj, 'created_at'),
  };
}

export function validateChecklistItem(obj: unknown): ChecklistItem {
  if (!isObject(obj)) throw new Error('Expected object for ChecklistItem');
  return {
    id: assertString(obj, 'id'),
    event_id: assertString(obj, 'event_id'),
    description: assertString(obj, 'description'),
    is_completed: assertBoolean(obj, 'is_completed'),
    completed_by: assertStringOrNull(obj, 'completed_by'),
    created_at: assertString(obj, 'created_at'),
  };
}
