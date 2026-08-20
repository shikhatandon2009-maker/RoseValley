/**
 * Helper utility to format image URLs, ensuring Google Drive view links
 * are converted into direct raw image URLs usable in <img> and <link rel="icon"> tags.
 */

export function formatImageUrl(url?: string | null, fallback: string = '/images/logo/logo.png'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Extract Google Drive File ID from various share/view formats:
  // - https://drive.google.com/file/d/1N4SNftEgNIypweTvcLMv06hva3ZrnulL/view?usp=drivesdk
  // - https://drive.google.com/open?id=1N4SNftEgNIypweTvcLMv06hva3ZrnulL
  // - https://drive.google.com/uc?id=1N4SNftEgNIypweTvcLMv06hva3ZrnulL
  // - https://lh3.googleusercontent.com/d/1N4SNftEgNIypweTvcLMv06hva3ZrnulL
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=view&id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/;
  const driveMatch = trimmed.match(driveRegex);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
}
