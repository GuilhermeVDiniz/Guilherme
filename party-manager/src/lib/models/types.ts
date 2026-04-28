export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string; // ISO 8601
}

export interface Event {
  id: string;
  name: string;
  event_date: string; // ISO 8601
  location: string;
  total_required: number;
  spotify_playlist_url: string | null;
  is_active: boolean;
  created_at: string; // ISO 8601
}

export interface Payment {
  id: string;
  user_id: string;
  event_id: string;
  amount: number;
  status: 'pending' | 'confirmed';
  created_at: string; // ISO 8601
}

export interface Comment {
  id: string;
  user_id: string;
  event_id: string;
  content: string;
  created_at: string; // ISO 8601
}

export interface Photo {
  id: string;
  user_id: string;
  event_id: string;
  storage_path: string;
  url: string;
  created_at: string; // ISO 8601
}

export interface ChecklistItem {
  id: string;
  event_id: string;
  description: string;
  is_completed: boolean;
  completed_by: string | null;
  created_at: string; // ISO 8601
}

export interface RankingEntry {
  user_id: string;
  user_name: string;
  total_paid: number;
  rank: number;
  is_top_contributor: boolean;
}
