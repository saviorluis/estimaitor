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

// Store quote counter in localStorage or start at 121
let quoteCounter = 121;

/**
 * Get the current quote counter
 */
export function getQuoteCounter(): number {
  if (typeof window !== 'undefined') {
    const storedCounter = localStorage.getItem('quoteCounter');
    if (storedCounter) {
      return parseInt(storedCounter, 10);
    } else {
      // Initialize with 121
      localStorage.setItem('quoteCounter', quoteCounter.toString());
    }
  }
  return quoteCounter;
}

/**
 * Increment the quote counter and return the new value
 */
export function incrementQuoteCounter(): number {
  const currentCounter = getQuoteCounter();
  const newCounter = currentCounter + 1;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('quoteCounter', newCounter.toString());
  }
  
  return newCounter;
}

/**
 * Generate a quote number based on the counter
 */
export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const counter = getQuoteCounter();
  return `Q-${year}-${counter}`;
} 