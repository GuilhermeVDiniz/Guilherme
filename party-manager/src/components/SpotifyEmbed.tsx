'use client';

interface SpotifyEmbedProps {
  playlistUrl: string;
}

/**
 * Converts a Spotify playlist URL to an embed URL.
 * Supports both open.spotify.com/playlist/ID and spotify:playlist:ID formats.
 */
function toEmbedUrl(url: string): string | null {
  // Already an embed URL
  if (url.includes('/embed/')) {
    return url;
  }

  // Match open.spotify.com/playlist/{id}
  const webMatch = url.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (webMatch) {
    return `https://open.spotify.com/embed/playlist/${webMatch[1]}`;
  }

  // Match spotify:playlist:{id}
  const uriMatch = url.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) {
    return `https://open.spotify.com/embed/playlist/${uriMatch[1]}`;
  }

  return null;
}

export default function SpotifyEmbed({ playlistUrl }: SpotifyEmbedProps) {
  const embedUrl = toEmbedUrl(playlistUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:p-6 space-y-3"
      aria-label="Playlist do evento"
    >
      <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
        🎵 Playlist
      </h2>
      <iframe
        title="Spotify playlist do evento"
        src={embedUrl}
        width="100%"
        height="352"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
      />
    </section>
  );
}
