'use client';

import { useState } from 'react';

interface DailyEarning {
  date: string;
  deliveries: number;
  base_earnings: number;
  tips: number;
  bonuses: number;
  total: number;
}

// Mock data
const mockEarnings: DailyEarning[] = [
  { date: 'Aujourd\'hui', deliveries: 12, base_earnings: 420, tips: 45, bonuses: 20, total: 485 },
  { date: 'Hier', deliveries: 15, base_earnings: 525, tips: 60, bonuses: 0, total: 585 },
  { date: '09 Jan', deliveries: 11, base_earnings: 385, tips: 35, bonuses: 50, total: 470 },
  { date: '08 Jan', deliveries: 14, base_earnings: 490, tips: 55, bonuses: 0, total: 545 },
  { date: '07 Jan', deliveries: 10, base_earnings: 350, tips: 40, bonuses: 0, total: 390 },
  { date: '06 Jan', deliveries: 13, base_earnings: 455, tips: 50, bonuses: 30, total: 535 },
  { date: '05 Jan', deliveries: 9, base_earnings: 315, tips: 30, bonuses: 0, total: 345 },
];

const weeklyTotal = mockEarnings.reduce((sum, day) => sum + day.total, 0);
const weeklyDeliveries = mockEarnings.reduce((sum, day) => sum + day.deliveries, 0);
const weeklyTips = mockEarnings.reduce((sum, day) => sum + day.tips, 0);
const weeklyBonuses = mockEarnings.reduce((sum, day) => sum + day.bonuses, 0);

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="app-header">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Mes Gains</h1>
        <div className="flex items-center gap-2">
          {(['week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                selectedPeriod === period
                  ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
              }`}
            >
              {period === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Main Earnings Display */}
        <div className="card p-6 text-center bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
          <p className="text-sm text-[var(--text-muted)] mb-2">Total cette semaine</p>
          <p className="earnings-display">{weeklyTotal.toLocaleString('fr-FR')} DH</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {weeklyDeliveries} livraisons completees
          </p>
        </div>

        {/* Stats Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {(weeklyTotal / weeklyDeliveries).toFixed(0)} DH
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Moy. / livraison</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xl font-bold text-emerald-400">{weeklyTips} DH</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Pourboires</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xl font-bold text-purple-400">{weeklyBonuses} DH</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Bonus</p>
          </div>
        </div>

        {/* Weekly Chart (Simple bar representation) */}
        <div className="card p-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Evolution des gains</h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {mockEarnings.slice().reverse().map((day, index) => {
              const maxEarning = Math.max(...mockEarnings.map((d) => d.total));
              const height = (day.total / maxEarning) * 100;
              const isToday = index === mockEarnings.length - 1;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">{day.total}</span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      isToday ? 'bg-[var(--brand-primary)]' : 'bg-[var(--bg-elevated)]'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-[var(--text-muted)]">
                    {day.date.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Detail par jour
          </h3>
          <div className="space-y-2">
            {mockEarnings.map((day, index) => (
              <div key={index} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--text-primary)]">{day.date}</span>
                  <span className="font-bold text-[var(--brand-primary)]">{day.total} DH</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>{day.deliveries} livraisons</span>
                  <div className="flex items-center gap-3">
                    <span>Base: {day.base_earnings} DH</span>
                    {day.tips > 0 && <span className="text-emerald-400">+{day.tips} tips</span>}
                    {day.bonuses > 0 && <span className="text-purple-400">+{day.bonuses} bonus</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout Info */}
        <div className="card p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[var(--text-primary)]">Prochain versement</p>
              <p className="text-sm text-[var(--text-muted)]">Dimanche 12 Janvier 2026</p>
            </div>
            <span className="text-xl font-bold text-blue-400">3,355 DH</span>
          </div>
        </div>
      </div>
    </div>
  );
}
