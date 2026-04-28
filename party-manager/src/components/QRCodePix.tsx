'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodePixProps {
  amount: number;
}

export default function QRCodePix({ amount }: QRCodePixProps) {
  // Simulated Pix payload — in production this would be a real EMV code
  const pixPayload = `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.toFixed(2)}5802BR6009SAO PAULO62070503***6304`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-md bg-[var(--muted)] p-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Escaneie o QR Code para pagar via Pix
      </p>
      <div className="rounded-md bg-white p-3">
        <QRCodeSVG
          value={pixPayload}
          size={180}
          level="M"
          aria-label={`QR Code Pix no valor de R$ ${amount.toFixed(2)}`}
        />
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">
        Valor sugerido: R$ {amount.toFixed(2)}
      </p>
    </div>
  );
}
