'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { calculateCountdown, type CountdownResult } from '@/lib/utils/countdown';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    calculateCountdown(targetDate, new Date())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(targetDate, new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const segments: { label: string; value: number }[] = [
    { label: 'Dias', value: countdown.days },
    { label: 'Horas', value: countdown.hours },
    { label: 'Min', value: countdown.minutes },
    { label: 'Seg', value: countdown.seconds },
  ];

  const isOver =
    countdown.days === 0 &&
    countdown.hours === 0 &&
    countdown.minutes === 0 &&
    countdown.seconds === 0;

  return (
    <motion.section
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-3"
      aria-label="Contagem regressiva"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
        Contagem Regressiva
      </h2>
      {isOver ? (
        <p className="text-center text-[var(--primary)] font-bold text-xl">
          🎉 O evento já começou!
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-3 text-center">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="rounded-md bg-[var(--muted)] p-3"
            >
              <p className="text-2xl md:text-3xl font-bold tabular-nums">
                {String(seg.value).padStart(2, '0')}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {seg.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
