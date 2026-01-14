import * as React from 'react';
import { cn } from '../utils/cn';
import { colors, type StatusType } from '../theme/colors';

const STATUS_CONFIG: Record<StatusType, { label: string; labelFr: string; labelAr: string }> = {
  pending: { label: 'Pending', labelFr: 'En attente', labelAr: 'قيد الانتظار' },
  processing: { label: 'Processing', labelFr: 'En traitement', labelAr: 'جاري المعالجة' },
  verified: { label: 'Verified', labelFr: 'Vérifié', labelAr: 'تم التحقق' },
  preparing: { label: 'Preparing', labelFr: 'En préparation', labelAr: 'جاري التحضير' },
  ready: { label: 'Ready', labelFr: 'Prêt', labelAr: 'جاهز' },
  delivering: { label: 'Delivering', labelFr: 'En livraison', labelAr: 'جاري التوصيل' },
  delivered: { label: 'Delivered', labelFr: 'Livré', labelAr: 'تم التسليم' },
  rejected: { label: 'Rejected', labelFr: 'Rejeté', labelAr: 'مرفوض' },
  cancelled: { label: 'Cancelled', labelFr: 'Annulé', labelAr: 'ملغى' },
};

export interface StatusBadgeProps {
  status: StatusType;
  locale?: 'en' | 'fr' | 'ar';
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  locale = 'fr',
  className,
  showDot = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const colorConfig = colors.status[status];
  const label = locale === 'ar' ? config.labelAr : locale === 'fr' ? config.labelFr : config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        colorConfig.bg,
        colorConfig.text,
        className
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', colorConfig.dot)} />
      )}
      {label}
    </span>
  );
}
