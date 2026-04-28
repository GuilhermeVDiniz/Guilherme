'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sortCommentsReverseChronological } from '@/lib/services/comments';
import type { Comment } from '@/lib/models/types';

interface CommentWithUser extends Comment {
  user_name?: string;
}

interface CommentFeedProps {
  eventId: string;
  userId: string;
  userName: string;
}

export default function CommentFeed({ eventId, userId, userName }: CommentFeedProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  async function fetchComments() {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from('comentarios')
      .select('*, users(name)')
      .eq('event_id', eventId);

    if (fetchError) {
      setError('Erro ao carregar comentários.');
      return;
    }

    const mapped: CommentWithUser[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      user_id: row.user_id as string,
      event_id: row.event_id as string,
      content: row.content as string,
      created_at: row.created_at as string,
      user_name: (row.users as { name: string } | null)?.name ?? 'Usuário',
    }));

    setComments(sortCommentsReverseChronological(mapped));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from('comentarios')
      .insert({ user_id: userId, event_id: eventId, content: trimmed });

    if (insertError) {
      setError('Erro ao enviar comentário.');
      setSubmitting(false);
      return;
    }

    setContent('');
    setSubmitting(false);
    await fetchComments();
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-4"
      aria-label="Comentários"
    >
      <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
        Comentários
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="comment-input" className="sr-only">
          Escreva um comentário
        </label>
        <input
          id="comment-input"
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva um comentário..."
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
        >
          Enviar
        </button>
      </form>

      {error && (
        <p className="text-sm text-[var(--destructive)]" role="alert">
          {error}
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-md bg-[var(--muted)] px-4 py-3 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {comment.user_name ?? userName}
                </span>
                <time
                  className="text-xs text-[var(--muted-foreground)]"
                  dateTime={comment.created_at}
                >
                  {formatDate(comment.created_at)}
                </time>
              </div>
              <p className="text-sm text-[var(--card-foreground)]">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
