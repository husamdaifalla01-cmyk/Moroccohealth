/**
 * DAWA.ma V10 - Priority Score Computation
 * Expert-level priority queue algorithm for pharmacy workflow
 */

import type { OrderQueueItem, PriorityTier, VerificationStatus } from './types';

/**
 * Configuration for priority score weights
 * Tuned for Morocco pharmacy operations
 */
export const PRIORITY_CONFIG = {
  // Base score for all orders
  BASE_SCORE: 50,

  // Time pressure weights
  TIME_IN_QUEUE: {
    MAX_POINTS: 30,
    MINUTES_PER_POINT: 3, // +1 point per 3 minutes in queue
  },

  // SLA breach risk weights
  SLA_BREACH: {
    UNDER_30_MIN: 20,
    UNDER_60_MIN: 15,
    UNDER_120_MIN: 10,
    OVER_120_MIN: 5,
  },

  // Patient type bonuses
  PATIENT: {
    CHRONIC: 10,
    PREMIUM: 5,
    REFILL_HISTORY: 3,
  },

  // Order complexity adjustments
  ORDER: {
    CONTROLLED_SUBSTANCE: 5, // Priority boost for special handling
    INTERACTION_WARNING: -10, // Allow more time for review
    LARGE_ORDER: 3, // >5 items
  },

  // AI verification adjustments
  AI: {
    NEEDS_REVIEW: 15, // Boost to pharmacist attention
    REJECTED: -20, // Deprioritize rejected orders
    LOW_CONFIDENCE: 8, // <70% confidence
  },

  // Tier thresholds
  TIERS: {
    CRITICAL: 85,
    HIGH: 65,
    NORMAL: 35,
    LOW: 0,
  },
} as const;

/**
 * Compute priority score for an order
 * Score range: 0-100
 *
 * @param order - Order queue item with all context
 * @returns Priority score (0-100)
 */
export function computePriorityScore(
  order: Pick<
    OrderQueueItem,
    | 'created_at'
    | 'promised_delivery_at'
    | 'time_in_queue_minutes'
    | 'patient'
    | 'has_controlled_substance'
    | 'has_interaction_warning'
    | 'items_count'
    | 'ai_verification'
  >
): number {
  let score = PRIORITY_CONFIG.BASE_SCORE;

  // Time Pressure (+0 to +30)
  const timePoints = Math.min(
    PRIORITY_CONFIG.TIME_IN_QUEUE.MAX_POINTS,
    Math.floor(order.time_in_queue_minutes / PRIORITY_CONFIG.TIME_IN_QUEUE.MINUTES_PER_POINT)
  );
  score += timePoints;

  // SLA Breach Risk (+0 to +20)
  if (order.promised_delivery_at) {
    const now = new Date();
    const minutesToBreach = Math.floor(
      (order.promised_delivery_at.getTime() - now.getTime()) / (1000 * 60)
    );

    if (minutesToBreach < 30) {
      score += PRIORITY_CONFIG.SLA_BREACH.UNDER_30_MIN;
    } else if (minutesToBreach < 60) {
      score += PRIORITY_CONFIG.SLA_BREACH.UNDER_60_MIN;
    } else if (minutesToBreach < 120) {
      score += PRIORITY_CONFIG.SLA_BREACH.UNDER_120_MIN;
    } else {
      score += PRIORITY_CONFIG.SLA_BREACH.OVER_120_MIN;
    }
  }

  // Chronic Patient Priority (+10)
  if (order.patient.is_chronic_patient) {
    score += PRIORITY_CONFIG.PATIENT.CHRONIC;
  }

  // Premium Patient (+5)
  if (order.patient.preferred_tier) {
    score += PRIORITY_CONFIG.PATIENT.PREMIUM;
  }

  // Refill History (+3)
  if (order.patient.has_refill_history) {
    score += PRIORITY_CONFIG.PATIENT.REFILL_HISTORY;
  }

  // Controlled Substance (+5, requires special handling)
  if (order.has_controlled_substance) {
    score += PRIORITY_CONFIG.ORDER.CONTROLLED_SUBSTANCE;
  }

  // Interaction Warning (-10, allow time for review)
  if (order.has_interaction_warning) {
    score += PRIORITY_CONFIG.ORDER.INTERACTION_WARNING;
  }

  // Large Order (+3)
  if (order.items_count > 5) {
    score += PRIORITY_CONFIG.ORDER.LARGE_ORDER;
  }

  // AI Verification Status Adjustments
  if (order.ai_verification.status === 'needs_review') {
    score += PRIORITY_CONFIG.AI.NEEDS_REVIEW;
  } else if (order.ai_verification.status === 'rejected') {
    score += PRIORITY_CONFIG.AI.REJECTED;
  }

  // Low AI Confidence (<70%)
  if (order.ai_verification.confidence < 0.7 && order.ai_verification.status !== 'rejected') {
    score += PRIORITY_CONFIG.AI.LOW_CONFIDENCE;
  }

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Determine priority tier from score
 */
export function getPriorityTier(score: number): PriorityTier {
  if (score >= PRIORITY_CONFIG.TIERS.CRITICAL) return 'CRITICAL';
  if (score >= PRIORITY_CONFIG.TIERS.HIGH) return 'HIGH';
  if (score >= PRIORITY_CONFIG.TIERS.NORMAL) return 'NORMAL';
  return 'LOW';
}

/**
 * Get CSS color variable for priority tier
 */
export function getPriorityColor(tier: PriorityTier): string {
  const colors: Record<PriorityTier, string> = {
    CRITICAL: 'var(--priority-critical)',
    HIGH: 'var(--priority-high)',
    NORMAL: 'var(--priority-normal)',
    LOW: 'var(--priority-low)',
  };
  return colors[tier];
}

/**
 * Calculate SLA breach time in minutes
 * Returns null if no promised delivery time
 */
export function calculateSLABreachMinutes(promisedDeliveryAt: Date | null): number | null {
  if (!promisedDeliveryAt) return null;

  const now = new Date();
  const minutesToBreach = Math.floor(
    (promisedDeliveryAt.getTime() - now.getTime()) / (1000 * 60)
  );

  return minutesToBreach;
}

/**
 * Calculate time in queue in minutes
 */
export function calculateTimeInQueue(createdAt: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
}

/**
 * Determine available actions based on order status and AI verification
 */
export function getAvailableActions(
  status: OrderQueueItem['status'],
  aiStatus: VerificationStatus,
  hasControlledSubstance: boolean
): OrderQueueItem['available_actions'] {
  const actions: OrderQueueItem['available_actions'] = ['VIEW_PRESCRIPTION'];

  switch (status) {
    case 'PENDING_VERIFICATION':
    case 'PENDING_PHARMACIST_REVIEW':
      if (aiStatus === 'approved' || aiStatus === 'needs_review') {
        actions.push('VERIFY', 'REJECT', 'CHECK_INTERACTIONS');
      }
      if (aiStatus === 'needs_review') {
        actions.push('REQUEST_CLARIFICATION');
      }
      break;

    case 'PHARMACIST_APPROVED':
      actions.push('START_PREP');
      break;

    case 'PREPARING':
      actions.push('MARK_READY');
      break;

    case 'READY':
      actions.push('ASSIGN_COURIER', 'CALL_PATIENT');
      break;

    case 'AWAITING_COURIER':
      actions.push('CALL_PATIENT');
      break;
  }

  // Controlled substances require interaction check
  if (hasControlledSubstance && !actions.includes('CHECK_INTERACTIONS')) {
    actions.push('CHECK_INTERACTIONS');
  }

  return actions;
}

/**
 * Sort orders by priority (highest first)
 */
export function sortByPriority<T extends { priority_score: number }>(orders: T[]): T[] {
  return [...orders].sort((a, b) => b.priority_score - a.priority_score);
}

/**
 * Group orders by priority tier
 */
export function groupByPriorityTier<T extends { priority_score: number }>(
  orders: T[]
): Record<PriorityTier, T[]> {
  const groups: Record<PriorityTier, T[]> = {
    CRITICAL: [],
    HIGH: [],
    NORMAL: [],
    LOW: [],
  };

  for (const order of orders) {
    const tier = getPriorityTier(order.priority_score);
    groups[tier].push(order);
  }

  // Sort each group by score (highest first)
  for (const tier of Object.keys(groups) as PriorityTier[]) {
    groups[tier] = sortByPriority(groups[tier]);
  }

  return groups;
}

/**
 * Get urgency label in French
 */
export function getUrgencyLabel(tier: PriorityTier): string {
  const labels: Record<PriorityTier, string> = {
    CRITICAL: 'Critique',
    HIGH: 'Urgent',
    NORMAL: 'Normal',
    LOW: 'Faible',
  };
  return labels[tier];
}

/**
 * Calculate estimated wait time based on queue position and pharmacy metrics
 */
export function estimateWaitTime(
  queuePosition: number,
  avgFulfillmentMinutes: number = 15
): number {
  // Simple estimation: position * average fulfillment time
  // In production, this would use pharmacy intelligence metrics
  return Math.ceil(queuePosition * avgFulfillmentMinutes);
}
