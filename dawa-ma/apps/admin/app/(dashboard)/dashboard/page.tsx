'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Platform-wide statistics
const platformStats = [
  { title: 'Patients actifs', value: '12,453', change: '+15%', icon: '👥', color: 'text-blue-600' },
  { title: 'Pharmacies', value: '156', change: '+8', icon: '🏥', color: 'text-green-600' },
  { title: 'Livreurs', value: '89', change: '+12', icon: '🚚', color: 'text-purple-600' },
  { title: 'Commandes aujourd\'hui', value: '1,247', change: '+23%', icon: '📦', color: 'text-orange-600' },
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

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{stat.icon}</span>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <p className={`mt-4 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Revenus de la plateforme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            {revenueStats.map((stat) => (
              <div key={stat.title} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <Card>
          <CardHeader>
            <CardTitle>Vérifications en attente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingVerifications.map((item) => (
              <div
                key={item.type}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.urgent && <span className="text-red-500">⚠️</span>}
                  <span className="font-medium">{item.type}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.urgent
                    ? 'bg-red-100 text-red-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {item.count}
                </span>
              </div>
            ))}
            <a href="/verifications" className="block text-center text-sm text-indigo-600 hover:underline mt-4">
              Voir toutes les vérifications →
            </a>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <span className="text-xl">
                    {activity.type === 'pharmacy' && '🏥'}
                    {activity.type === 'courier' && '🚚'}
                    {activity.type === 'order' && '📦'}
                    {activity.type === 'alert' && '⚠️'}
                    {activity.type === 'user' && '👤'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.entity}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>État du système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">API</p>
                <p className="text-sm text-gray-500">Opérationnel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Base de données</p>
                <p className="text-sm text-gray-500">Opérationnel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Paiements (CMI)</p>
                <p className="text-sm text-gray-500">Opérationnel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">SMS (Twilio)</p>
                <p className="text-sm text-gray-500">Opérationnel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
