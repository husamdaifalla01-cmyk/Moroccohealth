'use client';

import { useState } from 'react';
import Link from 'next/link';

type OrderStatus = 'pending' | 'verified' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  status: OrderStatus;
  pharmacy: string;
  items: number;
  total: string;
  createdAt: string;
  eta?: string;
}

const statusConfig: Record<OrderStatus, { label: string; class: string; icon: React.ReactNode }> = {
  pending: {
    label: 'En attente',
    class: 'status-pending',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  verified: {
    label: 'Verifie',
    class: 'status-verified',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  preparing: {
    label: 'En preparation',
    class: 'status-preparing',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  ready: {
    label: 'Pret',
    class: 'status-verified',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  delivering: {
    label: 'En livraison',
    class: 'status-delivering',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  delivered: {
    label: 'Livre',
    class: 'status-delivered',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  cancelled: {
    label: 'Annule',
    class: 'bg-gray-100 text-gray-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

const mockOrders: Order[] = [
  {
    id: 'DW-2026-00892',
    status: 'preparing',
    pharmacy: 'Pharmacie Ibn Rochd',
    items: 3,
    total: '245.50 DH',
    createdAt: 'Aujourd\'hui, 10:30',
    eta: '30-45 min',
  },
  {
    id: 'DW-2026-00891',
    status: 'delivering',
    pharmacy: 'Pharmacie Al Amal',
    items: 2,
    total: '128.00 DH',
    createdAt: 'Aujourd\'hui, 09:15',
    eta: '10-15 min',
  },
  {
    id: 'DW-2026-00885',
    status: 'delivered',
    pharmacy: 'Pharmacie Ibn Rochd',
    items: 4,
    total: '312.75 DH',
    createdAt: 'Hier, 16:45',
  },
  {
    id: 'DW-2026-00879',
    status: 'delivered',
    pharmacy: 'Pharmacie Centrale',
    items: 1,
    total: '45.00 DH',
    createdAt: '09 Jan 2026',
  },
  {
    id: 'DW-2026-00872',
    status: 'delivered',
    pharmacy: 'Pharmacie Ibn Rochd',
    items: 5,
    total: '398.25 DH',
    createdAt: '07 Jan 2026',
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const activeOrders = mockOrders.filter(
    (o) => !['delivered', 'cancelled'].includes(o.status)
  );
  const historyOrders = mockOrders.filter((o) =>
    ['delivered', 'cancelled'].includes(o.status)
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Mes Commandes</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-primary)] bg-[var(--bg-elevated)]">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'active'
              ? 'text-[var(--brand-primary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          En cours
          {activeOrders.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[var(--brand-primary)] text-white">
              {activeOrders.length}
            </span>
          )}
          {activeTab === 'active' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'history'
              ? 'text-[var(--brand-primary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          Historique
          {activeTab === 'history' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)]" />
          )}
        </button>
      </div>

      {/* Orders List */}
      <div className="px-4 py-4 space-y-3">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-surface)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-[var(--text-muted)]">
              {activeTab === 'active'
                ? 'Aucune commande en cours'
                : 'Aucune commande dans l\'historique'}
            </p>
            {activeTab === 'active' && (
              <Link href="/home" className="mt-4 inline-block text-[var(--brand-primary)] font-medium">
                Commander maintenant
              </Link>
            )}
          </div>
        ) : (
          displayedOrders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="order-card block"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-mono text-sm text-[var(--text-muted)]">{order.id}</p>
                  <p className="font-medium text-[var(--text-primary)]">{order.pharmacy}</p>
                </div>
                <span className={`status-badge ${statusConfig[order.status].class}`}>
                  {statusConfig[order.status].icon}
                  {statusConfig[order.status].label}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">{order.createdAt}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-secondary)]">{order.items} articles</span>
                  <span className="font-semibold text-[var(--text-primary)]">{order.total}</span>
                </div>
              </div>

              {order.eta && (
                <div className="mt-3 pt-3 border-t border-[var(--border-primary)] flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Temps estime</span>
                  <span className="text-sm font-medium text-[var(--brand-primary)]">{order.eta}</span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
