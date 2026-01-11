'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <div className="grid grid-cols-4 gap-4">
        {pharmacyStats.map((stat) => (
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
              placeholder="Rechercher par nom, licence ou propriétaire..."
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
              <option value="verified">Vérifié</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
            </select>
            <Button variant="outline">Exporter CSV</Button>
          </div>
        </CardContent>
      </Card>

      {/* Pharmacies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des pharmacies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Pharmacie</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Propriétaire</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Licence</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Localisation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Commandes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Note</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-semibold">{pharmacy.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{pharmacy.name}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${pharmacy.isOpen ? 'bg-green-500' : 'bg-gray-400'}`}
                            />
                            <span className="text-xs text-gray-500">
                              {pharmacy.isOpen ? 'Ouverte' : 'Fermée'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{pharmacy.owner}</td>
                    <td className="py-3 px-4 font-mono text-sm">{pharmacy.license}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{pharmacy.city}</div>
                      <div className="text-xs text-gray-500">{pharmacy.address}</div>
                    </td>
                    <td className="py-3 px-4">{pharmacy.orders}</td>
                    <td className="py-3 px-4">
                      {pharmacy.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{pharmacy.rating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pharmacy.status === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : pharmacy.status === 'suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {pharmacy.status === 'verified'
                          ? 'Vérifié'
                          : pharmacy.status === 'suspended'
                          ? 'Suspendu'
                          : 'En attente'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Voir</Button>
                        {pharmacy.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Vérifier
                          </Button>
                        )}
                        {pharmacy.status === 'verified' && (
                          <Button variant="ghost" size="sm" className="text-red-600">
                            Suspendre
                          </Button>
                        )}
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
