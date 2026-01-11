'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const revenueData = {
  today: { value: '125,430 DH', orders: 1247, avgBasket: '145 DH' },
  week: { value: '876,200 DH', orders: 8432, avgBasket: '142 DH' },
  month: { value: '2,456,780 DH', orders: 28456, avgBasket: '139 DH' },
  year: { value: '18,234,560 DH', orders: 156789, avgBasket: '138 DH' },
};

const topPharmacies = [
  { rank: 1, name: 'Pharmacie Ibn Rochd', city: 'Casablanca', orders: 2456, revenue: '356,780 DH' },
  { rank: 2, name: 'Pharmacie Fès Médina', city: 'Fès', orders: 1987, revenue: '289,450 DH' },
  { rank: 3, name: 'Pharmacie Atlas', city: 'Rabat', orders: 1756, revenue: '245,670 DH' },
  { rank: 4, name: 'Pharmacie Menara', city: 'Marrakech', orders: 1534, revenue: '212,340 DH' },
  { rank: 5, name: 'Pharmacie Océan', city: 'Agadir', orders: 1234, revenue: '178,900 DH' },
];

const topCouriers = [
  { rank: 1, name: 'Mohamed Khalil', zone: 'Casablanca', deliveries: 523, rating: 4.9 },
  { rank: 2, name: 'Youssef Amrani', zone: 'Casablanca', deliveries: 456, rating: 4.8 },
  { rank: 3, name: 'Hassan Bennani', zone: 'Rabat', deliveries: 412, rating: 4.7 },
  { rank: 4, name: 'Said Alaoui', zone: 'Casablanca', deliveries: 389, rating: 4.6 },
  { rank: 5, name: 'Omar Tazi', zone: 'Marrakech', deliveries: 345, rating: 4.5 },
];

const cityBreakdown = [
  { city: 'Casablanca', orders: 12456, percentage: 43.7, revenue: '1,823,450 DH' },
  { city: 'Rabat', orders: 5678, percentage: 19.9, revenue: '834,560 DH' },
  { city: 'Marrakech', orders: 4321, percentage: 15.2, revenue: '623,780 DH' },
  { city: 'Fès', orders: 3456, percentage: 12.1, revenue: '498,900 DH' },
  { city: 'Autres', orders: 2545, percentage: 8.9, revenue: '375,430 DH' },
];

const scheduledReports = [
  { name: 'Rapport CNDP mensuel', frequency: 'Mensuel', lastRun: '2026-01-01', nextRun: '2026-02-01' },
  { name: 'Analyse des ventes hebdomadaire', frequency: 'Hebdomadaire', lastRun: '2026-01-06', nextRun: '2026-01-13' },
  { name: 'Audit de conformité', frequency: 'Trimestriel', lastRun: '2025-10-01', nextRun: '2026-01-01' },
  { name: 'Rapport financier', frequency: 'Mensuel', lastRun: '2026-01-01', nextRun: '2026-02-01' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          Générer rapport personnalisé
        </Button>
        <Button variant="outline">Exporter données brutes</Button>
        <Button variant="outline">Planifier un rapport</Button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(revenueData).map(([period, data]) => (
          <Card key={period}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 capitalize">
                {period === 'today' ? "Aujourd'hui" : period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : 'Cette année'}
              </p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{data.value}</p>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{data.orders.toLocaleString()} commandes</span>
                <span>Panier: {data.avgBasket}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pharmacies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top 5 Pharmacies (ce mois)</CardTitle>
            <Button variant="ghost" size="sm">Voir tout</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPharmacies.map((pharmacy) => (
                <div key={pharmacy.rank} className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    pharmacy.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    pharmacy.rank === 2 ? 'bg-gray-100 text-gray-700' :
                    pharmacy.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {pharmacy.rank}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{pharmacy.name}</p>
                    <p className="text-xs text-gray-500">{pharmacy.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-indigo-600">{pharmacy.revenue}</p>
                    <p className="text-xs text-gray-500">{pharmacy.orders} commandes</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Couriers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top 5 Livreurs (ce mois)</CardTitle>
            <Button variant="ghost" size="sm">Voir tout</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCouriers.map((courier) => (
                <div key={courier.rank} className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    courier.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    courier.rank === 2 ? 'bg-gray-100 text-gray-700' :
                    courier.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {courier.rank}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{courier.name}</p>
                    <p className="text-xs text-gray-500">{courier.zone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{courier.deliveries} livraisons</p>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-yellow-500">★</span>
                      <span>{courier.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par ville (ce mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cityBreakdown.map((city) => (
              <div key={city.city} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{city.city}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{city.orders.toLocaleString()} commandes</span>
                    <span className="font-medium text-indigo-600">{city.revenue}</span>
                    <span className="text-gray-500">{city.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${city.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rapports planifiés</CardTitle>
          <Button variant="outline" size="sm">Ajouter un rapport</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Nom du rapport</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Fréquence</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Dernière exécution</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Prochaine exécution</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledReports.map((report) => (
                  <tr key={report.name} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{report.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {report.frequency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{report.lastRun}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{report.nextRun}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Exécuter</Button>
                        <Button variant="ghost" size="sm">Modifier</Button>
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
