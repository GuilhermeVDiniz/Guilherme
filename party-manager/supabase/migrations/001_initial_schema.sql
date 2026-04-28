-- ============================================================
-- Churrasco Manager: Initial Schema Migration
-- Requirements: 10.1 (database tables), 10.2 (RLS policies)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eventos (events) table
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  total_required NUMERIC NOT NULL CHECK (total_required >= 0),
  spotify_playlist_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pagamentos (payments) table
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comentarios (comments) table
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fotos (photos) table
CREATE TABLE fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklist items table
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_pagamentos_user_id ON pagamentos(user_id);
CREATE INDEX idx_pagamentos_event_id ON pagamentos(event_id);
CREATE INDEX idx_comentarios_event_id ON comentarios(event_id);
CREATE INDEX idx_fotos_event_id ON fotos(event_id);
CREATE INDEX idx_checklist_items_event_id ON checklist_items(event_id);
CREATE INDEX idx_eventos_is_active ON eventos(is_active);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Helper: check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --------------------------------------------------------
-- USERS policies
-- --------------------------------------------------------

-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Admins can read all user profiles
CREATE POLICY "users_select_admin"
  ON users FOR SELECT
  USING (is_admin());

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Allow insert during registration (user creates own row)
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- --------------------------------------------------------
-- EVENTOS policies
-- --------------------------------------------------------

-- All authenticated users can read events
CREATE POLICY "eventos_select_authenticated"
  ON eventos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can create events
CREATE POLICY "eventos_insert_admin"
  ON eventos FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update events
CREATE POLICY "eventos_update_admin"
  ON eventos FOR UPDATE
  USING (is_admin());

-- Only admins can delete events
CREATE POLICY "eventos_delete_admin"
  ON eventos FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- PAGAMENTOS policies
-- --------------------------------------------------------

-- Users can read their own payments
CREATE POLICY "pagamentos_select_own"
  ON pagamentos FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all payments
CREATE POLICY "pagamentos_select_admin"
  ON pagamentos FOR SELECT
  USING (is_admin());

-- Users can insert their own payments (pending status)
CREATE POLICY "pagamentos_insert_own"
  ON pagamentos FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can insert payments for any user
CREATE POLICY "pagamentos_insert_admin"
  ON pagamentos FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update payments (e.g., confirm status)
CREATE POLICY "pagamentos_update_admin"
  ON pagamentos FOR UPDATE
  USING (is_admin());

-- Admins can delete payments
CREATE POLICY "pagamentos_delete_admin"
  ON pagamentos FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- COMENTARIOS policies
-- --------------------------------------------------------

-- All authenticated users can read comments
CREATE POLICY "comentarios_select_authenticated"
  ON comentarios FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert their own comments
CREATE POLICY "comentarios_insert_own"
  ON comentarios FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can delete any comment
CREATE POLICY "comentarios_delete_admin"
  ON comentarios FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- FOTOS policies
-- --------------------------------------------------------

-- All authenticated users can view photos
CREATE POLICY "fotos_select_authenticated"
  ON fotos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can upload their own photos
CREATE POLICY "fotos_insert_own"
  ON fotos FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can delete any photo
CREATE POLICY "fotos_delete_admin"
  ON fotos FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- CHECKLIST_ITEMS policies
-- --------------------------------------------------------

-- All authenticated users can read checklist items
CREATE POLICY "checklist_items_select_authenticated"
  ON checklist_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can add checklist items
CREATE POLICY "checklist_items_insert_admin"
  ON checklist_items FOR INSERT
  WITH CHECK (is_admin());

-- Authenticated users can toggle completion (update)
CREATE POLICY "checklist_items_update_authenticated"
  ON checklist_items FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Only admins can delete checklist items
CREATE POLICY "checklist_items_delete_admin"
  ON checklist_items FOR DELETE
  USING (is_admin());

-- ============================================================
-- SUPABASE STORAGE: Photos bucket
-- ============================================================

-- Create the photos storage bucket (public for read access to gallery)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Authenticated users can upload to the photos bucket
CREATE POLICY "photos_bucket_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'photos'
    AND auth.uid() IS NOT NULL
  );

-- Anyone can read photos (public bucket)
CREATE POLICY "photos_bucket_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

-- Users can delete their own uploaded photos
CREATE POLICY "photos_bucket_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can delete any photo from the bucket
CREATE POLICY "photos_bucket_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'photos'
    AND is_admin()
  );
