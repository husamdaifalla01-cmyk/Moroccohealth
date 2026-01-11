'use client';

import { useState } from 'react';

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
  { label: 'Total en attente', value: '13', color: 'var(--accent-primary)' },
  { label: 'Pharmacies', value: '3', color: 'var(--color-verify)' },
  { label: 'Livreurs', value: '8', color: 'var(--accent-secondary)' },
  { label: 'Ordonnances urgentes', value: '2', color: 'var(--priority-critical)' },
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
      <div className="metrics-grid">
        {verificationStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
          </div>
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedType === tab.key
                ? 'text-white'
                : 'hover:opacity-80'
            }`}
            style={{
              background: selectedType === tab.key ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: selectedType === tab.key ? 'white' : 'var(--text-secondary)',
            }}
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
            <div
              className="chart-container"
              style={{ borderColor: 'var(--priority-critical)', borderWidth: '1px' }}
            >
              <h3
                className="section-header flex items-center gap-2"
                style={{ color: 'var(--priority-critical)' }}
              >
                <span>⚠️</span> Urgent
              </h3>
              <div className="space-y-3">
                {urgentItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      background: selectedItem?.id === item.id ? 'var(--bg-surface)' : 'rgba(239, 68, 68, 0.1)',
                      borderColor: selectedItem?.id === item.id ? 'var(--accent-primary)' : 'var(--priority-critical)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {item.type === 'pharmacy' && '🏥'}
                          {item.type === 'courier' && '🚚'}
                          {item.type === 'prescription' && '📋'}
                        </span>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.submittedAt}</p>
                        </div>
                      </div>
                      <span className="badge badge-critical">Urgent</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Normal Items */}
          <div className="chart-container">
            <h3 className="section-header">En attente de vérification</h3>
            <div className="space-y-3">
              {normalItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="p-4 rounded-lg border cursor-pointer transition-all"
                  style={{
                    background: selectedItem?.id === item.id ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                    borderColor: selectedItem?.id === item.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {item.type === 'pharmacy' && '🏥'}
                        {item.type === 'courier' && '🚚'}
                        {item.type === 'prescription' && '📋'}
                      </span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.submittedAt}</p>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        item.type === 'pharmacy'
                          ? 'badge-verify'
                          : item.type === 'courier'
                          ? 'badge-info'
                          : 'badge-info'
                      }`}
                    >
                      {item.type === 'pharmacy' ? 'Pharmacie' : item.type === 'courier' ? 'Livreur' : 'Ordonnance'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="chart-container h-fit sticky top-24">
          <h3 className="section-header">Détails de vérification</h3>
          {selectedItem ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-surface)' }}
                >
                  <span className="text-3xl">
                    {selectedItem.type === 'pharmacy' && '🏥'}
                    {selectedItem.type === 'courier' && '🚚'}
                    {selectedItem.type === 'prescription' && '📋'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedItem.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Soumis le {selectedItem.submittedAt}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Informations</h4>
                <div
                  className="rounded-lg p-4 space-y-2"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  {Object.entries(selectedItem.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize" style={{ color: 'var(--text-muted)' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Documents soumis</h4>
                <div className="space-y-2">
                  {selectedItem.documents.map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span>📄</span>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{doc}</span>
                      </div>
                      <button className="btn-secondary text-sm py-1 px-2">Voir</button>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="flex gap-3 pt-4 border-t"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <button className="btn-verify flex-1">Approuver</button>
                <button className="btn-danger flex-1">Rejeter</button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <span className="text-4xl block mb-4">👆</span>
              <p>Sélectionnez un élément pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
