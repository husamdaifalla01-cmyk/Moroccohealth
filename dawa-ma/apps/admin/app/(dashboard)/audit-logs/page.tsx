'use client';

import { useState } from 'react';

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
      <div
        className="chart-container"
        style={{ borderColor: 'var(--color-info)', borderWidth: '1px' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">🔒</span>
          <div className="flex-1">
            <p className="font-medium" style={{ color: 'var(--color-info)' }}>
              Conformité CNDP (Loi 09-08)
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Les logs d'audit sont conservés pendant 7 ans conformément à la réglementation marocaine.
              Dernière sauvegarde: 2026-01-11 00:00 UTC
            </p>
          </div>
          <button className="btn-secondary">Exporter rapport CNDP</button>
        </div>
      </div>

      {/* Filters */}
      <div className="chart-container">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher dans les logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input max-w-sm"
          />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="input w-48"
          >
            <option value="all">Toutes sévérités</option>
            <option value="info">Info</option>
            <option value="warning">Avertissement</option>
            <option value="critical">Critique</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input w-40"
            />
            <span style={{ color: 'var(--text-muted)' }}>à</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input w-40"
            />
          </div>
          <button className="btn-secondary">Exporter CSV</button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="chart-container !p-0">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Journal d'audit
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Horodatage</th>
                <th>Acteur</th>
                <th>Action</th>
                <th>Ressource</th>
                <th>Détails</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    background:
                      log.severity === 'critical'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : log.severity === 'warning'
                        ? 'rgba(251, 191, 36, 0.1)'
                        : 'transparent',
                  }}
                >
                  <td>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          background:
                            log.severity === 'critical'
                              ? 'var(--priority-critical)'
                              : log.severity === 'warning'
                              ? 'var(--color-warning)'
                              : 'var(--color-verify)',
                        }}
                      />
                      <span className="font-mono text-sm">{log.timestamp}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          log.actor.type === 'admin'
                            ? 'badge-info'
                            : log.actor.type === 'system'
                            ? 'badge-neutral'
                            : log.actor.type === 'pharmacy'
                            ? 'badge-verify'
                            : log.actor.type === 'courier'
                            ? 'badge-info'
                            : 'badge-info'
                        }`}
                      >
                        {log.actor.type}
                      </span>
                      <span className="text-sm">{log.actor.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        {log.resource.type}/
                      </span>
                      <span className="font-mono text-sm">{log.resource.id}</span>
                      {log.resource.name && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {log.resource.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td
                    className="text-sm max-w-xs truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {log.details}
                  </td>
                  <td className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Affichage de 1-8 sur 1,234 entrées
          </p>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm py-1 px-3" disabled>
              Précédent
            </button>
            <button className="btn-secondary text-sm py-1 px-3">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
