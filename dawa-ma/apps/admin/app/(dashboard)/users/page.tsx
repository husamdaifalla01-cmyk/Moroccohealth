'use client';

import { useState } from 'react';

const mockUsers = [
  { id: 'P001', name: 'Ahmed Benali', phone: '+212 6 12 34 56 78', email: 'ahmed@email.com', city: 'Casablanca', orders: 12, status: 'active', joinedAt: '2025-10-15' },
  { id: 'P002', name: 'Fatima Zahra', phone: '+212 6 23 45 67 89', email: 'fatima@email.com', city: 'Rabat', orders: 8, status: 'active', joinedAt: '2025-11-02' },
  { id: 'P003', name: 'Mohamed Alami', phone: '+212 6 34 56 78 90', email: 'mohamed@email.com', city: 'Marrakech', orders: 3, status: 'suspended', joinedAt: '2025-12-01' },
  { id: 'P004', name: 'Khadija Oujdi', phone: '+212 6 45 67 89 01', email: 'khadija@email.com', city: 'Fès', orders: 25, status: 'active', joinedAt: '2025-09-20' },
  { id: 'P005', name: 'Youssef Tazi', phone: '+212 6 56 78 90 12', email: 'youssef@email.com', city: 'Tanger', orders: 0, status: 'pending', joinedAt: '2026-01-10' },
];

const userStats = [
  { label: 'Total utilisateurs', value: '12,453', change: '+15%' },
  { label: 'Actifs (30j)', value: '8,234', change: '+8%' },
  { label: 'Nouveaux (7j)', value: '342', change: '+22%' },
  { label: 'Suspendus', value: '23', change: '-5%' },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="metrics-grid">
        {userStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
            <span className={`badge mt-2 ${stat.change.startsWith('-') ? 'badge-critical' : 'badge-verify'}`}>
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="chart-container">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone ou email..."
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
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="pending">En attente</option>
          </select>
          <button className="btn-secondary">Exporter CSV</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="chart-container !p-0">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Liste des patients
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Contact</th>
                <th>Ville</th>
                <th>Commandes</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-mono text-sm">{user.id}</td>
                  <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</td>
                  <td>
                    <div style={{ color: 'var(--text-primary)' }}>{user.phone}</div>
                    <div style={{ color: 'var(--text-muted)' }} className="text-xs">{user.email}</div>
                  </td>
                  <td>{user.city}</td>
                  <td>{user.orders}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.status === 'active'
                          ? 'badge-verify'
                          : user.status === 'suspended'
                          ? 'badge-critical'
                          : 'badge-warning'
                      }`}
                    >
                      {user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : 'En attente'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{user.joinedAt}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary text-sm py-1 px-2">Voir</button>
                      <button className="btn-danger text-sm py-1 px-2">Suspendre</button>
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
