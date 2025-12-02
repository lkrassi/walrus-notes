// Utilities for color contrast and readable text color
export function hexToRgb(hex?: string): [number, number, number] | null {
  if (!hex) return null;
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  if (h.length === 6) {
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  return null;
}

function srgbToLinear(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex?: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb;
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function contrastRatio(hexA?: string, hexB?: string) {
  const la = relativeLuminance(hexA) + 0.05;
  const lb = relativeLuminance(hexB) + 0.05;
  return la > lb ? la / lb : lb / la;
}

export function readableTextColor(
  bgHex?: string,
  minContrast = 4.5
): '#000000' | '#ffffff' {
  if (!bgHex) return '#000000';
  const blackContrast = contrastRatio(bgHex, '#000000');
  const whiteContrast = contrastRatio(bgHex, '#ffffff');

  if (blackContrast >= minContrast && blackContrast >= whiteContrast) {
    return '#000000';
  }
  if (whiteContrast >= minContrast && whiteContrast >= blackContrast) {
    return '#ffffff';
  }

  return blackContrast > whiteContrast ? '#000000' : '#ffffff';
}

export default {
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  readableTextColor,
};
