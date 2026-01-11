'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <div className="grid grid-cols-4 gap-4">
        {userStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-sm text-green-600">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Rechercher par nom, téléphone ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="pending">En attente</option>
            </select>
            <Button variant="outline">Exporter CSV</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Nom</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Ville</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Commandes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Inscrit le</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{user.id}</td>
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{user.phone}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">{user.city}</td>
                    <td className="py-3 px-4">{user.orders}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : user.status === 'suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : 'En attente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{user.joinedAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Voir</Button>
                        <Button variant="ghost" size="sm" className="text-red-600">Suspendre</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
