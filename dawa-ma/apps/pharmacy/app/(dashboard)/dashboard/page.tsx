'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/context';

// Priority tier types
type PriorityTier = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
type OrderStatus = 'PENDING_VERIFICATION' | 'NEEDS_PHARMACIST' | 'PREPARING' | 'READY' | 'AWAITING_COURIER';
type AIStatus = 'approved' | 'needs_review' | 'rejected';

interface OrderQueueItem {
  id: string;
  orderNumber: string;
  priority_score: number;
  priority_tier: PriorityTier;
  time_in_queue_minutes: number;
  sla_breach_in_minutes: number | null;
  patient: {
    name: string;
    is_chronic_patient: boolean;
    preferred_tier: boolean;
  };
  status: OrderStatus;
  items_count: number;
  total: string;
  has_controlled_substance: boolean;
  has_interaction_warning: boolean;
  ai_verification: {
    status: AIStatus;
    confidence: number;
    attention_flags: string[];
  };
}

// Mock data for demonstration - Priority Queue
const mockOrders: OrderQueueItem[] = [
  {
    id: '1',
    orderNumber: 'DW-2026-00128',
    priority_score: 92,
    priority_tier: 'CRITICAL',
    time_in_queue_minutes: 45,
    sla_breach_in_minutes: 15,
    patient: { name: 'Fatima Zahra B.', is_chronic_patient: true, preferred_tier: true },
    status: 'NEEDS_PHARMACIST',
    items_count: 4,
    total: '287.50 DH',
    has_controlled_substance: false,
    has_interaction_warning: true,
    ai_verification: { status: 'needs_review', confidence: 0.73, attention_flags: ['interaction_detected', 'dosage_unusual'] },
  },
  {
    id: '2',
    orderNumber: 'DW-2026-00127',
    priority_score: 78,
    priority_tier: 'HIGH',
    time_in_queue_minutes: 28,
    sla_breach_in_minutes: 32,
    patient: { name: 'Ahmed K.', is_chronic_patient: true, preferred_tier: false },
    status: 'PENDING_VERIFICATION',
    items_count: 2,
    total: '156.00 DH',
    has_controlled_substance: false,
    has_interaction_warning: false,
    ai_verification: { status: 'approved', confidence: 0.94, attention_flags: [] },
  },
  {
    id: '3',
    orderNumber: 'DW-2026-00126',
    priority_score: 65,
    priority_tier: 'NORMAL',
    time_in_queue_minutes: 18,
    sla_breach_in_minutes: 72,
    patient: { name: 'Sara L.', is_chronic_patient: false, preferred_tier: false },
    status: 'PREPARING',
    items_count: 1,
    total: '45.00 DH',
    has_controlled_substance: false,
    has_interaction_warning: false,
    ai_verification: { status: 'approved', confidence: 0.98, attention_flags: [] },
  },
  {
    id: '4',
    orderNumber: 'DW-2026-00125',
    priority_score: 58,
    priority_tier: 'NORMAL',
    time_in_queue_minutes: 12,
    sla_breach_in_minutes: 88,
    patient: { name: 'Mohamed R.', is_chronic_patient: false, preferred_tier: true },
    status: 'READY',
    items_count: 3,
    total: '198.75 DH',
    has_controlled_substance: false,
    has_interaction_warning: false,
    ai_verification: { status: 'approved', confidence: 0.96, attention_flags: [] },
  },
  {
    id: '5',
    orderNumber: 'DW-2026-00124',
    priority_score: 42,
    priority_tier: 'LOW',
    time_in_queue_minutes: 5,
    sla_breach_in_minutes: 115,
    patient: { name: 'Khadija M.', is_chronic_patient: false, preferred_tier: false },
    status: 'AWAITING_COURIER',
    items_count: 2,
    total: '89.00 DH',
    has_controlled_substance: false,
    has_interaction_warning: false,
    ai_verification: { status: 'approved', confidence: 0.99, attention_flags: [] },
  },
];

// Stats data
const stats = {
  queue_depth: 5,
  avg_wait_minutes: 21.6,
  sla_at_risk: 2,
  completed_today: 47,
  revenue_today: '12,450 DH',
  verification_rate: '94.2%',
};

const priorityColors: Record<PriorityTier, string> = {
  CRITICAL: 'priority-critical',
  HIGH: 'priority-high',
  NORMAL: 'priority-normal',
  LOW: 'priority-low',
};

const statusLabels: Record<OrderStatus, { label: string; badge: string }> = {
  PENDING_VERIFICATION: { label: 'Pending', badge: 'badge-info' },
  NEEDS_PHARMACIST: { label: 'Review', badge: 'badge-warning' },
  PREPARING: { label: 'Preparing', badge: 'badge-info' },
  READY: { label: 'Ready', badge: 'badge-verify' },
  AWAITING_COURIER: { label: 'Courier', badge: 'badge-neutral' },
};

const aiStatusBadge: Record<AIStatus, string> = {
  approved: 'badge-verify',
  needs_review: 'badge-warning',
  rejected: 'badge-danger',
};

export default function DashboardPage() {
  const { t, dir } = useTranslations('dashboard');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [orders] = useState(mockOrders);

  // Keyboard navigation for queue (J/K within queue, V to verify, R to reject)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'arrowdown':
        case 'j':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, orders.length - 1));
          break;
        case 'arrowup':
        case 'k':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'v':
          e.preventDefault();
          // Verify action
          console.log('Verify order:', orders[selectedIndex].orderNumber);
          break;
        case 'r':
          e.preventDefault();
          // Reject action
          console.log('Reject order:', orders[selectedIndex].orderNumber);
          break;
      }
    },
    [orders, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-6 gap-4">
        <StatCard label="Queue Depth" value={stats.queue_depth.toString()} highlight />
        <StatCard label="Avg Wait" value={`${stats.avg_wait_minutes}m`} />
        <StatCard label="SLA at Risk" value={stats.sla_at_risk.toString()} danger={stats.sla_at_risk > 0} />
        <StatCard label="Completed" value={stats.completed_today.toString()} />
        <StatCard label="Revenue" value={stats.revenue_today} />
        <StatCard label="AI Accuracy" value={stats.verification_rate} />
      </div>

      {/* Priority Queue */}
      <div className="bg-[var(--bg-secondary)] rounded-lg overflow-hidden">
        {/* Queue Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Priority Queue</h2>
            <span className="text-xs text-[var(--text-muted)]">{orders.length} orders</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <kbd className="kbd">J</kbd><kbd className="kbd">K</kbd>
            <span>navigate</span>
            <span className="mx-2">|</span>
            <kbd className="kbd">V</kbd>
            <span>verify</span>
            <kbd className="kbd ml-2">R</kbd>
            <span>reject</span>
          </div>
        </div>

        {/* Queue Items */}
        <div className="divide-y divide-white/[0.04]">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={`queue-item ${priorityColors[order.priority_tier]} ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="flex items-center gap-4">
                {/* Priority Score */}
                <div className="w-12 text-center">
                  <span className={`text-lg font-mono font-bold ${
                    order.priority_tier === 'CRITICAL' ? 'text-[var(--priority-critical)]' :
                    order.priority_tier === 'HIGH' ? 'text-[var(--priority-high)]' :
                    'text-[var(--text-secondary)]'
                  }`}>
                    {order.priority_score}
                  </span>
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[var(--text-primary)]">{order.orderNumber}</span>
                    {order.patient.is_chronic_patient && (
                      <span className="badge badge-info">Chronic</span>
                    )}
                    {order.patient.preferred_tier && (
                      <span className="badge badge-verify">Premium</span>
                    )}
                    {order.has_interaction_warning && (
                      <span className="badge badge-warning">Interaction</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                    <span>{order.patient.name}</span>
                    <span>•</span>
                    <span>{order.items_count} items</span>
                    <span>•</span>
                    <span>{order.total}</span>
                  </div>
                </div>

                {/* Time in Queue */}
                <div className="text-right">
                  <div className={`text-sm font-mono ${
                    order.sla_breach_in_minutes && order.sla_breach_in_minutes < 30
                      ? 'text-[var(--color-danger)]'
                      : 'text-[var(--text-secondary)]'
                  }`}>
                    {order.time_in_queue_minutes}m
                  </div>
                  {order.sla_breach_in_minutes && order.sla_breach_in_minutes < 60 && (
                    <div className="text-xs text-[var(--color-danger)]">
                      SLA in {order.sla_breach_in_minutes}m
                    </div>
                  )}
                </div>

                {/* AI Status */}
                <div className="w-24 text-center">
                  <span className={`badge ${aiStatusBadge[order.ai_verification.status]}`}>
                    {order.ai_verification.status === 'approved' ? 'AI OK' :
                     order.ai_verification.status === 'needs_review' ? 'Review' : 'Rejected'}
                  </span>
                  <div className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                    {(order.ai_verification.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Status */}
                <div className="w-24">
                  <span className={`badge ${statusLabels[order.status].badge}`}>
                    {statusLabels[order.status].label}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {(order.status === 'PENDING_VERIFICATION' || order.status === 'NEEDS_PHARMACIST') && (
                    <>
                      <button className="btn-action btn-verify">
                        Verify
                      </button>
                      <button className="btn-action btn-reject">
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === 'PREPARING' && (
                    <button className="btn-action btn-verify">
                      Ready
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Order Detail Panel */}
      {orders[selectedIndex] && (
        <div className="bg-[var(--bg-secondary)] rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                Order {orders[selectedIndex].orderNumber}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Patient: {orders[selectedIndex].patient.name}
              </p>
            </div>
            {orders[selectedIndex].ai_verification.attention_flags.length > 0 && (
              <div className="bg-[var(--color-warning)]/10 rounded px-3 py-2">
                <p className="text-xs font-medium text-[var(--color-warning)] mb-1">Attention Required</p>
                <ul className="text-xs text-[var(--text-secondary)] space-y-0.5">
                  {orders[selectedIndex].ai_verification.attention_flags.map((flag, i) => (
                    <li key={i}>• {flag.replace('_', ' ')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  highlight = false,
  danger = false
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className={`bg-[var(--bg-secondary)] rounded-lg p-4 ${highlight ? 'border border-[var(--accent-primary)]/30' : ''}`}>
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`text-xl font-mono font-bold ${
        danger ? 'text-[var(--color-danger)]' :
        highlight ? 'text-[var(--accent-primary)]' :
        'text-[var(--text-primary)]'
      }`}>
        {value}
      </p>
    </div>
  );
}
