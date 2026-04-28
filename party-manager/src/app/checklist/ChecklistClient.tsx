'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ChecklistItem } from '@/lib/models/types';
import { createClient } from '@/lib/supabase/client';
import { validateChecklistDescription } from '@/lib/validators/checklist';
import { toggleChecklistItem } from '@/lib/services/checklist';
import PageTransition from '@/components/PageTransition';
import AnimatedSection from '@/components/AnimatedSection';

interface ChecklistClientProps {
  eventId: string;
  items: ChecklistItem[];
  isAdmin: boolean;
  userId: string;
}

/**
 * ChecklistClient — interactive checklist manager.
 * Admin can add/delete items, all users can toggle completion.
 * Requirements: 7.1, 7.2, 7.3
 */
export default function ChecklistClient({
  eventId,
  items: initialItems,
  isAdmin,
  userId,
}: ChecklistClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [newDescription, setNewDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validateChecklistDescription(newDescription);
    if (!validation.valid) {
      setError(validation.error ?? 'Descrição inválida');
      return;
    }

    setAddLoading(true);
    const supabase = createClient();

    const { data, error: insertError } = await supabase
      .from('checklist_items')
      .insert({
        event_id: eventId,
        description: newDescription.trim(),
        is_completed: false,
        completed_by: null,
      })
      .select()
      .single();

    setAddLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setItems((prev) => [...prev, data as ChecklistItem]);
    }
    setNewDescription('');
  }

  async function handleToggle(item: ChecklistItem) {
    const toggled = toggleChecklistItem(item);
    const supabase = createClient();

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...toggled,
              completed_by: toggled.is_completed ? userId : null,
            }
          : i
      )
    );

    const { error: updateError } = await supabase
      .from('checklist_items')
      .update({
        is_completed: toggled.is_completed,
        completed_by: toggled.is_completed ? userId : null,
      })
      .eq('id', item.id);

    if (updateError) {
      // Revert on failure
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? item : i))
      );
    }
  }

  async function handleDelete(itemId: string) {
    const supabase = createClient();

    // Optimistic update
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    const { error: deleteError } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      // Revert by re-fetching
      router.refresh();
    }
  }

  const completedCount = items.filter((i) => i.is_completed).length;

  return (
    <PageTransition>
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
        ✅ Checklist do Churras
      </h1>

      {/* Progress summary */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted-foreground)]">Progresso</span>
          <span className="font-medium">
            {completedCount} / {items.length} itens
          </span>
        </div>
        <div
          className="mt-2 h-2 w-full rounded-full bg-[var(--muted)] overflow-hidden"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-label="Progresso do checklist"
        >
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{
              width: items.length > 0
                ? `${(completedCount / items.length) * 100}%`
                : '0%',
            }}
          />
        </div>
      </div>

      {/* Add item form — admin only */}
      {isAdmin && (
        <AnimatedSection
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6"
          aria-label="Adicionar item ao checklist"
          delay={0.05}
        >
          <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-3">
            Adicionar Item
          </h2>
          <form onSubmit={handleAddItem} className="flex gap-2 items-end">
            <div className="flex-1">
              <label
                htmlFor="checklist-description"
                className="block text-sm font-medium mb-1"
              >
                Descrição
              </label>
              <input
                id="checklist-description"
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Ex: Carvão (5kg)"
              />
              {error && (
                <p className="mt-1 text-xs text-[var(--destructive)]" role="alert">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {addLoading ? '...' : 'Adicionar'}
            </button>
          </form>
        </AnimatedSection>
      )}

      {/* Checklist items */}
      <AnimatedSection
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6"
        aria-label="Itens do checklist"
        delay={0.1}
      >
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-3">
          Itens
        </h2>

        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Nenhum item no checklist ainda.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--muted)] px-4 py-3"
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.is_completed}
                    onChange={() => handleToggle(item)}
                    className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] cursor-pointer"
                    aria-label={`Marcar "${item.description}" como ${item.is_completed ? 'pendente' : 'concluído'}`}
                  />
                  <span
                    className={`text-sm truncate ${
                      item.is_completed
                        ? 'line-through text-[var(--muted-foreground)]'
                        : 'text-[var(--card-foreground)]'
                    }`}
                  >
                    {item.description}
                  </span>
                </label>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="ml-2 text-[var(--destructive)] hover:opacity-70 transition-opacity flex-shrink-0"
                    aria-label={`Remover item "${item.description}"`}
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </AnimatedSection>
    </main>
    </PageTransition>
  );
}
