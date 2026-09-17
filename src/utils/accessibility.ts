/**
 * Compute relative luminance of a color (0-1).
 * Input: hex color string like '#RRGGBB'
 */
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const linearize = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Compute contrast ratio between two colors.
 * Returns a value between 1 and 21.
 */
export function getContrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color pair meets WCAG 2.1 AA requirements.
 */
export function meetsWCAG_AA(
  fg: string,
  bg: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(fg, bg);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}
