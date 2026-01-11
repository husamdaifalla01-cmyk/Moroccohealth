'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_verification: { label: 'Vérification', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'En préparation', color: 'bg-indigo-100 text-indigo-700' },
  ready: { label: 'Prête', color: 'bg-purple-100 text-purple-700' },
  delivering: { label: 'En livraison', color: 'bg-orange-100 text-orange-700' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
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
      <div className="grid grid-cols-4 gap-4">
        {orderStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              {stat.change && (
                <p className={`text-sm ${stat.change.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {stat.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Rechercher par ID, patient ou pharmacie..."
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
              <option value="pending_verification">Vérification</option>
              <option value="confirmed">Confirmée</option>
              <option value="preparing">En préparation</option>
              <option value="ready">Prête</option>
              <option value="delivering">En livraison</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
            <Input type="date" className="w-40" />
            <Button variant="outline">Exporter CSV</Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Pharmacie</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Livreur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Montant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{order.id}</span>
                        {order.hasPrescription && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Rx</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{order.patient}</p>
                        <p className="text-xs text-gray-500">{order.city}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{order.pharmacy}</td>
                    <td className="py-3 px-4 text-sm">
                      {order.courier || <span className="text-gray-400">Non assigné</span>}
                    </td>
                    <td className="py-3 px-4 font-medium">{order.total}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusLabels[order.status]?.color || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{order.createdAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Détails</Button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <Button variant="ghost" size="sm" className="text-red-600">
                            Annuler
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
