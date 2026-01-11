'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <div className="grid grid-cols-4 gap-4">
        {courierStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              {stat.change && <p className="text-sm text-green-600">{stat.change}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Rechercher par nom, téléphone ou CIN..."
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

      {/* Couriers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des livreurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Livreur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Véhicule</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Zone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Livraisons</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Note</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCouriers.map((courier) => (
                  <tr key={courier.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">{courier.name.charAt(0)}</span>
                          </div>
                          {courier.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{courier.name}</p>
                          <p className="text-xs text-gray-500">CIN: {courier.cin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{courier.phone}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{courier.vehicleType === 'motorcycle' ? '🏍️' : '🚗'}</span>
                        <span className="text-sm">{courier.licensePlate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{courier.zone}</td>
                    <td className="py-3 px-4">{courier.deliveries}</td>
                    <td className="py-3 px-4">
                      {courier.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className={courier.rating < 4 ? 'text-red-600' : ''}>{courier.rating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            courier.status === 'verified'
                              ? 'bg-green-100 text-green-700'
                              : courier.status === 'suspended'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {courier.status === 'verified'
                            ? 'Vérifié'
                            : courier.status === 'suspended'
                            ? 'Suspendu'
                            : 'En attente'}
                        </span>
                        {courier.currentOrder && (
                          <p className="text-xs text-indigo-600">En course: {courier.currentOrder}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Voir</Button>
                        {courier.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Vérifier
                          </Button>
                        )}
                        {courier.status === 'verified' && (
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
