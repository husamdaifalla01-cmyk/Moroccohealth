'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type DeliveryStatus = 'assigned' | 'pickup' | 'picked_up' | 'transit' | 'arrived' | 'delivered';

interface Delivery {
  id: string;
  order_number: string;
  status: DeliveryStatus;
  pharmacy: {
    name: string;
    address: string;
    distance_km: number;
  };
  patient: {
    name: string;
    phone: string;
    address: string;
    delivery_instructions?: string;
  };
  items_count: number;
  payment_method: 'prepaid' | 'cod';
  cod_amount?: number;
  estimated_time_minutes: number;
  assigned_at: string;
  is_urgent: boolean;
}

// Mock data
const mockDeliveries: Delivery[] = [
  {
    id: '1',
    order_number: 'DW-2026-00892',
    status: 'pickup',
    pharmacy: {
      name: 'Pharmacie Ibn Rochd',
      address: '45 Bd Mohammed V, Casablanca',
      distance_km: 1.2,
    },
    patient: {
      name: 'Ahmed Mansouri',
      phone: '+212 6 12 34 56 78',
      address: '23 Rue Atlas, Maarif, Casablanca',
      delivery_instructions: 'Appeler avant d\'arriver. Code porte: 1234',
    },
    items_count: 3,
    payment_method: 'cod',
    cod_amount: 245.50,
    estimated_time_minutes: 25,
    assigned_at: 'Il y a 5 min',
    is_urgent: true,
  },
  {
    id: '2',
    order_number: 'DW-2026-00891',
    status: 'assigned',
    pharmacy: {
      name: 'Pharmacie Al Amal',
      address: '12 Av Hassan II, Casablanca',
      distance_km: 2.8,
    },
    patient: {
      name: 'Fatima Zahra',
      phone: '+212 6 98 76 54 32',
      address: '78 Rue Fes, Hay Hassani, Casablanca',
    },
    items_count: 2,
    payment_method: 'prepaid',
    estimated_time_minutes: 35,
    assigned_at: 'Il y a 2 min',
    is_urgent: false,
  },
];

const statusConfig: Record<DeliveryStatus, { label: string; class: string; next?: DeliveryStatus; nextLabel?: string }> = {
  assigned: { label: 'Assigne', class: 'delivery-new', next: 'pickup', nextLabel: 'Aller chercher' },
  pickup: { label: 'En route pharmacie', class: 'delivery-pickup', next: 'picked_up', nextLabel: 'Confirmer recuperation' },
  picked_up: { label: 'Colis recupere', class: 'delivery-transit', next: 'transit', nextLabel: 'Commencer livraison' },
  transit: { label: 'En livraison', class: 'delivery-transit', next: 'arrived', nextLabel: 'Arrive destination' },
  arrived: { label: 'Arrive', class: 'delivery-arrived', next: 'delivered', nextLabel: 'Confirmer livraison' },
  delivered: { label: 'Livre', class: 'delivery-arrived' },
};

export default function DeliveriesPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [todayStats, setTodayStats] = useState({
    completed: 12,
    earnings: 485,
    distance: 28.5,
    avgTime: 22,
  });

  // Location tracking (mock)
  const [currentLocation, setCurrentLocation] = useState({ lat: 33.5731, lng: -7.5898 });

  // Toggle online status
  const toggleOnline = useCallback(() => {
    setIsOnline((prev) => !prev);
  }, []);

  // Update delivery status
  const updateDeliveryStatus = (deliveryId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryId) {
          const config = statusConfig[d.status];
          if (config.next) {
            return { ...d, status: config.next };
          }
        }
        return d;
      })
    );
  };

  const activeDeliveries = deliveries.filter((d) => d.status !== 'delivered');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="app-header">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Bonjour,</p>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Youssef</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Online Toggle */}
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Today's Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="stat-card">
            <div className="stat-value">{todayStats.completed}</div>
            <div className="stat-label">Livraisons</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-[var(--brand-primary)]">{todayStats.earnings} DH</div>
            <div className="stat-label">Gains</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{todayStats.distance} km</div>
            <div className="stat-label">Distance</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{todayStats.avgTime} min</div>
            <div className="stat-label">Temps moy.</div>
          </div>
        </div>

        {/* Active Deliveries */}
        {activeDeliveries.length > 0 ? (
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Livraisons actives ({activeDeliveries.length})
            </h2>
            <div className="space-y-3">
              {activeDeliveries.map((delivery) => (
                <Link
                  key={delivery.id}
                  href={`/deliveries/${delivery.id}`}
                  className={`delivery-card block ${delivery.is_urgent ? 'urgent' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[var(--text-muted)]">
                        {delivery.order_number}
                      </span>
                      {delivery.is_urgent && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <span className={`status-badge ${statusConfig[delivery.status].class}`}>
                      {statusConfig[delivery.status].label}
                    </span>
                  </div>

                  {/* Route Info */}
                  <div className="space-y-3">
                    {/* Pharmacy */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)]">{delivery.pharmacy.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">{delivery.pharmacy.distance_km} km</p>
                      </div>
                    </div>

                    {/* Connector Line */}
                    <div className="ml-4 w-px h-4 bg-[var(--border-primary)]" />

                    {/* Patient */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)]">{delivery.patient.name}</p>
                        <p className="text-sm text-[var(--text-muted)] truncate">{delivery.patient.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-primary)]">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[var(--text-muted)]">{delivery.items_count} articles</span>
                      {delivery.payment_method === 'cod' && delivery.cod_amount && (
                        <span className="text-amber-400 font-medium">
                          COD: {delivery.cod_amount.toFixed(2)} DH
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-[var(--brand-primary)]">
                      ~{delivery.estimated_time_minutes} min
                    </span>
                  </div>

                  {/* Quick Action */}
                  {statusConfig[delivery.status].next && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        updateDeliveryStatus(delivery.id);
                      }}
                      className="w-full mt-3 py-3 bg-[var(--brand-primary)] text-[var(--text-inverse)] font-semibold rounded-xl"
                    >
                      {statusConfig[delivery.status].nextLabel}
                    </button>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* No Active Deliveries */
          <div className="card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Aucune livraison en cours
            </h3>
            <p className="text-[var(--text-muted)]">
              {isOnline
                ? 'Restez en ligne pour recevoir de nouvelles livraisons'
                : 'Passez en ligne pour commencer a recevoir des livraisons'}
            </p>
          </div>
        )}

        {/* Available Area */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[var(--text-primary)]">Zone active</h3>
            <span className="text-sm text-[var(--brand-primary)]">Modifier</span>
          </div>
          <div className="map-container bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <p className="text-[var(--text-muted)]">Casablanca - Maarif, Hay Hassani</p>
          </div>
        </div>
      </div>
    </div>
  );
}
