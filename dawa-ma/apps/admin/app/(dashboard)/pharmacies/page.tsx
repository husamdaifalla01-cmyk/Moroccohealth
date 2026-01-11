'use client';

import { useState } from 'react';

const mockPharmacies = [
  {
    id: 'PH001',
    name: 'Pharmacie Ibn Rochd',
    owner: 'Dr. Karim Alami',
    license: 'PHR-2024-001234',
    city: 'Casablanca',
    address: '123 Bd Mohammed V',
    orders: 245,
    rating: 4.8,
    status: 'verified',
    isOpen: true,
    joinedAt: '2025-08-15',
  },
  {
    id: 'PH002',
    name: 'Pharmacie Atlas',
    owner: 'Dr. Samira Bennis',
    license: 'PHR-2024-002345',
    city: 'Rabat',
    address: '45 Av. Hassan II',
    orders: 189,
    rating: 4.6,
    status: 'verified',
    isOpen: false,
    joinedAt: '2025-09-01',
  },
  {
    id: 'PH003',
    name: 'Pharmacie Menara',
    owner: 'Dr. Hassan Tazi',
    license: 'PHR-2024-003456',
    city: 'Marrakech',
    address: '78 Rue Gueliz',
    orders: 0,
    rating: 0,
    status: 'pending',
    isOpen: false,
    joinedAt: '2026-01-08',
  },
  {
    id: 'PH004',
    name: 'Pharmacie Fès Médina',
    owner: 'Dr. Amina Fassi',
    license: 'PHR-2024-004567',
    city: 'Fès',
    address: '12 Derb Moulay',
    orders: 156,
    rating: 4.9,
    status: 'verified',
    isOpen: true,
    joinedAt: '2025-07-20',
  },
  {
    id: 'PH005',
    name: 'Pharmacie Test',
    owner: 'Test Owner',
    license: 'PHR-INVALID',
    city: 'Casablanca',
    address: 'Test Address',
    orders: 2,
    rating: 2.1,
    status: 'suspended',
    isOpen: false,
    joinedAt: '2025-12-01',
  },
];

const pharmacyStats = [
  { label: 'Total pharmacies', value: '156', change: '+8' },
  { label: 'Vérifiées', value: '148', change: '+5' },
  { label: 'En attente', value: '5', change: '+3' },
  { label: 'Suspendues', value: '3', change: '0' },
];

export default function PharmaciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPharmacies = mockPharmacies.filter((pharmacy) => {
    const matchesSearch =
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.license.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pharmacy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="metrics-grid">
        {pharmacyStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
            <span className="badge badge-verify mt-2">{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="chart-container">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher par nom, licence ou propriétaire..."
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

      {/* Pharmacies Table */}
      <div className="chart-container !p-0">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Liste des pharmacies
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pharmacie</th>
                <th>Propriétaire</th>
                <th>Licence</th>
                <th>Localisation</th>
                <th>Commandes</th>
                <th>Note</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPharmacies.map((pharmacy) => (
                <tr key={pharmacy.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--bg-surface)' }}
                      >
                        <span style={{ color: 'var(--color-verify)' }} className="font-semibold">
                          {pharmacy.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{pharmacy.name}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`status-indicator ${pharmacy.isOpen ? 'status-online' : 'status-offline'}`}
                            style={{ width: '8px', height: '8px' }}
                          />
                          <span style={{ color: 'var(--text-muted)' }} className="text-xs">
                            {pharmacy.isOpen ? 'Ouverte' : 'Fermée'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{pharmacy.owner}</td>
                  <td className="font-mono text-sm">{pharmacy.license}</td>
                  <td>
                    <div style={{ color: 'var(--text-primary)' }}>{pharmacy.city}</div>
                    <div style={{ color: 'var(--text-muted)' }} className="text-xs">{pharmacy.address}</div>
                  </td>
                  <td>{pharmacy.orders}</td>
                  <td>
                    {pharmacy.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <span style={{ color: 'var(--color-warning)' }}>★</span>
                        <span>{pharmacy.rating}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        pharmacy.status === 'verified'
                          ? 'badge-verify'
                          : pharmacy.status === 'suspended'
                          ? 'badge-critical'
                          : 'badge-warning'
                      }`}
                    >
                      {pharmacy.status === 'verified'
                        ? 'Vérifié'
                        : pharmacy.status === 'suspended'
                        ? 'Suspendu'
                        : 'En attente'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary text-sm py-1 px-2">Voir</button>
                      {pharmacy.status === 'pending' && (
                        <button className="btn-verify text-sm py-1 px-2">Vérifier</button>
                      )}
                      {pharmacy.status === 'verified' && (
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
