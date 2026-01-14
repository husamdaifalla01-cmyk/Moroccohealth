/**
 * DAWA.ma Design System - Typography
 * Newspaper-level information density
 * Monospace accents for medical/technical precision
 */

export const typography = {
  // Font Families
  font: {
    sans: 'font-sans',
    mono: 'font-mono', // For medical codes, IDs, dosages
  },

  // Heading Styles - Tight line heights for density
  heading: {
    h1: 'text-2xl font-semibold tracking-tight leading-tight',
    h2: 'text-xl font-semibold tracking-tight leading-tight',
    h3: 'text-lg font-medium leading-snug',
    h4: 'text-base font-medium leading-snug',
  },

  // Body Text
  body: {
    default: 'text-sm leading-normal',
    small: 'text-xs leading-normal',
    tiny: 'text-[11px] leading-tight',
  },

  // Medical/Technical - Monospace
  medical: {
    code: 'font-mono text-xs tracking-wide', // Prescription codes
    dosage: 'font-mono text-sm tabular-nums', // Drug dosages
    id: 'font-mono text-[10px] tracking-wider uppercase', // IDs, reference numbers
    timestamp: 'font-mono text-xs tabular-nums text-slate-500',
  },

  // Labels & UI
  label: {
    default: 'text-xs font-medium uppercase tracking-wide text-slate-500',
    value: 'text-sm font-medium text-slate-900',
  },

  // Status Text
  status: {
    badge: 'text-[10px] font-semibold uppercase tracking-wider',
  },
} as const;
