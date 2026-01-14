import * as React from 'react';
import { cn } from '../utils/cn';
import { colors, type PriorityTier, type StatusType } from '../theme/colors';
import { StatusBadge } from './status-badge';
import { PriorityIndicator } from './priority-indicator';
import { Button } from './button';

export interface QueueItemProps {
  id: string;
  priorityTier: PriorityTier;
  priorityScore?: number;
  status: StatusType;

  // Patient Info
  patientName: string;
  isChronicPatient?: boolean;
  isPremiumPatient?: boolean;

  // Order Info
  itemsCount: number;
  totalAmount?: number;
  createdAt: Date;

  // Flags
  hasControlledSubstance?: boolean;
  hasInteractionWarning?: boolean;
  needsPharmacistReview?: boolean;

  // AI Verification
  aiConfidence?: number;
  aiFlags?: string[];

  // Time
  timeInQueueMinutes: number;
  slaBreach?: number;

  // Actions
  onVerify?: () => void;
  onReject?: () => void;
  onStartPrep?: () => void;
  onSelect?: () => void;

  // Selection state
  isSelected?: boolean;
  locale?: 'en' | 'fr' | 'ar';
  className?: string;
}

export function QueueItem({
  id,
  priorityTier,
  priorityScore,
  status,
  patientName,
  isChronicPatient,
  isPremiumPatient,
  itemsCount,
  totalAmount,
  createdAt,
  hasControlledSubstance,
  hasInteractionWarning,
  needsPharmacistReview,
  aiConfidence,
  aiFlags,
  timeInQueueMinutes,
  slaBreach,
  onVerify,
  onReject,
  onStartPrep,
  onSelect,
  isSelected,
  locale = 'fr',
  className,
}: QueueItemProps) {
  const colorConfig = colors.priority[priorityTier];

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'group relative flex cursor-pointer items-stretch border-b transition-colors',
        colorConfig.bg,
        isSelected ? 'ring-2 ring-slate-900 ring-offset-1' : 'hover:bg-slate-50',
        className
      )}
    >
      {/* Priority Stripe */}
      <div className={cn('w-1 flex-shrink-0', colorConfig.accent)} />

      {/* Main Content */}
      <div className="flex flex-1 items-center gap-4 px-4 py-3">
        {/* Priority & Time */}
        <div className="flex flex-col items-center gap-1">
          <PriorityIndicator tier={priorityTier} score={priorityScore} />
          <span className="font-mono text-[10px] tabular-nums text-slate-500">
            {timeInQueueMinutes}m
          </span>
          {slaBreach && slaBreach < 30 && (
            <span className="font-mono text-[10px] font-bold tabular-nums text-red-600">
              SLA {slaBreach}m
            </span>
          )}
        </div>

        {/* Patient & Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">{patientName}</span>
            {isChronicPatient && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-blue-700">
                Chronic
              </span>
            )}
            {isPremiumPatient && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-700">
                Premium
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="font-mono text-[10px] uppercase tracking-wider">{id.slice(0, 8)}</span>
            <span>{itemsCount} item{itemsCount !== 1 ? 's' : ''}</span>
            {totalAmount && (
              <span className="font-mono tabular-nums">{totalAmount.toFixed(2)} MAD</span>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="flex flex-col items-end gap-1">
          {hasControlledSubstance && (
            <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase', colors.alert.controlled)}>
              Ctrl
            </span>
          )}
          {hasInteractionWarning && (
            <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase', colors.alert.interaction.major)}>
              Intx
            </span>
          )}
          {needsPharmacistReview && (
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
              Review
            </span>
          )}
        </div>

        {/* AI Confidence */}
        {aiConfidence !== undefined && (
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">AI</span>
            <span className={cn(
              'font-mono text-sm font-bold tabular-nums',
              aiConfidence >= 0.9 ? 'text-emerald-600' :
              aiConfidence >= 0.7 ? 'text-amber-600' : 'text-red-600'
            )}>
              {Math.round(aiConfidence * 100)}%
            </span>
          </div>
        )}

        {/* Status */}
        <StatusBadge status={status} locale={locale} />

        {/* Quick Actions */}
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {status === 'pending' && onVerify && (
            <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); onVerify(); }} shortcut="V">
              Verify
            </Button>
          )}
          {status === 'pending' && onReject && (
            <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onReject(); }} shortcut="R">
              Reject
            </Button>
          )}
          {status === 'verified' && onStartPrep && (
            <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); onStartPrep(); }} shortcut="P">
              Prepare
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
