/**
 * Utility functions for color conversion between HEX and HSL formats
 */

/**
 * Convert HEX color to HSL string (without "hsl()")
 * @param hex - HEX color string (e.g., "#2652e9" or "2652e9")
 * @returns HSL values as string (e.g., "226 81% 53%")
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

/**
 * Convert HSL string to HEX color
 * @param hsl - HSL values as string (e.g., "226 81% 53%" or "226, 81%, 53%")
 * @returns HEX color string (e.g., "#2652e9")
 */
export function hslToHex(hsl: string): string {
  // Parse HSL values - handle both "226 81% 53%" and "226, 81%, 53%" formats
  const values = hsl.replace(/%/g, '').split(/[\s,]+/).filter(Boolean);
  
  if (values.length < 3) {
    return '#000000';
  }
  
  const h = parseFloat(values[0]) / 360;
  const s = parseFloat(values[1]) / 100;
  const l = parseFloat(values[2]) / 100;
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number): string => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Validate if a string is a valid HEX color
 * @param hex - String to validate
 * @returns boolean
 */
export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Validate if a string is a valid HSL format
 * @param hsl - String to validate
 * @returns boolean
 */
export function isValidHsl(hsl: string): boolean {
  const values = hsl.replace(/%/g, '').split(/[\s,]+/).filter(Boolean);
  if (values.length < 3) return false;
  
  const h = parseFloat(values[0]);
  const s = parseFloat(values[1]);
  const l = parseFloat(values[2]);
  
  return !isNaN(h) && !isNaN(s) && !isNaN(l) && 
         h >= 0 && h <= 360 && 
         s >= 0 && s <= 100 && 
         l >= 0 && l <= 100;
}
