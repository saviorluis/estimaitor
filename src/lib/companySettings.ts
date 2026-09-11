export const COMPANY_SETTINGS_KEY = 'estimaitor_company_settings';
export const COMPANY_LOGO_KEY = 'estimaitor_company_logo';
export const COMPANY_CAPABILITY_KEY = 'estimaitor_company_capability';
export const LEGACY_QUOTE_COMPANY_KEY = 'quoteCompanyInfo';
export const DEFAULT_LOGO_SRC = '/assets/logo.png';
export const DEFAULT_BRAND_COLOR = '#4f46e5';

export const BRAND_COLOR_PRESETS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Navy', value: '#1e3a8a' },
  { name: 'Teal', value: '#0f766e' },
  { name: 'Forest', value: '#166534' },
  { name: 'Slate', value: '#475569' },
  { name: 'Orange', value: '#c2410c' },
  { name: 'Wine', value: '#9f1239' },
  { name: 'Sky', value: '#0369a1' },
] as const;

export interface CompanySettings {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  estimatorName: string;
  homeBase: string;
  appName: string;
  quotePrefix: string;
  logoDataUrl: string;
  capabilityStatementDataUrl: string;
  brandColor: string;
}

export const EMPTY_COMPANY_SETTINGS: CompanySettings = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: '',
  website: '',
  estimatorName: '',
  homeBase: '',
  appName: 'EstimAItor',
  quotePrefix: 'Q',
  logoDataUrl: '',
  capabilityStatementDataUrl: '',
  brandColor: DEFAULT_BRAND_COLOR,
};

/** Built-in defaults so the existing BBPS workflow still works until settings are filled. */
export const FALLBACK_COMPANY_SETTINGS: CompanySettings = {
  ...EMPTY_COMPANY_SETTINGS,
  name: 'Big Brother Property Solutions',
  address: '1200 Eastchester Dr.',
  city: 'High Point',
  state: 'NC',
  zip: '27265',
  phone: '(336) 624-7442',
  email: 'bids@bigbroprops.com',
  website: 'www.bigbrotherpropertysolutions.com',
  homeBase: 'High Point, NC',
};

export interface DocumentCompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  logoSrc: string;
  capabilityStatementSrc?: string;
}

export function isValidBrandColor(hex?: string): hex is string {
  return Boolean(hex && /^#[0-9A-Fa-f]{6}$/.test(hex));
}

export function parseCityStateZip(line: string): { city: string; state: string; zip: string } {
  const trimmed = (line || '').trim();
  if (!trimmed) return { city: '', state: '', zip: '' };
  const match = trimmed.match(/^(.*?)(?:,\s*([A-Za-z]{2}))?(?:\s+(\d{5}(?:-\d{4})?))?$/);
  if (!match) return { city: trimmed, state: '', zip: '' };
  return {
    city: (match[1] || '').trim(),
    state: (match[2] || '').toUpperCase(),
    zip: match[3] || '',
  };
}

export function formatCompanyCityLine(settings: Pick<CompanySettings, 'city' | 'state' | 'zip'>): string {
  const cityState = [settings.city, settings.state].filter(Boolean).join(', ');
  return settings.zip ? `${cityState} ${settings.zip}`.trim() : cityState;
}

export function isUsableImageSrc(src?: string): src is string {
  if (!src) return false;
  return src.startsWith('data:image/') || src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://');
}

export function normalizeCompanySettings(raw: Partial<CompanySettings>): CompanySettings {
  const merged: CompanySettings = {
    ...FALLBACK_COMPANY_SETTINGS,
    ...raw,
    brandColor: isValidBrandColor(raw.brandColor) ? raw.brandColor : DEFAULT_BRAND_COLOR,
    appName: raw.appName || FALLBACK_COMPANY_SETTINGS.appName,
    quotePrefix: raw.quotePrefix || FALLBACK_COMPANY_SETTINGS.quotePrefix,
    logoDataUrl: raw.logoDataUrl || '',
    capabilityStatementDataUrl: raw.capabilityStatementDataUrl || '',
  };

  if (/,\s*[A-Za-z]{2}/.test(merged.city)) {
    const parsed = parseCityStateZip(merged.city);
    merged.city = parsed.city || merged.city;
    if (parsed.state) merged.state = parsed.state;
    if (parsed.zip) merged.zip = parsed.zip;
  }

  return merged;
}

export function getLogoSrc(settings: CompanySettings): string {
  return isUsableImageSrc(settings.logoDataUrl) ? settings.logoDataUrl : DEFAULT_LOGO_SRC;
}

export function toDocumentCompanyInfo(settings: CompanySettings): DocumentCompanyInfo {
  return {
    name: settings.name,
    address: settings.address,
    city: formatCompanyCityLine(settings),
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    logoSrc: getLogoSrc(settings),
    capabilityStatementSrc: isUsableImageSrc(settings.capabilityStatementDataUrl)
      ? settings.capabilityStatementDataUrl
      : undefined,
  };
}

function parseLegacyQuoteCompany(raw: string | null): Partial<CompanySettings> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      name: parsed.name || '',
      address: parsed.address || '',
      city: parsed.city || '',
      phone: parsed.phone || '',
      email: parsed.email || '',
      website: parsed.website || '',
    };
  } catch {
    return null;
  }
}

export function loadCompanySettings(): CompanySettings {
  if (typeof window === 'undefined') {
    return { ...FALLBACK_COMPANY_SETTINGS };
  }

  try {
    const stored = localStorage.getItem(COMPANY_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<CompanySettings>;
      const logoDataUrl = localStorage.getItem(COMPANY_LOGO_KEY) || parsed.logoDataUrl || '';
      const capabilityStatementDataUrl =
        localStorage.getItem(COMPANY_CAPABILITY_KEY) || parsed.capabilityStatementDataUrl || '';
      return normalizeCompanySettings({
        ...parsed,
        logoDataUrl,
        capabilityStatementDataUrl,
      });
    }

    const legacy = parseLegacyQuoteCompany(localStorage.getItem(LEGACY_QUOTE_COMPANY_KEY));
    if (legacy) {
      const cityLooksCombined = Boolean(legacy.city && /,\s*[A-Za-z]{2}/.test(legacy.city));
      const parsedCity = parseCityStateZip(legacy.city || '');
      const migrated = normalizeCompanySettings({
        ...legacy,
        city: cityLooksCombined ? parsedCity.city : legacy.city,
        state: cityLooksCombined ? parsedCity.state : undefined,
        zip: cityLooksCombined ? parsedCity.zip : undefined,
      });
      saveCompanySettings(migrated);
      return migrated;
    }
  } catch (error) {
    console.error('Error loading company settings:', error);
  }

  return { ...FALLBACK_COMPANY_SETTINGS };
}

export function saveCompanySettings(settings: CompanySettings): { ok: boolean; error?: string } {
  if (typeof window === 'undefined') return { ok: true };

  const { logoDataUrl, capabilityStatementDataUrl, ...text } = settings;

  try {
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(text));
    localStorage.setItem(
      LEGACY_QUOTE_COMPANY_KEY,
      JSON.stringify({
        name: settings.name,
        address: settings.address,
        city: formatCompanyCityLine(settings),
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
      })
    );
  } catch (error) {
    console.error('Error saving company settings:', error);
    return { ok: false, error: 'Could not save company information.' };
  }

  try {
    const currentLogo = localStorage.getItem(COMPANY_LOGO_KEY) || '';
    if ((logoDataUrl || '') !== currentLogo) {
      if (logoDataUrl) localStorage.setItem(COMPANY_LOGO_KEY, logoDataUrl);
      else localStorage.removeItem(COMPANY_LOGO_KEY);
    }
  } catch (error) {
    console.error('Error saving company logo:', error);
    return { ok: false, error: 'Logo is too large to save in this browser. Try a smaller PNG or JPG.' };
  }

  try {
    const currentCapability = localStorage.getItem(COMPANY_CAPABILITY_KEY) || '';
    if ((capabilityStatementDataUrl || '') !== currentCapability) {
      if (capabilityStatementDataUrl) localStorage.setItem(COMPANY_CAPABILITY_KEY, capabilityStatementDataUrl);
      else localStorage.removeItem(COMPANY_CAPABILITY_KEY);
    }
  } catch (error) {
    console.error('Error saving capability statement:', error);
    return { ok: false, error: 'Capability statement is too large to save in this browser. Try a smaller image.' };
  }

  return { ok: true };
}

export function darkenHex(hex: string, amount = 0.16): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return hex;
  const channel = (offset: number) => {
    const value = parseInt(raw.slice(offset, offset + 2), 16);
    const next = Math.max(0, Math.round(value * (1 - amount)));
    return next.toString(16).padStart(2, '0');
  };
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

export function applyBrandColor(hex: string): void {
  if (typeof window === 'undefined') return;
  const color = isValidBrandColor(hex) ? hex : DEFAULT_BRAND_COLOR;
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', color);
  root.style.setProperty('--brand-primary-dark', darkenHex(color));
}

export function fileToCompressedDataUrl(file: File, maxDim = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not process image.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.type === 'image/png';
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.82));
      };
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
