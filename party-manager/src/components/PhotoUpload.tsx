'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { validateFileUpload } from '@/lib/validators/upload';

interface PhotoUploadProps {
  eventId: string;
  userId: string;
  onUploadComplete?: () => void;
}

export default function PhotoUpload({ eventId, userId, onUploadComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    const validation = validateFileUpload(file.type, file.size);
    if (!validation.valid) {
      setError(validation.error ?? 'Arquivo inválido.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);

    const supabase = createClient();
    const filePath = `${eventId}/${userId}/${Date.now()}-${file.name}`;

    const { error: storageError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (storageError) {
      setError('Erro ao fazer upload da foto.');
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('fotos')
      .insert({
        user_id: userId,
        event_id: eventId,
        storage_path: filePath,
        url: urlData.publicUrl,
      });

    if (dbError) {
      setError('Erro ao salvar registro da foto.');
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSuccess(true);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onUploadComplete?.();
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="photo-upload"
        className="block text-sm font-medium text-[var(--card-foreground)]"
      >
        Enviar Foto
      </label>
      <input
        id="photo-upload"
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-[var(--muted-foreground)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--primary-foreground)] file:cursor-pointer disabled:opacity-50"
      />
      {uploading && (
        <p className="text-sm text-[var(--muted-foreground)]">Enviando...</p>
      )}
      {error && (
        <p className="text-sm text-[var(--destructive)]" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-[var(--success)]">Foto enviada com sucesso!</p>
      )}
    </div>
  );
}
