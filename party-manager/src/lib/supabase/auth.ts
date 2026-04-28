import { createClient } from './client';
import type { User } from '../models/types';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface SessionResult {
  userId: string | null;
  email: string | null;
}

/**
 * Sign up a new user with email and password.
 * The public.users row is created automatically via a database trigger.
 * Requirements: 1.1
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Registration failed. Please try again.' };
  }

  return { success: true };
}

/**
 * Sign in an existing user with email and password.
 * Requirements: 1.2
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get the current session info (user id and email).
 */
export async function getSession(): Promise<SessionResult> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { userId: null, email: null };
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? null,
  };
}

/**
 * Get the full user profile from the public users table.
 */
export async function getUserProfile(
  userId: string
): Promise<User | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}
