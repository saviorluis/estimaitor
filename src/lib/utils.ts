/**
 * Format a date to MM/DD/YYYY format
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Calculate the number of days to complete a project
 */
export function calculateProjectDays(totalHours: number, cleanersPerDay: number, hoursPerDay: number = 8): number {
  return Math.ceil(totalHours / (cleanersPerDay * hoursPerDay));
}

/**
 * Generate a random quote number
 */
export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `Q-${year}-${randomNum}`;
} 