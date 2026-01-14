'use client';

import { useState } from 'react';

interface HistoryDelivery {
  id: string;
  order_number: string;
  date: string;
  pharmacy: string;
  patient_address: string;
  earnings: number;
  tip: number;
  duration_minutes: number;
  distance_km: number;
  rating?: number;
}

// Mock data
const mockHistory: HistoryDelivery[] = [
  { id: '1', order_number: 'DW-2026-00890', date: 'Aujourd\'hui 14:30', pharmacy: 'Pharmacie Ibn Rochd', patient_address: 'Maarif, Casablanca', earnings: 35, tip: 5, duration_minutes: 22, distance_km: 3.2, rating: 5 },
  { id: '2', order_number: 'DW-2026-00889', date: 'Aujourd\'hui 13:15', pharmacy: 'Pharmacie Al Amal', patient_address: 'Hay Hassani, Casablanca', earnings: 40, tip: 0, duration_minutes: 28, distance_km: 4.1 },
  { id: '3', order_number: 'DW-2026-00888', date: 'Aujourd\'hui 11:45', pharmacy: 'Pharmacie Centrale', patient_address: 'Anfa, Casablanca', earnings: 35, tip: 10, duration_minutes: 18, distance_km: 2.5, rating: 5 },
  { id: '4', order_number: 'DW-2026-00885', date: 'Hier 18:20', pharmacy: 'Pharmacie Ibn Rochd', patient_address: 'Bourgogne, Casablanca', earnings: 35, tip: 5, duration_minutes: 25, distance_km: 3.8, rating: 4 },
  { id: '5', order_number: 'DW-2026-00884', date: 'Hier 16:45', pharmacy: 'Pharmacie Al Amal', patient_address: 'Maarif, Casablanca', earnings: 35, tip: 0, duration_minutes: 20, distance_km: 2.9 },
  { id: '6', order_number: 'DW-2026-00883', date: 'Hier 15:00', pharmacy: 'Pharmacie Nour', patient_address: 'Hay Mohammadi, Casablanca', earnings: 45, tip: 5, duration_minutes: 35, distance_km: 5.5, rating: 5 },
  { id: '7', order_number: 'DW-2026-00880', date: '09 Jan 17:30', pharmacy: 'Pharmacie Ibn Rochd', patient_address: 'Sidi Maarouf, Casablanca', earnings: 50, tip: 10, duration_minutes: 40, distance_km: 6.2, rating: 5 },
  { id: '8', order_number: 'DW-2026-00879', date: '09 Jan 14:15', pharmacy: 'Pharmacie Centrale', patient_address: 'Ain Diab, Casablanca', earnings: 45, tip: 0, duration_minutes: 32, distance_km: 4.8 },
];

export default function HistoryPage() {
  const [history] = useState<HistoryDelivery[]>(mockHistory);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="app-header">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Historique</h1>
        <button className="p-2 rounded-lg bg-[var(--bg-elevated)]">
          <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </button>
      </header>

      <div className="p-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{history.length}</p>
            <p className="text-sm text-[var(--text-muted)]">Livraisons cette semaine</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">4.8</p>
            <p className="text-sm text-[var(--text-muted)]">Note moyenne</p>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {history.map((delivery) => (
            <div key={delivery.id} className="card p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-sm text-[var(--text-muted)]">{delivery.order_number}</p>
                  <p className="text-xs text-[var(--text-muted)]">{delivery.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--brand-primary)]">
                    {delivery.earnings + delivery.tip} DH
                  </p>
                  {delivery.tip > 0 && (
                    <p className="text-xs text-emerald-400">+{delivery.tip} tip</p>
                  )}
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="text-[var(--text-secondary)]">{delivery.pharmacy}</span>
                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <span className="text-[var(--text-secondary)]">{delivery.patient_address}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-primary)]">
                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                  <span>{delivery.duration_minutes} min</span>
                  <span>{delivery.distance_km} km</span>
                </div>
                {delivery.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < delivery.rating! ? 'text-amber-400' : 'text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
