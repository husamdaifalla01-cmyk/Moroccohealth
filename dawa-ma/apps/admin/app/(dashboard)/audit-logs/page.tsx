'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    type: 'admin' | 'system' | 'user' | 'pharmacy' | 'courier';
    id: string;
    name: string;
  };
  action: string;
  resource: {
    type: string;
    id: string;
    name?: string;
  };
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-01-11 10:45:23',
    actor: { type: 'admin', id: 'ADM-001', name: 'Admin User' },
    action: 'PHARMACY_SUSPENDED',
    resource: { type: 'pharmacy', id: 'PH005', name: 'Pharmacie Test' },
    details: 'Pharmacie suspendue pour licence invalide',
    ipAddress: '196.200.131.xxx',
    severity: 'critical',
  },
  {
    id: 'LOG-002',
    timestamp: '2026-01-11 10:30:15',
    actor: { type: 'admin', id: 'ADM-001', name: 'Admin User' },
    action: 'COURIER_VERIFIED',
    resource: { type: 'courier', id: 'CR002', name: 'Youssef Amrani' },
    details: 'Documents vérifiés et approuvés',
    ipAddress: '196.200.131.xxx',
    severity: 'info',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-01-11 10:15:42',
    actor: { type: 'system', id: 'SYS', name: 'Système' },
    action: 'PRESCRIPTION_FLAGGED',
    resource: { type: 'prescription', id: 'ORD-235', name: 'Ordonnance #ORD-2026-00235' },
    details: 'Médicament contrôlé détecté automatiquement',
    ipAddress: '-',
    severity: 'warning',
  },
  {
    id: 'LOG-004',
    timestamp: '2026-01-11 09:55:18',
    actor: { type: 'pharmacy', id: 'PH001', name: 'Pharmacie Ibn Rochd' },
    action: 'ORDER_CANCELLED',
    resource: { type: 'order', id: 'DW-2026-00887' },
    details: 'Commande annulée par la pharmacie - stock insuffisant',
    ipAddress: '196.200.145.xxx',
    severity: 'warning',
  },
  {
    id: 'LOG-005',
    timestamp: '2026-01-11 09:30:00',
    actor: { type: 'admin', id: 'ADM-002', name: 'Support User' },
    action: 'USER_DATA_ACCESSED',
    resource: { type: 'patient', id: 'P001', name: 'Ahmed Benali' },
    details: 'Consultation des données personnelles (ticket support #1234)',
    ipAddress: '196.200.131.xxx',
    severity: 'info',
  },
  {
    id: 'LOG-006',
    timestamp: '2026-01-11 08:15:33',
    actor: { type: 'system', id: 'SYS', name: 'Système' },
    action: 'DATA_EXPORT',
    resource: { type: 'report', id: 'RPT-2026-01' },
    details: 'Export mensuel des données CNDP généré',
    ipAddress: '-',
    severity: 'info',
  },
  {
    id: 'LOG-007',
    timestamp: '2026-01-10 23:45:12',
    actor: { type: 'admin', id: 'ADM-001', name: 'Admin User' },
    action: 'ADMIN_LOGIN',
    resource: { type: 'auth', id: 'SESSION-789' },
    details: 'Connexion réussie au tableau de bord admin',
    ipAddress: '196.200.131.xxx',
    severity: 'info',
  },
  {
    id: 'LOG-008',
    timestamp: '2026-01-10 18:22:45',
    actor: { type: 'admin', id: 'ADM-001', name: 'Admin User' },
    action: 'SETTINGS_UPDATED',
    resource: { type: 'settings', id: 'platform' },
    details: 'Frais de livraison modifiés: 15 DH → 18 DH',
    ipAddress: '196.200.131.xxx',
    severity: 'warning',
  },
];

const actionLabels: Record<string, string> = {
  PHARMACY_SUSPENDED: 'Pharmacie suspendue',
  PHARMACY_VERIFIED: 'Pharmacie vérifiée',
  COURIER_VERIFIED: 'Livreur vérifié',
  COURIER_SUSPENDED: 'Livreur suspendu',
  PRESCRIPTION_FLAGGED: 'Ordonnance signalée',
  ORDER_CANCELLED: 'Commande annulée',
  USER_DATA_ACCESSED: 'Données accédées',
  DATA_EXPORT: 'Export de données',
  ADMIN_LOGIN: 'Connexion admin',
  SETTINGS_UPDATED: 'Paramètres modifiés',
};

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* CNDP Compliance Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-medium text-blue-900">Conformité CNDP (Loi 09-08)</p>
              <p className="text-sm text-blue-700">
                Les logs d'audit sont conservés pendant 7 ans conformément à la réglementation marocaine.
                Dernière sauvegarde: 2026-01-11 00:00 UTC
              </p>
            </div>
            <Button variant="outline" className="ml-auto border-blue-300 text-blue-700">
              Exporter rapport CNDP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Rechercher dans les logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Toutes sévérités</option>
              <option value="info">Info</option>
              <option value="warning">Avertissement</option>
              <option value="critical">Critique</option>
            </select>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-40"
              />
              <span className="text-gray-500">à</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-40"
              />
            </div>
            <Button variant="outline">Exporter CSV</Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journal d'audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Horodatage</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Acteur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Ressource</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Détails</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-b hover:bg-gray-50 ${
                      log.severity === 'critical' ? 'bg-red-50' : log.severity === 'warning' ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.severity === 'critical'
                              ? 'bg-red-500'
                              : log.severity === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        />
                        <span className="font-mono text-sm">{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            log.actor.type === 'admin'
                              ? 'bg-indigo-100 text-indigo-700'
                              : log.actor.type === 'system'
                              ? 'bg-gray-100 text-gray-700'
                              : log.actor.type === 'pharmacy'
                              ? 'bg-green-100 text-green-700'
                              : log.actor.type === 'courier'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {log.actor.type}
                        </span>
                        <span className="text-sm">{log.actor.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-sm">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-mono text-xs text-gray-500">{log.resource.type}/</span>
                        <span className="font-mono text-sm">{log.resource.id}</span>
                        {log.resource.name && (
                          <p className="text-xs text-gray-500">{log.resource.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Affichage de 1-8 sur 1,234 entrées</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Précédent
              </Button>
              <Button variant="outline" size="sm">
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
