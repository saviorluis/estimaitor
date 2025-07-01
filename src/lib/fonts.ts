import path from 'path';

// Function to get font path based on environment
const getFontPath = (fontName: string): string => {
  if (typeof window === 'undefined') {
    // Server environment - use absolute path
    return path.join(process.cwd(), 'public', 'static', 'fonts', fontName);
  }
  // Browser environment - use relative path
  return `/fonts/${fontName}`;
};

// Font paths for PDF generation
export const fonts = {
  regular: getFontPath('roboto-regular-webfont.ttf'),
  bold: getFontPath('roboto-bold-webfont.ttf'),
  italic: getFontPath('roboto-italic-webfont.ttf'),
  boldItalic: getFontPath('roboto-bolditalic-webfont.ttf')
};

// Font configuration for PDF generation
export const fontConfig = {
  Roboto: {
    normal: getFontPath('roboto-regular-webfont.ttf'),
    bold: getFontPath('roboto-bold-webfont.ttf'),
    italic: getFontPath('roboto-italic-webfont.ttf'),
    bolditalic: getFontPath('roboto-bolditalic-webfont.ttf')
  }
}; 