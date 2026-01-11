'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type VerificationType = 'pharmacy' | 'courier' | 'prescription';

interface VerificationItem {
  id: string;
  type: VerificationType;
  name: string;
  submittedAt: string;
  documents: string[];
  urgent: boolean;
  details: Record<string, string>;
}

const mockVerifications: VerificationItem[] = [
  {
    id: 'VER-001',
    type: 'pharmacy',
    name: 'Pharmacie Menara',
    submittedAt: '2026-01-08 14:30',
    documents: ['Licence pharmaceutique', 'Registre de commerce', 'CIN du propriétaire'],
    urgent: false,
    details: {
      owner: 'Dr. Hassan Tazi',
      license: 'PHR-2024-003456',
      city: 'Marrakech',
      address: '78 Rue Gueliz',
    },
  },
  {
    id: 'VER-002',
    type: 'pharmacy',
    name: 'Pharmacie Océan',
    submittedAt: '2026-01-09 10:15',
    documents: ['Licence pharmaceutique', 'Registre de commerce', 'CIN du propriétaire'],
    urgent: false,
    details: {
      owner: 'Dr. Nadia Filali',
      license: 'PHR-2024-004567',
      city: 'Agadir',
      address: '45 Bd Hassan II',
    },
  },
  {
    id: 'VER-003',
    type: 'pharmacy',
    name: 'Pharmacie Medina',
    submittedAt: '2026-01-10 16:45',
    documents: ['Licence pharmaceutique', 'Registre de commerce'],
    urgent: true,
    details: {
      owner: 'Dr. Youssef Bennani',
      license: 'PHR-2024-005678',
      city: 'Tanger',
      address: '12 Rue de la Liberté',
      note: 'Document CIN manquant',
    },
  },
  {
    id: 'VER-004',
    type: 'courier',
    name: 'Omar Tazi',
    submittedAt: '2026-01-10 09:00',
    documents: ['CIN', 'Permis de conduire', 'Carte grise', 'Casier judiciaire'],
    urgent: false,
    details: {
      phone: '+212 6 44 55 66 77',
      cin: 'GH456789',
      vehicleType: 'Moto',
      licensePlate: '45678-D-4',
      zone: 'Marrakech',
    },
  },
  {
    id: 'VER-005',
    type: 'courier',
    name: 'Said Alaoui',
    submittedAt: '2026-01-10 11:30',
    documents: ['CIN', 'Permis de conduire', 'Carte grise', 'Casier judiciaire'],
    urgent: false,
    details: {
      phone: '+212 6 66 77 88 99',
      cin: 'KL678901',
      vehicleType: 'Moto',
      licensePlate: '67890-F-6',
      zone: 'Casablanca Est',
    },
  },
  {
    id: 'VER-006',
    type: 'prescription',
    name: 'Ordonnance #ORD-2026-00234',
    submittedAt: '2026-01-11 08:15',
    documents: ['Photo ordonnance'],
    urgent: true,
    details: {
      patient: 'Ahmed Benali',
      pharmacy: 'Pharmacie Ibn Rochd',
      orderId: 'DW-2026-00889',
      reason: 'Ordonnance illisible - vérification requise',
    },
  },
  {
    id: 'VER-007',
    type: 'prescription',
    name: 'Ordonnance #ORD-2026-00235',
    submittedAt: '2026-01-11 09:45',
    documents: ['Photo ordonnance'],
    urgent: true,
    details: {
      patient: 'Khadija Oujdi',
      pharmacy: 'Pharmacie Fès Médina',
      orderId: 'DW-2026-00890',
      reason: 'Médicament contrôlé signalé',
    },
  },
];

const verificationStats = [
  { label: 'Total en attente', value: '13', color: 'text-indigo-600' },
  { label: 'Pharmacies', value: '3', color: 'text-green-600' },
  { label: 'Livreurs', value: '8', color: 'text-purple-600' },
  { label: 'Ordonnances urgentes', value: '2', color: 'text-red-600' },
];

export default function VerificationsPage() {
  const [selectedType, setSelectedType] = useState<VerificationType | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);

  const filteredItems = mockVerifications.filter(
    (item) => selectedType === 'all' || item.type === selectedType
  );

  const urgentItems = filteredItems.filter((item) => item.urgent);
  const normalItems = filteredItems.filter((item) => !item.urgent);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {verificationStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Tout', count: mockVerifications.length },
          { key: 'pharmacy', label: 'Pharmacies', count: mockVerifications.filter((i) => i.type === 'pharmacy').length },
          { key: 'courier', label: 'Livreurs', count: mockVerifications.filter((i) => i.type === 'courier').length },
          { key: 'prescription', label: 'Ordonnances', count: mockVerifications.filter((i) => i.type === 'prescription').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedType(tab.key as VerificationType | 'all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification List */}
        <div className="space-y-4">
          {/* Urgent Items */}
          {urgentItems.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <span>⚠️</span> Urgent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {urgentItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedItem?.id === item.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-red-200 bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {item.type === 'pharmacy' && '🏥'}
                          {item.type === 'courier' && '🚚'}
                          {item.type === 'prescription' && '📋'}
                        </span>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.submittedAt}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Urgent
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Normal Items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>En attente de vérification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {normalItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedItem?.id === item.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {item.type === 'pharmacy' && '🏥'}
                        {item.type === 'courier' && '🚚'}
                        {item.type === 'prescription' && '📋'}
                      </span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.submittedAt}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.type === 'pharmacy'
                          ? 'bg-green-100 text-green-700'
                          : item.type === 'courier'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.type === 'pharmacy' ? 'Pharmacie' : item.type === 'courier' ? 'Livreur' : 'Ordonnance'}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Details Panel */}
        <Card className="h-fit sticky top-24">
          <CardHeader>
            <CardTitle>Détails de vérification</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">
                      {selectedItem.type === 'pharmacy' && '🏥'}
                      {selectedItem.type === 'courier' && '🚚'}
                      {selectedItem.type === 'prescription' && '📋'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                    <p className="text-sm text-gray-500">Soumis le {selectedItem.submittedAt}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Informations</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedItem.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Documents soumis</h4>
                  <div className="space-y-2">
                    {selectedItem.documents.map((doc) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span>📄</span>
                          <span className="text-sm">{doc}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Voir
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Approuver
                  </Button>
                  <Button variant="outline" className="flex-1 text-red-600 border-red-300 hover:bg-red-50">
                    Rejeter
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl block mb-4">👆</span>
                <p>Sélectionnez un élément pour voir les détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
