'use client';

import { useState } from 'react';

const mockCouriers = [
  {
    id: 'CR001',
    name: 'Mohamed Khalil',
    phone: '+212 6 11 22 33 44',
    cin: 'AB123456',
    vehicleType: 'motorcycle',
    licensePlate: '12345-A-1',
    zone: 'Casablanca Centre',
    deliveries: 523,
    rating: 4.9,
    status: 'verified',
    isOnline: true,
    currentOrder: 'DW-2026-00891',
  },
  {
    id: 'CR002',
    name: 'Youssef Amrani',
    phone: '+212 6 22 33 44 55',
    cin: 'CD234567',
    vehicleType: 'motorcycle',
    licensePlate: '23456-B-2',
    zone: 'Casablanca Ouest',
    deliveries: 312,
    rating: 4.7,
    status: 'verified',
    isOnline: true,
    currentOrder: null,
  },
  {
    id: 'CR003',
    name: 'Hassan Bennani',
    phone: '+212 6 33 44 55 66',
    cin: 'EF345678',
    vehicleType: 'car',
    licensePlate: '34567-C-3',
    zone: 'Rabat',
    deliveries: 189,
    rating: 4.5,
    status: 'verified',
    isOnline: false,
    currentOrder: null,
  },
  {
    id: 'CR004',
    name: 'Omar Tazi',
    phone: '+212 6 44 55 66 77',
    cin: 'GH456789',
    vehicleType: 'motorcycle',
    licensePlate: '45678-D-4',
    zone: 'Marrakech',
    deliveries: 0,
    rating: 0,
    status: 'pending',
    isOnline: false,
    currentOrder: null,
  },
  {
    id: 'CR005',
    name: 'Karim Fassi',
    phone: '+212 6 55 66 77 88',
    cin: 'IJ567890',
    vehicleType: 'motorcycle',
    licensePlate: '56789-E-5',
    zone: 'Fès',
    deliveries: 45,
    rating: 3.2,
    status: 'suspended',
    isOnline: false,
    currentOrder: null,
  },
];

const courierStats = [
  { label: 'Total livreurs', value: '89', change: '+12' },
  { label: 'En ligne', value: '34', change: '' },
  { label: 'En livraison', value: '18', change: '' },
  { label: 'En attente vérif.', value: '8', change: '+5' },
];

export default function CouriersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCouriers = mockCouriers.filter((courier) => {
    const matchesSearch =
      courier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.phone.includes(searchQuery) ||
      courier.cin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || courier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="metrics-grid">
        {courierStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
            {stat.change && <span className="badge badge-verify mt-2">{stat.change}</span>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="chart-container">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone ou CIN..."
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
            <option value="verified">Vérifié</option>
            <option value="pending">En attente</option>
            <option value="suspended">Suspendu</option>
          </select>
          <button className="btn-secondary">Exporter CSV</button>
        </div>
      </div>

      {/* Couriers Table */}
      <div className="chart-container !p-0">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Liste des livreurs
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Livreur</th>
                <th>Contact</th>
                <th>Véhicule</th>
                <th>Zone</th>
                <th>Livraisons</th>
                <th>Note</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCouriers.map((courier) => (
                <tr key={courier.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--bg-surface)' }}
                        >
                          <span style={{ color: 'var(--accent-secondary)' }} className="font-semibold">
                            {courier.name.charAt(0)}
                          </span>
                        </div>
                        {courier.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full status-online border-2" style={{ borderColor: 'var(--bg-secondary)' }} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{courier.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>CIN: {courier.cin}</p>
                      </div>
                    </div>
                  </td>
                  <td>{courier.phone}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span>{courier.vehicleType === 'motorcycle' ? '🏍️' : '🚗'}</span>
                      <span className="text-sm">{courier.licensePlate}</span>
                    </div>
                  </td>
                  <td>{courier.zone}</td>
                  <td>{courier.deliveries}</td>
                  <td>
                    {courier.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <span style={{ color: 'var(--color-warning)' }}>★</span>
                        <span style={{ color: courier.rating < 4 ? 'var(--priority-critical)' : 'var(--text-primary)' }}>
                          {courier.rating}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <div className="space-y-1">
                      <span
                        className={`badge ${
                          courier.status === 'verified'
                            ? 'badge-verify'
                            : courier.status === 'suspended'
                            ? 'badge-critical'
                            : 'badge-warning'
                        }`}
                      >
                        {courier.status === 'verified'
                          ? 'Vérifié'
                          : courier.status === 'suspended'
                          ? 'Suspendu'
                          : 'En attente'}
                      </span>
                      {courier.currentOrder && (
                        <p className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                          En course: {courier.currentOrder}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary text-sm py-1 px-2">Voir</button>
                      {courier.status === 'pending' && (
                        <button className="btn-verify text-sm py-1 px-2">Vérifier</button>
                      )}
                      {courier.status === 'verified' && (
                        <button className="btn-danger text-sm py-1 px-2">Suspendre</button>
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
