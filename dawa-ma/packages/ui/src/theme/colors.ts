/**
 * DAWA.ma Design System - Semantic Colors
 * Color as signal, not decoration
 */

export const colors = {
  // Priority Colors - Queue Management
  priority: {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      accent: 'bg-red-500',
    },
    high: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      accent: 'bg-amber-500',
    },
    normal: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      accent: 'bg-slate-500',
    },
    low: {
      bg: 'bg-slate-50/50',
      border: 'border-slate-100',
      text: 'text-slate-500',
      accent: 'bg-slate-400',
    },
  },

  // Status Colors - Prescription Lifecycle
  status: {
    pending: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
    },
    processing: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
    verified: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    preparing: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
    },
    ready: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      dot: 'bg-cyan-500',
    },
    delivering: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      dot: 'bg-violet-500',
    },
    delivered: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-500',
    },
    cancelled: {
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      dot: 'bg-slate-400',
    },
  },

  // Alert Colors - Warnings & Interactions
  alert: {
    interaction: {
      major: 'bg-red-500 text-white',
      moderate: 'bg-amber-500 text-white',
      minor: 'bg-yellow-400 text-slate-900',
    },
    controlled: 'bg-purple-600 text-white',
    fraud: 'bg-red-600 text-white',
  },

  // Semantic Surface Colors
  surface: {
    base: 'bg-white',
    muted: 'bg-slate-50',
    elevated: 'bg-white shadow-sm',
    overlay: 'bg-slate-900/50',
  },

  // Text Colors
  text: {
    primary: 'text-slate-900',
    secondary: 'text-slate-600',
    muted: 'text-slate-400',
    inverse: 'text-white',
  },
} as const;

export type PriorityTier = keyof typeof colors.priority;
export type StatusType = keyof typeof colors.status;
