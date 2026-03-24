/**
 * Formats a date string or object into a short Portuguese format (e.g., "24 mar").
 * 
 * @param date - The date to format.
 * @returns {string} The formatted date string.
 */
export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short' 
  });
}

/**
 * Gets the start of the current day in ISO format.
 * 
 * @returns {string} ISO date string.
 */
export function getStartOfDay(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

/**
 * Gets the start of the current week (Monday) in ISO format.
 * 
 * @returns {string} ISO date string.
 */
export function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}
