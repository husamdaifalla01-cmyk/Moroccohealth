import * as React from 'react';
import { cn } from '../utils/cn';
import { colors, type PriorityTier } from '../theme/colors';

export interface PriorityIndicatorProps {
  tier: PriorityTier;
  score?: number;
  className?: string;
}

const TIER_LABELS: Record<PriorityTier, string> = {
  critical: 'CRIT',
  high: 'HIGH',
  normal: 'NORM',
  low: 'LOW',
};

export function PriorityIndicator({ tier, score, className }: PriorityIndicatorProps) {
  const colorConfig = colors.priority[tier];

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded px-2 py-1',
        colorConfig.bg,
        colorConfig.border,
        'border',
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', colorConfig.accent)} />
      <span className={cn('text-[10px] font-bold uppercase tracking-wider', colorConfig.text)}>
        {TIER_LABELS[tier]}
      </span>
      {score !== undefined && (
        <span className="font-mono text-[10px] tabular-nums text-slate-500">
          {score}
        </span>
      )}
    </div>
  );
}
