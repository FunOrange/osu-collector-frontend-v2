import { clamp } from '@/utils/number-utils';
import { match } from 'ts-pattern';

export function bpmToColor(bpm, darkMode = true) {
  const _bpm = clamp(Math.floor(bpm / 10) * 10, 150, 300);
  if (_bpm === 150) return '#93e2ff';
  if (_bpm === 160) return '#80dbff';
  if (_bpm === 170) return '#6bd3fe';
  if (_bpm === 180) return '#55cbff';
  if (_bpm === 190) return '#39c3ff';
  if (_bpm === 200) return '#00bbff';
  if (_bpm === 210) return '#00a8ea';
  if (_bpm === 220) return '#0095d6';
  if (_bpm === 230) return '#0082c2';
  if (_bpm === 240) return '#0070ae';
  if (_bpm === 250) return '#005f9b';
  if (_bpm === 260) return '#004e88';
  if (_bpm === 270) return '#003e76';
  if (_bpm === 280) return '#002e64';
  if (_bpm === 290) return '#002052';
  if (_bpm === 300) return darkMode ? '#fff' : '#000000';
  return '#000000';
}

export function starToColor(star, darkMode = false) {
  const _star = clamp(Math.floor(star), 1, 10);
  if (_star === 1) return '#6EFF79';
  if (_star === 2) return '#4FC0FF';
  if (_star === 3) return '#F8DA5E';
  if (_star === 4) return '#FF7F68';
  if (_star === 5) return '#FF4E6F';
  if (_star === 6) return '#A653B0';
  if (_star === 7) return '#3B38B2';
  if (_star === 8) return darkMode ? '#fff' : '#000000';
  if (_star === 9) return darkMode ? '#fff' : '#000000';
  if (_star === 10) return darkMode ? '#fff' : '#000000';
  return darkMode ? '#fff' : '#000000';
}

export function modToColor(mod: string) {
  return match(mod.toLowerCase())
    .with('nm', () => '#2191CD')
    .with('hd', () => '#BDA542')
    .with('hr', () => '#CD334F')
    .with('dt', () => '#B44DC0')
    .with('ez', () => '#4dc04f')
    .with('fl', () => 'radial-gradient(circle, rgba(85,85,85,1) 0%, rgba(0,0,0,1) 70%)')
    .with('fm', () => '#888')
    .with('tb', () => '#111')
    .otherwise(() => '#111');
}

// Convert hex color to RGB
export function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b),
  );

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to HSL
export function rgbToHsl(rgb) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // grayscale
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, l };
}

// Convert HSL to RGB
export function hslToRgb(hsl) {
  const { h, s, l } = hsl;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // grayscale
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Main function to calculate contrast color
export function getContrastColor(originalColor) {
  const originalRgb = hexToRgb(originalColor);
  if (!originalRgb) {
    console.error('Invalid color format');
    return null;
  }

  const originalHsl = rgbToHsl(originalRgb);
  const contrastLightness = originalHsl.l > 0.5 ? 0 : 1; // Flip lightness for contrast
  const contrastHsl = { ...originalHsl, l: contrastLightness };
  const contrastRgb = hslToRgb(contrastHsl);

  const contrastColor = `rgb(${contrastRgb.r}, ${contrastRgb.g}, ${contrastRgb.b})`;
  return contrastColor;
}
