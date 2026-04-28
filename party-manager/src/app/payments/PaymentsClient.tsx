'use client';

import { useState } from 'react';
import type { Event, Payment } from '@/lib/models/types';
import { computeUserBalance, sortPaymentsByDate } from '@/lib/services/payments';
import PaymentForm from '@/components/PaymentForm';
import QRCodePix from '@/components/QRCodePix';
import PageTransition from '@/components/PageTransition';
import AnimatedSection from '@/components/AnimatedSection';

interface PaymentsClientProps {
  event: Event;
  payments: Payment[];
  userId: string;
  userRole: 'user' | 'admin';
}

export default function PaymentsClient({
  event,
  payments,
  userId,
  userRole,
}: PaymentsClientProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { paid, remaining } = computeUserBalance(payments, event.total_required);
  const sortedPayments = sortPaymentsByDate(payments);

  return (
    <PageTransition>
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
        💰 Pagamentos
      </h1>

      {/* User Balance */}
      <AnimatedSection
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-3"
        aria-label="Seu saldo"
        delay={0.05}
      >
        <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
          Seu Saldo — {event.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-md bg-[var(--muted)] p-3 text-center">
            <p className="text-xs text-[var(--muted-foreground)]">Total Pago</p>
            <p className="text-xl font-bold text-[var(--success)]">
              R$ {paid.toFixed(2)}
            </p>
          </div>
          <div className="rounded-md bg-[var(--muted)] p-3 text-center">
            <p className="text-xs text-[var(--muted-foreground)]">Saldo Restante</p>
            <p className="text-xl font-bold text-[var(--primary)]">
              R$ {remaining.toFixed(2)}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Payment Registration */}
      <AnimatedSection
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-3"
        aria-label="Registrar pagamento"
        delay={0.1}
      >
        <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
          Registrar Pagamento
        </h2>
        {!showPaymentForm ? (
          <button
            type="button"
            onClick={() => setShowPaymentForm(true)}
            className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            Registrar Pagamento via Pix
          </button>
        ) : (
          <div className="space-y-4">
            <QRCodePix amount={remaining} />
            <PaymentForm
              eventId={event.id}
              userId={userId}
              userRole={userRole}
              onCancel={() => setShowPaymentForm(false)}
            />
          </div>
        )}
      </AnimatedSection>

      {/* Payment History */}
      <AnimatedSection
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-3"
        aria-label="Histórico de pagamentos"
        delay={0.15}
      >
        <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
          Histórico de Pagamentos
        </h2>
        {sortedPayments.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Nenhum pagamento registrado ainda.
          </p>
        ) : (
          <ul className="space-y-2">
            {sortedPayments.map((payment) => {
              const date = new Date(payment.created_at);
              const formattedDate = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              const formattedTime = date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <li
                  key={payment.id}
                  className="flex items-center justify-between rounded-md bg-[var(--muted)] px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      R$ {payment.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formattedDate} às {formattedTime}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      payment.status === 'confirmed'
                        ? 'bg-[var(--success)]/20 text-[var(--success)]'
                        : 'bg-[var(--primary)]/20 text-[var(--primary)]'
                    }`}
                  >
                    {payment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </AnimatedSection>
    </main>
    </PageTransition>
  );
}
