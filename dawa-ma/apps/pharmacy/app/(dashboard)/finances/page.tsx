'use client';

import { useState } from 'react';

// Types for finance data
interface Transaction {
  id: string;
  order_id: string;
  patient_name: string;
  amount: number;
  commission: number;
  net_amount: number;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

// Mock transactions data
const mockTransactions: Transaction[] = [
  { id: 'TXN-001', order_id: 'DW-2026-00128', patient_name: 'Youssef Mansouri', amount: 135, commission: 6.75, net_amount: 128.25, date: '2026-01-11', status: 'completed' },
  { id: 'TXN-002', order_id: 'DW-2026-00127', patient_name: 'Nadia Karimi', amount: 65, commission: 3.25, net_amount: 61.75, date: '2026-01-11', status: 'completed' },
  { id: 'TXN-003', order_id: 'DW-2026-00126', patient_name: 'Ahmed Benali', amount: 170, commission: 8.50, net_amount: 161.50, date: '2026-01-11', status: 'pending' },
  { id: 'TXN-004', order_id: 'DW-2026-00125', patient_name: 'Fatima Zahra', amount: 130, commission: 6.50, net_amount: 123.50, date: '2026-01-10', status: 'completed' },
  { id: 'TXN-005', order_id: 'DW-2026-00124', patient_name: 'Mohamed Kabbaj', amount: 265, commission: 13.25, net_amount: 251.75, date: '2026-01-10', status: 'completed' },
  { id: 'TXN-006', order_id: 'DW-2026-00123', patient_name: 'Sara Lahlou', amount: 55, commission: 2.75, net_amount: 52.25, date: '2026-01-10', status: 'refunded' },
  { id: 'TXN-007', order_id: 'DW-2026-00122', patient_name: 'Hassan Bennani', amount: 80, commission: 4.00, net_amount: 76.00, date: '2026-01-09', status: 'completed' },
  { id: 'TXN-008', order_id: 'DW-2026-00121', patient_name: 'Leila Amrani', amount: 195, commission: 9.75, net_amount: 185.25, date: '2026-01-09', status: 'completed' },
];

// Mock daily revenue for chart
const mockDailyRevenue: DailyRevenue[] = [
  { date: '05 Jan', revenue: 3250, orders: 28 },
  { date: '06 Jan', revenue: 4180, orders: 35 },
  { date: '07 Jan', revenue: 3890, orders: 32 },
  { date: '08 Jan', revenue: 5120, orders: 42 },
  { date: '09 Jan', revenue: 4650, orders: 38 },
  { date: '10 Jan', revenue: 4780, orders: 40 },
  { date: '11 Jan', revenue: 2850, orders: 24 },
];

const statusConfig = {
  completed: { label: 'Complété', color: 'badge-verify' },
  pending: { label: 'En attente', color: 'badge-warning' },
  refunded: { label: 'Remboursé', color: 'badge-critical' },
};

export default function FinancesPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [dailyRevenue] = useState<DailyRevenue[]>(mockDailyRevenue);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  // Calculate stats
  const stats = {
    totalRevenue: transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0),
    totalCommission: transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.commission : 0), 0),
    totalNet: transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.net_amount : 0), 0),
    totalOrders: transactions.filter(t => t.status === 'completed').length,
    pendingAmount: transactions.reduce((sum, t) => sum + (t.status === 'pending' ? t.amount : 0), 0),
    avgOrderValue: transactions.filter(t => t.status === 'completed').length > 0
      ? transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0) / transactions.filter(t => t.status === 'completed').length
      : 0,
  };

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Finances
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Suivez vos revenus et paiements
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedPeriod === period
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/80'
              }`}
            >
              {period === 'today' ? "Aujourd'hui" : period === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-2 p-6 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">Revenus bruts</p>
          <p className="text-3xl font-bold text-[var(--accent-primary)]">
            {stats.totalRevenue.toLocaleString('fr-FR')} DH
          </p>
          <p className="text-sm text-[var(--color-verify)] mt-2">
            +12.5% vs période précédente
          </p>
        </div>
        <div className="p-6 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">Commission DAWA.ma</p>
          <p className="text-2xl font-bold text-[var(--color-warning)]">
            {stats.totalCommission.toLocaleString('fr-FR')} DH
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">5% des ventes</p>
        </div>
        <div className="p-6 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">Revenus nets</p>
          <p className="text-2xl font-bold text-[var(--color-verify)]">
            {stats.totalNet.toLocaleString('fr-FR')} DH
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">Après commission</p>
        </div>
        <div className="p-6 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">Commandes</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.totalOrders}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">Complétées</p>
        </div>
        <div className="p-6 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <p className="text-sm text-[var(--text-muted)] mb-1">Panier moyen</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.avgOrderValue.toFixed(0)} DH
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">Par commande</p>
        </div>
      </div>

      {/* Chart and Payout Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="col-span-2 p-6 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Évolution des revenus
          </h3>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-4 px-2">
            {dailyRevenue.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs text-[var(--text-muted)] mb-1">
                    {day.revenue.toLocaleString('fr-FR')}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-[var(--accent-primary)] to-[var(--accent-primary)]/60 rounded-t-sm transition-all hover:from-[var(--accent-primary)]/80 hover:to-[var(--accent-primary)]"
                    style={{ height: `${(day.revenue / maxRevenue) * 140}px` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-muted)]">{day.date}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--border-primary)]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[var(--accent-primary)]" />
              <span className="text-sm text-[var(--text-muted)]">Revenus (DH)</span>
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              Total: {dailyRevenue.reduce((sum, d) => sum + d.revenue, 0).toLocaleString('fr-FR')} DH
            </div>
          </div>
        </div>

        {/* Payout Card */}
        <div className="p-6 rounded-lg border border-[var(--accent-primary)] bg-[var(--accent-primary)]/5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Prochain versement
          </h3>

          <div className="text-center py-6">
            <p className="text-4xl font-bold text-[var(--accent-primary)]">
              {(stats.totalNet + 42500).toLocaleString('fr-FR')} DH
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Prévu le 15 janvier 2026
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Solde actuel</span>
              <span className="font-mono text-[var(--text-primary)]">
                {stats.totalNet.toLocaleString('fr-FR')} DH
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Report période précédente</span>
              <span className="font-mono text-[var(--text-primary)]">42,500.00 DH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">En attente</span>
              <span className="font-mono text-[var(--color-warning)]">
                {stats.pendingAmount.toLocaleString('fr-FR')} DH
              </span>
            </div>
          </div>

          <button className="w-full mt-6 btn-verify">
            Voir les détails de paiement
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-primary)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Dernières transactions
          </h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-primary)]">
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Transaction
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Commande
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Patient
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Montant
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Commission
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Net
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Date
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <td className="px-4 py-3 font-mono text-sm text-[var(--text-muted)]">
                  {transaction.id}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-[var(--accent-primary)]">
                  {transaction.order_id}
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)]">
                  {transaction.patient_name}
                </td>
                <td className="px-4 py-3 font-mono text-[var(--text-primary)]">
                  {transaction.amount.toFixed(2)} DH
                </td>
                <td className="px-4 py-3 font-mono text-[var(--color-warning)]">
                  -{transaction.commission.toFixed(2)} DH
                </td>
                <td className="px-4 py-3 font-mono font-medium text-[var(--color-verify)]">
                  {transaction.net_amount.toFixed(2)} DH
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {new Date(transaction.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${statusConfig[transaction.status].color}`}>
                    {statusConfig[transaction.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Actions */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[var(--text-secondary)]">Exporter les données financières</span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/80 transition-colors">
            Exporter CSV
          </button>
          <button className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/80 transition-colors">
            Exporter PDF
          </button>
        </div>
      </div>
    </div>
  );
}
