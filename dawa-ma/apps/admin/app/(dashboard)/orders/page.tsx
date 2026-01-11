'use client';

import { useState } from 'react';

const mockOrders = [
  {
    id: 'DW-2026-00892',
    patient: 'Ahmed Benali',
    pharmacy: 'Pharmacie Ibn Rochd',
    courier: 'Mohamed Khalil',
    total: '245.00 DH',
    status: 'delivering',
    hasPrescription: true,
    createdAt: '2026-01-11 10:30',
    city: 'Casablanca',
  },
  {
    id: 'DW-2026-00891',
    patient: 'Fatima Zahra',
    pharmacy: 'Pharmacie Atlas',
    courier: 'Youssef Amrani',
    total: '89.50 DH',
    status: 'ready',
    hasPrescription: false,
    createdAt: '2026-01-11 10:15',
    city: 'Rabat',
  },
  {
    id: 'DW-2026-00890',
    patient: 'Khadija Oujdi',
    pharmacy: 'Pharmacie Fès Médina',
    courier: null,
    total: '412.00 DH',
    status: 'preparing',
    hasPrescription: true,
    createdAt: '2026-01-11 09:45',
    city: 'Fès',
  },
  {
    id: 'DW-2026-00889',
    patient: 'Mohamed Alami',
    pharmacy: 'Pharmacie Menara',
    courier: null,
    total: '156.00 DH',
    status: 'pending_verification',
    hasPrescription: true,
    createdAt: '2026-01-11 09:30',
    city: 'Marrakech',
  },
  {
    id: 'DW-2026-00888',
    patient: 'Youssef Tazi',
    pharmacy: 'Pharmacie Ibn Rochd',
    courier: 'Mohamed Khalil',
    total: '78.00 DH',
    status: 'delivered',
    hasPrescription: false,
    createdAt: '2026-01-11 08:00',
    city: 'Casablanca',
  },
  {
    id: 'DW-2026-00887',
    patient: 'Sara Amrani',
    pharmacy: 'Pharmacie Atlas',
    courier: null,
    total: '234.00 DH',
    status: 'cancelled',
    hasPrescription: true,
    createdAt: '2026-01-11 07:45',
    city: 'Rabat',
  },
];

const orderStats = [
  { label: "Commandes aujourd'hui", value: '1,247', change: '+23%' },
  { label: 'En cours', value: '156', change: '' },
  { label: 'Livrées', value: '1,082', change: '+18%' },
  { label: 'Annulées', value: '9', change: '-12%' },
];

const statusLabels: Record<string, { label: string; badgeClass: string }> = {
  pending_verification: { label: 'Vérification', badgeClass: 'badge-warning' },
  confirmed: { label: 'Confirmée', badgeClass: 'badge-info' },
  preparing: { label: 'En préparation', badgeClass: 'badge-info' },
  ready: { label: 'Prête', badgeClass: 'badge-info' },
  delivering: { label: 'En livraison', badgeClass: 'badge-warning' },
  delivered: { label: 'Livrée', badgeClass: 'badge-verify' },
  cancelled: { label: 'Annulée', badgeClass: 'badge-critical' },
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pharmacy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="metrics-grid">
        {orderStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
            {stat.change && (
              <span className={`badge mt-2 ${stat.change.startsWith('-') ? 'badge-critical' : 'badge-verify'}`}>
                {stat.change}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="chart-container">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher par ID, patient ou pharmacie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-48"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending_verification">Vérification</option>
            <option value="confirmed">Confirmée</option>
            <option value="preparing">En préparation</option>
            <option value="ready">Prête</option>
            <option value="delivering">En livraison</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
          <input type="date" className="input w-40" />
          <button className="btn-secondary">Exporter CSV</button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="chart-container !p-0">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Liste des commandes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Pharmacie</th>
                <th>Livreur</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {order.id}
                      </span>
                      {order.hasPrescription && (
                        <span className="badge badge-info text-[10px] px-1.5">Rx</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.patient}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.city}</p>
                    </div>
                  </td>
                  <td>{order.pharmacy}</td>
                  <td>
                    {order.courier || (
                      <span style={{ color: 'var(--text-muted)' }}>Non assigné</span>
                    )}
                  </td>
                  <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.total}</td>
                  <td>
                    <span
                      className={`badge ${
                        statusLabels[order.status]?.badgeClass || 'badge-neutral'
                      }`}
                    >
                      {statusLabels[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{order.createdAt}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary text-sm py-1 px-2">Détails</button>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button className="btn-danger text-sm py-1 px-2">Annuler</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
