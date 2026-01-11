'use client';

import { useState, useCallback, useEffect } from 'react';

// Types for orders
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  patient_name: string;
  patient_phone: string;
  items: OrderItem[];
  total: number;
  created_at: string;
  priority_score: number;
  sla_breach_in_minutes: number;
  has_prescription: boolean;
  prescription_verified: boolean;
  delivery_address: string;
  status: 'new' | 'reviewing' | 'preparing' | 'ready' | 'delivering' | 'completed';
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'DW-2026-00128',
    patient_name: 'Youssef Mansouri',
    patient_phone: '+212 6 12 34 56 78',
    items: [
      { name: 'Doliprane 1000mg', quantity: 2, price: 25 },
      { name: 'Augmentin 1g', quantity: 1, price: 85 },
    ],
    total: 135,
    created_at: 'Il y a 2 min',
    priority_score: 95,
    sla_breach_in_minutes: 8,
    has_prescription: true,
    prescription_verified: true,
    delivery_address: 'Bd Mohammed V, Casablanca',
    status: 'new',
  },
  {
    id: 'DW-2026-00127',
    patient_name: 'Nadia Karimi',
    patient_phone: '+212 6 98 76 54 32',
    items: [
      { name: 'Aerius 5mg', quantity: 1, price: 65 },
    ],
    total: 65,
    created_at: 'Il y a 5 min',
    priority_score: 72,
    sla_breach_in_minutes: 18,
    has_prescription: false,
    prescription_verified: false,
    delivery_address: 'Rue Atlas, Rabat',
    status: 'new',
  },
  {
    id: 'DW-2026-00126',
    patient_name: 'Ahmed Benali',
    patient_phone: '+212 6 11 22 33 44',
    items: [
      { name: 'Glucophage 850mg', quantity: 2, price: 35 },
      { name: 'Amlor 5mg', quantity: 1, price: 45 },
      { name: 'Triatec 5mg', quantity: 1, price: 55 },
    ],
    total: 170,
    created_at: 'Il y a 12 min',
    priority_score: 88,
    sla_breach_in_minutes: 15,
    has_prescription: true,
    prescription_verified: false,
    delivery_address: 'Hay Hassani, Casablanca',
    status: 'reviewing',
  },
  {
    id: 'DW-2026-00125',
    patient_name: 'Fatima Zahra',
    patient_phone: '+212 6 55 44 33 22',
    items: [
      { name: 'Mopral 20mg', quantity: 1, price: 75 },
      { name: 'Gaviscon 500ml', quantity: 1, price: 55 },
    ],
    total: 130,
    created_at: 'Il y a 20 min',
    priority_score: 65,
    sla_breach_in_minutes: 25,
    has_prescription: true,
    prescription_verified: true,
    delivery_address: 'Quartier Océan, Rabat',
    status: 'preparing',
  },
  {
    id: 'DW-2026-00124',
    patient_name: 'Mohamed Kabbaj',
    patient_phone: '+212 6 77 88 99 00',
    items: [
      { name: 'Supradyn', quantity: 1, price: 95 },
      { name: 'Berocca', quantity: 2, price: 85 },
    ],
    total: 265,
    created_at: 'Il y a 30 min',
    priority_score: 45,
    sla_breach_in_minutes: 40,
    has_prescription: false,
    prescription_verified: false,
    delivery_address: 'Anfa, Casablanca',
    status: 'ready',
  },
  {
    id: 'DW-2026-00123',
    patient_name: 'Sara Lahlou',
    patient_phone: '+212 6 33 22 11 00',
    items: [
      { name: 'Zyrtec 10mg', quantity: 1, price: 55 },
    ],
    total: 55,
    created_at: 'Il y a 35 min',
    priority_score: 38,
    sla_breach_in_minutes: 50,
    has_prescription: false,
    prescription_verified: false,
    delivery_address: 'Hay Riad, Rabat',
    status: 'ready',
  },
  {
    id: 'DW-2026-00122',
    patient_name: 'Hassan Bennani',
    patient_phone: '+212 6 44 55 66 77',
    items: [
      { name: 'Aspegic 1000mg', quantity: 1, price: 45 },
      { name: 'Efferalgan 1g', quantity: 1, price: 35 },
    ],
    total: 80,
    created_at: 'Il y a 45 min',
    priority_score: 55,
    sla_breach_in_minutes: 35,
    has_prescription: false,
    prescription_verified: false,
    delivery_address: 'Maarif, Casablanca',
    status: 'delivering',
  },
];

const columns = [
  { id: 'new', title: 'Nouvelles', icon: '📥', count: 0 },
  { id: 'reviewing', title: 'Vérification', icon: '🔍', count: 0 },
  { id: 'preparing', title: 'Préparation', icon: '⚗️', count: 0 },
  { id: 'ready', title: 'Prêt', icon: '✅', count: 0 },
  { id: 'delivering', title: 'Livraison', icon: '🚴', count: 0 },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);

  // Get orders by status
  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => {
      const matchesStatus = order.status === status;
      const matchesSearch =
        searchQuery === '' ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patient_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  // Calculate column counts
  const columnCounts = columns.map((col) => getOrdersByStatus(col.id).length);

  // Move order to next status
  const moveOrderToNextStatus = (orderId: string) => {
    const statusFlow: Order['status'][] = ['new', 'reviewing', 'preparing', 'ready', 'delivering', 'completed'];
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const currentIndex = statusFlow.indexOf(order.status);
          if (currentIndex < statusFlow.length - 1) {
            return { ...order, status: statusFlow[currentIndex + 1] };
          }
        }
        return order;
      })
    );
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 'h':
          setSelectedColumn((prev) => Math.max(prev - 1, 0));
          setSelectedOrderIndex(0);
          break;
        case 'l':
          setSelectedColumn((prev) => Math.min(prev + 1, columns.length - 1));
          setSelectedOrderIndex(0);
          break;
        case 'j':
          setSelectedOrderIndex((prev) => {
            const columnOrders = getOrdersByStatus(columns[selectedColumn].id);
            return Math.min(prev + 1, columnOrders.length - 1);
          });
          break;
        case 'k':
          setSelectedOrderIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'enter':
          const columnOrders = getOrdersByStatus(columns[selectedColumn].id);
          if (columnOrders[selectedOrderIndex]) {
            setSelectedOrder(columnOrders[selectedOrderIndex]);
          }
          break;
        case 'escape':
          setSelectedOrder(null);
          break;
        case 'm':
          if (selectedOrder) {
            moveOrderToNextStatus(selectedOrder.id);
          }
          break;
      }
    },
    [selectedColumn, selectedOrderIndex, selectedOrder]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Gestion des commandes
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {orders.length} commandes actives • Kanban View
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] w-64"
            />
          </div>
          <div className="keyboard-shortcut">
            <span className="kbd">H</span>/<span className="kbd">L</span> colonnes
            <span className="mx-2">•</span>
            <span className="kbd">J</span>/<span className="kbd">K</span> items
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map((column, colIndex) => {
          const columnOrders = getOrdersByStatus(column.id);
          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-72 flex flex-col rounded-lg border ${
                selectedColumn === colIndex
                  ? 'border-[var(--accent-primary)]'
                  : 'border-[var(--border-primary)]'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 bg-[var(--bg-elevated)] rounded-t-lg border-b border-[var(--border-primary)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{column.icon}</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {column.title}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[var(--bg-primary)] rounded-full text-sm font-mono text-[var(--text-secondary)]">
                    {columnOrders.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-[var(--bg-primary)]">
                {columnOrders.map((order, orderIndex) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`queue-item cursor-pointer ${
                      selectedColumn === colIndex && selectedOrderIndex === orderIndex
                        ? 'queue-item-selected'
                        : ''
                    }`}
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="priority-badge"
                          style={{
                            background:
                              order.priority_score >= 80
                                ? 'var(--priority-critical)'
                                : order.priority_score >= 50
                                ? 'var(--priority-high)'
                                : 'var(--priority-medium)',
                          }}
                        >
                          {order.priority_score}
                        </span>
                        <span className="font-mono text-xs text-[var(--text-muted)]">
                          {order.id}
                        </span>
                      </div>
                      {order.has_prescription && (
                        <span
                          className={`badge ${
                            order.prescription_verified ? 'badge-verify' : 'badge-warning'
                          }`}
                        >
                          {order.prescription_verified ? '✓ Rx' : '⏳ Rx'}
                        </span>
                      )}
                    </div>

                    {/* Patient Name */}
                    <p className="font-medium text-[var(--text-primary)] mb-1">
                      {order.patient_name}
                    </p>

                    {/* Items Preview */}
                    <div className="text-sm text-[var(--text-muted)] mb-2">
                      {order.items.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="truncate">{item.name}</span>
                          <span>×{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-xs">+{order.items.length - 2} autres</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-primary)]">
                      <span className="font-semibold text-[var(--accent-primary)]">
                        {order.total.toFixed(2)} DH
                      </span>
                      <span
                        className={`font-mono text-xs ${
                          order.sla_breach_in_minutes <= 15
                            ? 'text-[var(--priority-critical)]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {order.sla_breach_in_minutes}min
                      </span>
                    </div>
                  </div>
                ))}

                {columnOrders.length === 0 && (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <p className="text-sm">Aucune commande</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[var(--text-muted)]">{selectedOrder.id}</span>
                  <span
                    className="priority-badge"
                    style={{
                      background:
                        selectedOrder.priority_score >= 80
                          ? 'var(--priority-critical)'
                          : selectedOrder.priority_score >= 50
                          ? 'var(--priority-high)'
                          : 'var(--priority-medium)',
                    }}
                  >
                    {selectedOrder.priority_score}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                  {selectedOrder.patient_name}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{selectedOrder.patient_phone}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg"
              >
                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Delivery Address */}
            <div className="mb-4 p-3 bg-[var(--bg-elevated)] rounded-lg">
              <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">Adresse de livraison</span>
              </div>
              <p className="text-[var(--text-primary)]">{selectedOrder.delivery_address}</p>
            </div>

            {/* Items List */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Articles commandés
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] rounded-lg"
                  >
                    <div>
                      <p className="text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">Qté: {item.quantity}</p>
                    </div>
                    <span className="font-mono text-[var(--text-primary)]">
                      {(item.price * item.quantity).toFixed(2)} DH
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-[var(--accent-primary)]/10 rounded-lg mb-4">
              <span className="font-semibold text-[var(--text-primary)]">Total</span>
              <span className="text-xl font-bold text-[var(--accent-primary)]">
                {selectedOrder.total.toFixed(2)} DH
              </span>
            </div>

            {/* Prescription Status */}
            {selectedOrder.has_prescription && (
              <div
                className={`mb-4 p-3 rounded-lg border ${
                  selectedOrder.prescription_verified
                    ? 'border-[var(--color-verify)] bg-[var(--color-verify)]/10'
                    : 'border-[var(--color-warning)] bg-[var(--color-warning)]/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedOrder.prescription_verified ? (
                    <>
                      <svg className="w-5 h-5 text-[var(--color-verify)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[var(--color-verify)]">Ordonnance vérifiée</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-[var(--color-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[var(--color-warning)]">Ordonnance en attente de vérification</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  moveOrderToNextStatus(selectedOrder.id);
                  setSelectedOrder(null);
                }}
                className="btn-verify flex-1"
              >
                Passer à l'étape suivante <span className="kbd ml-2">M</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-reject"
              >
                Fermer <span className="kbd ml-2">Esc</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
