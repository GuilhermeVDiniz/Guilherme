'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validatePaymentAmount } from '@/lib/validators/payment';
import { createPaymentRecord } from '@/lib/services/payments';

interface PaymentFormProps {
  eventId: string;
  userId: string;
  userRole: 'user' | 'admin';
  onCancel: () => void;
}

export default function PaymentForm({
  eventId,
  userId,
  userRole,
  onCancel,
}: PaymentFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    const validation = validatePaymentAmount(numericAmount);

    if (!validation.valid) {
      setError(validation.error ?? 'Valor inválido');
      return;
    }

    setLoading(true);

    const record = createPaymentRecord(numericAmount, userRole);
    const supabase = createClient();

    const { error: insertError } = await supabase.from('pagamentos').insert({
      user_id: userId,
      event_id: eventId,
      amount: record.amount,
      status: record.status,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAmount('');
    onCancel();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div>
        <label htmlFor="payment-amount" className="block text-sm font-medium mb-1">
          Valor (R$)
        </label>
        <input
          id="payment-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          placeholder="0.00"
          autoComplete="off"
        />
        {error && (
          <p className="mt-1 text-xs text-[var(--destructive)]" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Enviando...' : 'Confirmar Pagamento'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
