'use client';

// Platform-wide statistics
const platformStats = [
  { title: 'Patients actifs', value: '12,453', change: '+15%', icon: '👥', color: 'var(--color-info)' },
  { title: 'Pharmacies', value: '156', change: '+8', icon: '🏥', color: 'var(--color-verify)' },
  { title: 'Livreurs', value: '89', change: '+12', icon: '🚚', color: 'var(--accent-secondary)' },
  { title: 'Commandes aujourd\'hui', value: '1,247', change: '+23%', icon: '📦', color: 'var(--color-warning)' },
];

const revenueStats = [
  { title: 'CA du jour', value: '125,430 DH', change: '+18%' },
  { title: 'CA du mois', value: '2.4M DH', change: '+22%' },
  { title: 'Commission totale', value: '120K DH', change: '+22%' },
  { title: 'Panier moyen', value: '145 DH', change: '+5%' },
];

const pendingVerifications = [
  { type: 'Pharmacies', count: 3, urgent: true },
  { type: 'Livreurs', count: 8, urgent: false },
  { type: 'Ordonnances signalées', count: 2, urgent: true },
];

const recentActivity = [
  { action: 'Nouvelle pharmacie inscrite', entity: 'Pharmacie Ibn Rochd', time: 'Il y a 5 min', type: 'pharmacy' },
  { action: 'Livreur vérifié', entity: 'Mohamed K.', time: 'Il y a 15 min', type: 'courier' },
  { action: 'Commande annulée', entity: 'DW-2026-00892', time: 'Il y a 25 min', type: 'order' },
  { action: 'Pharmacie suspendue', entity: 'Pharmacie Test', time: 'Il y a 1h', type: 'alert' },
  { action: 'Nouveau patient', entity: 'Ahmed B.', time: 'Il y a 2h', type: 'user' },
];

const systemServices = [
  { name: 'API', status: 'online', label: 'Opérationnel' },
  { name: 'Base de données', status: 'online', label: 'Opérationnel' },
  { name: 'Paiements (CMI)', status: 'online', label: 'Opérationnel' },
  { name: 'SMS (Twilio)', status: 'online', label: 'Opérationnel' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <div className="metrics-grid">
        {platformStats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{stat.icon}</span>
              <span className="badge badge-verify">{stat.change}</span>
            </div>
            <p className="stat-value mt-4" style={{ color: stat.color }}>{stat.value}</p>
            <p className="stat-label">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Revenue Stats */}
      <div className="chart-container">
        <h3 className="section-header">Revenus de la plateforme</h3>
        <div className="grid grid-cols-4 gap-6">
          {revenueStats.map((stat) => (
            <div key={stat.title} className="text-center">
              <p className="stat-value text-2xl" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              <p className="stat-label">{stat.title}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-verify)' }}>{stat.change}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <div className="chart-container">
          <h3 className="section-header">Vérifications en attente</h3>
          <div className="space-y-3">
            {pendingVerifications.map((item) => (
              <div
                key={item.type}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  item.urgent
                    ? 'border border-[var(--priority-critical)]'
                    : ''
                }`}
                style={{
                  backgroundColor: item.urgent ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-elevated)',
                }}
              >
                <div className="flex items-center gap-3">
                  {item.urgent && <span className="text-red-500">⚠️</span>}
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.type}</span>
                </div>
                <span className={item.urgent ? 'badge badge-critical' : 'badge badge-info'}>
                  {item.count}
                </span>
              </div>
            ))}
            <a
              href="/verifications"
              className="block text-center text-sm mt-4 transition-colors hover:opacity-80"
              style={{ color: 'var(--accent-primary)' }}
            >
              Voir toutes les vérifications →
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-container lg:col-span-2">
          <h3 className="section-header">Activité récente</h3>
          <div className="space-y-2">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="activity-item border-b last:border-0"
                style={{ borderColor: 'var(--border-secondary)' }}
              >
                <span className="text-xl">
                  {activity.type === 'pharmacy' && '🏥'}
                  {activity.type === 'courier' && '🚚'}
                  {activity.type === 'order' && '📦'}
                  {activity.type === 'alert' && '⚠️'}
                  {activity.type === 'user' && '👤'}
                </span>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{activity.action}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{activity.entity}</p>
                </div>
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="chart-container">
        <h3 className="section-header">État du système</h3>
        <div className="grid grid-cols-4 gap-6">
          {systemServices.map((service) => (
            <div key={service.name} className="flex items-center gap-3">
              <div className={`status-indicator ${
                service.status === 'online' ? 'status-online' :
                service.status === 'warning' ? 'status-warning' : 'status-offline'
              }`} />
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{service.name}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{service.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
