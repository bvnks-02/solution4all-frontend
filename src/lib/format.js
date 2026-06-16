/**
 * Format a number as Algerian Dinar price string.
 * Example: formatDZD(120000) → "120 000 DA"
 */
export function formatDZD(amount) {
  if (amount == null || isNaN(amount)) return '0 DA';
  return new Intl.NumberFormat('fr-DZ').format(amount) + ' DA';
}

/**
 * Format a date string in French locale.
 * Example: formatDate('2024-01-15T10:30:00Z') → "15 janvier 2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

/**
 * Format a date string with time.
 * Example: formatDateTime('2024-01-15T10:30:00Z') → "15 janvier 2024 à 10:30"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}
