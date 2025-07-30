export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    compact: boolean;
    borderRadius: string;
  };
  pdf: {
    accentColor: string;
    headerBackground: string;
    tableStripe: string;
  };
}

export const themes: Record<string, Theme> = {
  minimalist: {
    id: 'minimalist',
    name: 'Modern Minimalist',
    description: 'Clean, uncluttered design with subtle accents',
    colors: {
      primary: '#64748b', // Slate blue-gray
      secondary: '#f8fafc', // Very light gray
      accent: '#0f766e', // Muted teal
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
    },
    spacing: {
      compact: false,
      borderRadius: '0.375rem',
    },
    pdf: {
      accentColor: '#0f766e',
      headerBackground: '#f8fafc',
      tableStripe: '#f1f5f9',
    },
  },
  corporate: {
    id: 'corporate',
    name: 'Professional Corporate',
    description: 'Structured, trustworthy business appearance',
    colors: {
      primary: '#1e40af', // Deep blue
      secondary: '#f3f4f6', // Light gray
      accent: '#374151', // Charcoal gray
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#d1d5db',
      success: '#065f46',
      warning: '#92400e',
      error: '#991b1b',
    },
    fonts: {
      primary: 'system-ui, -apple-system, sans-serif',
      secondary: 'Georgia, serif',
    },
    spacing: {
      compact: false,
      borderRadius: '0.25rem',
    },
    pdf: {
      accentColor: '#1e40af',
      headerBackground: '#f3f4f6',
      tableStripe: '#f9fafb',
    },
  },
  visual: {
    id: 'visual',
    name: 'Visual Impact',
    description: 'Dynamic, engaging design with vibrant elements',
    colors: {
      primary: '#2563eb', // Bright blue
      secondary: '#f0f9ff', // Very light blue
      accent: '#ea580c', // Vibrant orange
      background: '#ffffff',
      surface: '#f0f9ff',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      success: '#16a34a',
      warning: '#eab308',
      error: '#e11d48',
    },
    fonts: {
      primary: 'Poppins, system-ui, sans-serif',
      secondary: 'Poppins, system-ui, sans-serif',
    },
    spacing: {
      compact: false,
      borderRadius: '0.75rem',
    },
    pdf: {
      accentColor: '#2563eb',
      headerBackground: '#f0f9ff',
      tableStripe: '#e0f2fe',
    },
  },
  service: {
    id: 'service',
    name: 'Service-Focused',
    description: 'Clear service presentation with organized sections',
    colors: {
      primary: '#059669', // Emerald green
      secondary: '#f0fdf4', // Very light green
      accent: '#0891b2', // Cyan blue
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#064e3b',
      textSecondary: '#047857',
      border: '#bbf7d0',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    fonts: {
      primary: 'system-ui, -apple-system, sans-serif',
      secondary: 'system-ui, -apple-system, sans-serif',
    },
    spacing: {
      compact: false,
      borderRadius: '0.5rem',
    },
    pdf: {
      accentColor: '#059669',
      headerBackground: '#f0fdf4',
      tableStripe: '#ecfdf5',
    },
  },
  data: {
    id: 'data',
    name: 'Data-Driven',
    description: 'Analytical presentation with clear visualizations',
    colors: {
      primary: '#7c3aed', // Purple
      secondary: '#faf5ff', // Very light purple
      accent: '#0d9488', // Teal
      background: '#ffffff',
      surface: '#faf5ff',
      text: '#581c87',
      textSecondary: '#7c2d92',
      border: '#e9d5ff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f43f5e',
    },
    fonts: {
      primary: 'system-ui, -apple-system, monospace',
      secondary: 'system-ui, -apple-system, sans-serif',
    },
    spacing: {
      compact: true,
      borderRadius: '0.25rem',
    },
    pdf: {
      accentColor: '#7c3aed',
      headerBackground: '#faf5ff',
      tableStripe: '#f3e8ff',
    },
  },
};

export const defaultTheme = themes.minimalist;

// Theme storage utilities
export const saveTheme = (themeId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('estimaitor-theme', themeId);
  }
};

export const loadTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedThemeId = localStorage.getItem('estimaitor-theme');
    if (savedThemeId && themes[savedThemeId]) {
      return themes[savedThemeId];
    }
  }
  return defaultTheme;
};

// CSS variable utilities
export const applyTheme = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    root.style.setProperty('--font-primary', theme.fonts.primary);
    root.style.setProperty('--font-secondary', theme.fonts.secondary);
    root.style.setProperty('--border-radius', theme.spacing.borderRadius);
    root.style.setProperty('--spacing-compact', theme.spacing.compact ? '0.5' : '1');
  }
};