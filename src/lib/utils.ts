import { FormData, EstimateData, CalculationCache, CacheStats } from './types';

// ===================== PERFORMANCE UTILITIES =====================

/**
 * Debounce function for form input optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for frequent calculations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoization function for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// ===================== CALCULATION CACHE MANAGEMENT =====================

class CalculationCacheManager {
  private cache = new Map<string, CalculationCache>();
  private stats: CacheStats = {
    size: 0,
    hitRate: 0,
    missRate: 0,
    totalRequests: 0
  };
  private maxSize = 100;
  private ttl = 300000; // 5 minutes

  /**
   * Get value from cache
   */
  get(key: string): number | null {
    this.stats.totalRequests++;
    
    const cached = this.cache.get(key);
    if (!cached) {
      this.stats.missRate = (this.stats.missRate * (this.stats.totalRequests - 1) + 1) / this.stats.totalRequests;
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      this.stats.missRate = (this.stats.missRate * (this.stats.totalRequests - 1) + 1) / this.stats.totalRequests;
      return null;
    }

    this.stats.hitRate = (this.stats.hitRate * (this.stats.totalRequests - 1) + 1) / this.stats.totalRequests;
    return cached.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: number, dependencies: Array<keyof FormData> = []): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      key,
      value,
      timestamp: Date.now(),
      dependencies
    });

    this.stats.size = this.cache.size;
  }

  /**
   * Invalidate cache entries based on changed form fields
   */
  invalidate(changedFields: Array<keyof FormData>): void {
    const toDelete: string[] = [];
    
    this.cache.forEach((cached, key) => {
      if (cached.dependencies.some((dep: keyof FormData) => changedFields.includes(dep))) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => this.cache.delete(key));
    this.stats.size = this.cache.size;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      size: 0,
      hitRate: 0,
      missRate: 0,
      totalRequests: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Set cache configuration
   */
  configure(options: { maxSize?: number; ttl?: number }): void {
    if (options.maxSize) this.maxSize = options.maxSize;
    if (options.ttl) this.ttl = options.ttl;
  }
}

// Export singleton instance
export const calculationCache = new CalculationCacheManager();

// ===================== DATA VALIDATION UTILITIES =====================

/**
 * Validate numeric input with bounds checking
 */
export function validateNumericInput(
  value: number,
  min: number = 0,
  max: number = Infinity,
  required: boolean = true
): { isValid: boolean; message?: string } {
  if (required && (value === undefined || value === null)) {
    return { isValid: false, message: 'This field is required' };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, message: 'Must be a valid number' };
  }

  if (value < min) {
    return { isValid: false, message: `Minimum value is ${min}` };
  }

  if (value > max) {
    return { isValid: false, message: `Maximum value is ${max}` };
  }

  return { isValid: true };
}

/**
 * Sanitize form data to ensure type safety
 */
export function sanitizeFormData(data: Partial<FormData>): Partial<FormData> {
  const sanitized: Partial<FormData> = {};

  // Sanitize numeric fields
  const numericFields: Array<keyof FormData> = [
    'squareFootage', 'distanceFromOffice', 'gasPrice', 'numberOfNights',
    'numberOfCleaners', 'urgencyLevel', 'pressureWashingArea',
    'numberOfWindows', 'numberOfLargeWindows', 'numberOfHighAccessWindows',
    'numberOfDisplayCases'
  ];

  numericFields.forEach(field => {
    if (data[field] !== undefined) {
      const value = Number(data[field]);
      if (!isNaN(value)) {
        (sanitized as any)[field] = value;
      }
    }
  });

  // Copy boolean fields
  const booleanFields: Array<keyof FormData> = [
    'hasVCT', 'applyMarkup', 'stayingOvernight', 'needsPressureWashing',
    'needsWindowCleaning', 'chargeForWindowCleaning'
  ];

  booleanFields.forEach(field => {
    if (data[field] !== undefined) {
      (sanitized as any)[field] = Boolean(data[field]);
    }
  });

  // Copy string fields
  const stringFields: Array<keyof FormData> = [
    'projectType', 'cleaningType', 'clientName', 'projectName'
  ];

  stringFields.forEach(field => {
    if (data[field] !== undefined) {
      (sanitized as any)[field] = String(data[field]);
    }
  });

  return sanitized;
}

// ===================== FORMATTING UTILITIES =====================

/**
 * Format currency with proper locale
 */
export function formatCurrency(
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format hours in a human-readable way
 */
export function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours === 1) {
    return '1 hour';
  } else if (hours < 24) {
    return `${hours.toFixed(1)} hours`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} day${days > 1 ? 's' : ''} ${remainingHours.toFixed(1)} hours`;
  }
}

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

// ===================== QUOTE COUNTER UTILITIES =====================

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

/**
 * Calculate the number of days to complete a project
 */
export function calculateProjectDays(totalHours: number, cleanersPerDay: number, hoursPerDay: number = 8): number {
  return Math.ceil(totalHours / (cleanersPerDay * hoursPerDay));
}

// ===================== STORAGE UTILITIES =====================

/**
 * Safe localStorage operations with error handling
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing to localStorage for key "${key}":`, error);
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing from localStorage for key "${key}":`, error);
      return false;
    }
  }
};

// ===================== PERFORMANCE MONITORING =====================

/**
 * Simple performance timer for development
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private measurements: Record<string, number[]> = {};

  start(): void {
    this.startTime = performance.now();
  }

  end(label: string): number {
    const duration = performance.now() - this.startTime;
    
    if (!this.measurements[label]) {
      this.measurements[label] = [];
    }
    
    this.measurements[label].push(duration);
    return duration;
  }

  getStats(label: string): { avg: number; min: number; max: number; count: number } | null {
    const times = this.measurements[label];
    if (!times || times.length === 0) return null;

    return {
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      count: times.length
    };
  }

  reset(): void {
    this.measurements = {};
  }
}

// Export singleton performance timer
export const performanceTimer = new PerformanceTimer(); 