/**
 * Converts OKLCH color strings to HEX format.
 * Monaco Editor only accepts HEX or RGB colors.
 */
export function oklchToHex(oklch: string): string {
  if (!oklch || typeof oklch !== "string") return "#000000";

  // If it's already a hex or rgb, return it
  if (oklch.startsWith("#") || oklch.startsWith("rgb")) return oklch;

  // Basic OKLCH parsing: oklch(L C H) or oklch(L C H / A)
  const match = oklch.match(
    /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/i,
  );
  if (!match) return "#000000";

  const l = parseFloat(match[1]);
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);
  const a = match[4] ? parseFloat(match[4]) : 1;

  // Simple approximation of OKLCH to RGB
  // This is a simplified conversion for UI purposes.
  // Real OKLCH to RGB is complex, but for themes, we just need something close and valid.

  const { r, g, b } = oklchToRgb(l, c, h);

  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  if (a < 1) {
    const alpha = toHex(Math.round(a * 255));
    return hex + alpha;
  }

  return hex;
}

/**
 * Simplified OKLCH to RGB conversion
 */
function oklchToRgb(l: number, c: number, h: number) {
  // Convert hue to radians
  const hr = (h / 360) * 2 * Math.PI;

  // Approximate Lab components
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  // Convert Lab to XYZ (D65)
  const L = l;
  const X = L + 0.3963377774 * a + 0.2158037573 * b;
  const Y = L - 0.1055613458 * a - 0.0638541728 * b;
  const Z = L - 0.0894841775 * a - 1.291485548 * b;

  // Convert XYZ to linear RGB
  let r_lin = +4.0767245293 * X - 3.3072168827 * Y + 0.2307590544 * Z;
  let g_lin = -1.2681437731 * X + 2.6093323231 * Y - 0.341134429 * Z;
  let b_lin = -0.0041119885 * X - 0.7034763098 * Y + 1.706864634 * Z;

  // Gamma correction
  const gamma = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

  return {
    r: Math.round(gamma(r_lin) * 255),
    g: Math.round(gamma(g_lin) * 255),
    b: Math.round(gamma(b_lin) * 255),
  };
}

/**
 * Gets a CSS variable value from the document root and ensures it's in a format Monaco understands.
 */
export function getMonacoColor(variableName: string): string {
  if (typeof window === "undefined") return "#000000";

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  if (!value) return "#000000";

  if (value.includes("oklch")) {
    return oklchToHex(value);
  }

  return value;
}
