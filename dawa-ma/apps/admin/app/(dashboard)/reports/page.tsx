'use client';

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
        <button className="btn-primary">Générer rapport personnalisé</button>
        <button className="btn-secondary">Exporter données brutes</button>
        <button className="btn-secondary">Planifier un rapport</button>
      </div>

      {/* Revenue Summary */}
      <div className="metrics-grid">
        {Object.entries(revenueData).map(([period, data]) => (
          <div key={period} className="stat-card">
            <p className="stat-label capitalize">
              {period === 'today' ? "Aujourd'hui" : period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : 'Cette année'}
            </p>
            <p className="stat-value mt-1" style={{ color: 'var(--accent-primary)' }}>{data.value}</p>
            <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{data.orders.toLocaleString()} commandes</span>
              <span>Panier: {data.avgBasket}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pharmacies */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-header !mb-0">Top 5 Pharmacies (ce mois)</h3>
            <button className="btn-secondary text-sm py-1 px-2">Voir tout</button>
          </div>
          <div className="space-y-4">
            {topPharmacies.map((pharmacy) => (
              <div key={pharmacy.rank} className="flex items-center gap-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: pharmacy.rank === 1 ? 'rgba(251, 191, 36, 0.2)' :
                      pharmacy.rank === 2 ? 'var(--bg-surface)' :
                      pharmacy.rank === 3 ? 'rgba(251, 191, 36, 0.1)' :
                      'var(--bg-elevated)',
                    color: pharmacy.rank <= 3 ? 'var(--color-warning)' : 'var(--text-muted)',
                  }}
                >
                  {pharmacy.rank}
                </span>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{pharmacy.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pharmacy.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium" style={{ color: 'var(--accent-primary)' }}>{pharmacy.revenue}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pharmacy.orders} commandes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Couriers */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-header !mb-0">Top 5 Livreurs (ce mois)</h3>
            <button className="btn-secondary text-sm py-1 px-2">Voir tout</button>
          </div>
          <div className="space-y-4">
            {topCouriers.map((courier) => (
              <div key={courier.rank} className="flex items-center gap-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: courier.rank === 1 ? 'rgba(251, 191, 36, 0.2)' :
                      courier.rank === 2 ? 'var(--bg-surface)' :
                      courier.rank === 3 ? 'rgba(251, 191, 36, 0.1)' :
                      'var(--bg-elevated)',
                    color: courier.rank <= 3 ? 'var(--color-warning)' : 'var(--text-muted)',
                  }}
                >
                  {courier.rank}
                </span>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{courier.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{courier.zone}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{courier.deliveries} livraisons</p>
                  <div className="flex items-center gap-1 text-xs justify-end">
                    <span style={{ color: 'var(--color-warning)' }}>★</span>
                    <span>{courier.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City Breakdown */}
      <div className="chart-container">
        <h3 className="section-header">Répartition par ville (ce mois)</h3>
        <div className="space-y-4">
          {cityBreakdown.map((city) => (
            <div key={city.city} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{city.city}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>{city.orders.toLocaleString()} commandes</span>
                  <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{city.revenue}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{city.percentage}%</span>
                </div>
              </div>
              <div
                className="w-full rounded-full h-2"
                style={{ background: 'var(--bg-surface)' }}
              >
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${city.percentage}%`, background: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="chart-container !p-0">
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Rapports planifiés
          </h3>
          <button className="btn-secondary text-sm">Ajouter un rapport</button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom du rapport</th>
                <th>Fréquence</th>
                <th>Dernière exécution</th>
                <th>Prochaine exécution</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduledReports.map((report) => (
                <tr key={report.name}>
                  <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{report.name}</td>
                  <td>
                    <span className="badge badge-neutral">{report.frequency}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{report.lastRun}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{report.nextRun}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary text-sm py-1 px-2">Exécuter</button>
                      <button className="btn-secondary text-sm py-1 px-2">Modifier</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
