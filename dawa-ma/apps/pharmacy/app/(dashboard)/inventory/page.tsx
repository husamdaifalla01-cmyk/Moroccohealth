'use client';

import { useState, useCallback, useEffect } from 'react';

// Types for inventory
interface InventoryItem {
  id: string;
  name: string;
  name_ar: string;
  category: string;
  stock: number;
  reorder_level: number;
  price: number;
  status: 'ok' | 'low' | 'out';
  dci: string;
  requires_prescription: boolean;
  cold_storage: boolean;
  expiry_date: string;
  supplier: string;
}

// Mock inventory data
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Doliprane 500mg',
    name_ar: 'دوليبران',
    category: 'Antalgique',
    stock: 150,
    reorder_level: 50,
    price: 15.0,
    status: 'ok',
    dci: 'Paracétamol',
    requires_prescription: false,
    cold_storage: false,
    expiry_date: '2027-06-15',
    supplier: 'SANOFI',
  },
  {
    id: '2',
    name: 'Doliprane 1000mg',
    name_ar: 'دوليبران',
    category: 'Antalgique',
    stock: 80,
    reorder_level: 50,
    price: 25.0,
    status: 'ok',
    dci: 'Paracétamol',
    requires_prescription: false,
    cold_storage: false,
    expiry_date: '2027-08-20',
    supplier: 'SANOFI',
  },
  {
    id: '3',
    name: 'Augmentin 1g',
    name_ar: 'أوجمنتين',
    category: 'Antibiotique',
    stock: 25,
    reorder_level: 30,
    price: 85.0,
    status: 'low',
    dci: 'Amoxicilline + Acide clavulanique',
    requires_prescription: true,
    cold_storage: false,
    expiry_date: '2026-12-10',
    supplier: 'GSK',
  },
  {
    id: '4',
    name: 'Glucophage 850mg',
    name_ar: 'جلوكوفاج',
    category: 'Diabète',
    stock: 0,
    reorder_level: 20,
    price: 35.0,
    status: 'out',
    dci: 'Metformine',
    requires_prescription: true,
    cold_storage: false,
    expiry_date: '2027-03-25',
    supplier: 'MERCK',
  },
  {
    id: '5',
    name: 'Amlor 5mg',
    name_ar: 'أملور',
    category: 'Cardiovasculaire',
    stock: 45,
    reorder_level: 30,
    price: 45.0,
    status: 'ok',
    dci: 'Amlodipine',
    requires_prescription: true,
    cold_storage: false,
    expiry_date: '2027-01-30',
    supplier: 'PFIZER',
  },
  {
    id: '6',
    name: 'Aerius 5mg',
    name_ar: 'إيريوس',
    category: 'Antihistaminique',
    stock: 12,
    reorder_level: 20,
    price: 65.0,
    status: 'low',
    dci: 'Desloratadine',
    requires_prescription: false,
    cold_storage: false,
    expiry_date: '2026-11-15',
    supplier: 'MSD',
  },
  {
    id: '7',
    name: 'Mopral 20mg',
    name_ar: 'موبرال',
    category: 'Gastro',
    stock: 0,
    reorder_level: 15,
    price: 75.0,
    status: 'out',
    dci: 'Oméprazole',
    requires_prescription: true,
    cold_storage: false,
    expiry_date: '2027-04-10',
    supplier: 'ASTRAZENECA',
  },
  {
    id: '8',
    name: 'Insuline Lantus',
    name_ar: 'أنسولين لانتوس',
    category: 'Diabète',
    stock: 8,
    reorder_level: 10,
    price: 450.0,
    status: 'low',
    dci: 'Insuline glargine',
    requires_prescription: true,
    cold_storage: true,
    expiry_date: '2026-08-30',
    supplier: 'SANOFI',
  },
];

const statusConfig = {
  ok: { label: 'En stock', color: 'badge-verify' },
  low: { label: 'Stock faible', color: 'badge-warning' },
  out: { label: 'Rupture', color: 'badge-critical' },
};

const categories = ['Tous', 'Antalgique', 'Antibiotique', 'Diabète', 'Cardiovasculaire', 'Antihistaminique', 'Gastro'];

export default function InventoryPage() {
  const [inventory] = useState<InventoryItem[]>(mockInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ok' | 'low' | 'out'>('all');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name_ar.includes(searchQuery) ||
      item.dci.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'Tous' || item.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Stats
  const stats = {
    total: inventory.length,
    ok: inventory.filter((i) => i.status === 'ok').length,
    low: inventory.filter((i) => i.status === 'low').length,
    out: inventory.filter((i) => i.status === 'out').length,
    coldStorage: inventory.filter((i) => i.cold_storage).length,
    prescription: inventory.filter((i) => i.requires_prescription).length,
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 'j':
          setSelectedIndex((prev) => Math.min(prev + 1, filteredInventory.length - 1));
          break;
        case 'k':
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'n':
          setShowAddModal(true);
          break;
        case 'escape':
          setShowAddModal(false);
          break;
      }
    },
    [filteredInventory.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Inventaire
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Gérez votre stock de médicaments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-verify"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter <span className="kbd ml-2">N</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-6 gap-4">
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'all'
              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
              : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
          }`}
          onClick={() => setFilterStatus('all')}
        >
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
          <p className="text-sm text-[var(--text-muted)]">Produits total</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'ok'
              ? 'border-[var(--color-verify)] bg-[var(--color-verify)]/10'
              : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
          }`}
          onClick={() => setFilterStatus('ok')}
        >
          <p className="text-2xl font-bold text-[var(--color-verify)]">{stats.ok}</p>
          <p className="text-sm text-[var(--text-muted)]">En stock</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'low'
              ? 'border-[var(--color-warning)] bg-[var(--color-warning)]/10'
              : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
          }`}
          onClick={() => setFilterStatus('low')}
        >
          <p className="text-2xl font-bold text-[var(--color-warning)]">{stats.low}</p>
          <p className="text-sm text-[var(--text-muted)]">Stock faible</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'out'
              ? 'border-[var(--priority-critical)] bg-[var(--priority-critical)]/10'
              : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
          }`}
          onClick={() => setFilterStatus('out')}
        >
          <p className="text-2xl font-bold text-[var(--priority-critical)]">{stats.out}</p>
          <p className="text-sm text-[var(--text-muted)]">Rupture</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.coldStorage}</p>
          <p className="text-sm text-[var(--text-muted)]">Réfrigérés</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.prescription}</p>
          <p className="text-sm text-[var(--text-muted)]">Sur ordonnance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
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
            placeholder="Rechercher par nom, DCI ou nom arabe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterCategory === category
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-primary)]">
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Produit
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                DCI
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Catégorie
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Stock
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Prix
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Expiration
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Statut
              </th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-[var(--border-primary)] transition-colors ${
                  selectedIndex === index
                    ? 'bg-[var(--accent-primary)]/10'
                    : 'hover:bg-[var(--bg-elevated)]'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{item.name_ar}</p>
                    </div>
                    <div className="flex gap-1">
                      {item.requires_prescription && (
                        <span className="badge badge-warning text-xs">Rx</span>
                      )}
                      {item.cold_storage && (
                        <span className="badge badge-pending text-xs">❄️</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] text-sm">
                  {item.dci}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {item.category}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-mono text-[var(--text-primary)]">{item.stock}</p>
                    <p className="text-xs text-[var(--text-muted)]">Min: {item.reorder_level}</p>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[var(--accent-primary)]">
                  {item.price.toFixed(2)} DH
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {new Date(item.expiry_date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${statusConfig[item.status].color}`}>
                    {statusConfig[item.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-[var(--text-muted)]">Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="flex items-center justify-center gap-6 text-sm text-[var(--text-muted)]">
        <span><span className="kbd">J</span>/<span className="kbd">K</span> naviguer</span>
        <span><span className="kbd">N</span> nouveau produit</span>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                Ajouter un produit
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg"
              >
                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Nom du produit</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    placeholder="Ex: Doliprane 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Nom arabe</label>
                  <input
                    type="text"
                    dir="rtl"
                    className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    placeholder="دوليبران"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">DCI</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  placeholder="Ex: Paracétamol"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Stock</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Seuil min</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Prix (DH)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-primary)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Ordonnance requise</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-primary)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Stockage réfrigéré</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn-verify flex-1">
                Ajouter le produit
              </button>
              <button onClick={() => setShowAddModal(false)} className="btn-reject">
                Annuler <span className="kbd ml-2">Esc</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
