'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'prescription',
    label: 'Ordonnance',
    href: '/upload',
    color: 'bg-teal-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'reorder',
    label: 'Renouveler',
    href: '/reorder',
    color: 'bg-blue-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    id: 'pharmacy',
    label: 'Pharmacies',
    href: '/pharmacies',
    color: 'bg-purple-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    id: 'reminders',
    label: 'Rappels',
    href: '/reminders',
    color: 'bg-pink-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
];

// Mock recent order for demonstration
const recentOrder = {
  id: 'DW-2026-00892',
  status: 'preparing',
  statusLabel: 'En preparation',
  pharmacy: 'Pharmacie Ibn Rochd',
  items: 3,
  eta: '30-45 min',
};

export default function HomePage() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
        setIsUploading(false);
        // Navigate to order confirmation
      }, 2000);
    }
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <header className="app-header">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Bonjour,</p>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Ahmed</h1>
        </div>
        <button className="relative p-2 rounded-full bg-[var(--bg-surface)]">
          <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </header>

      <div className="px-4 space-y-6 mt-4">
        {/* Upload Prescription Card */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Commander vos medicaments
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={handleUploadClick}
            className="upload-zone cursor-pointer"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-secondary)]">Analyse en cours...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[var(--brand-light)] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-[var(--text-primary)] mb-1">
                  Photographier votre ordonnance
                </p>
                <p className="text-sm text-[var(--text-muted)] text-center">
                  Notre IA verifiera la qualite de l'image avant l'envoi
                </p>
              </>
            )}
          </div>

          <p className="text-xs text-[var(--text-muted)] text-center mt-4">
            Ou selectionnez un fichier depuis votre galerie
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
            Actions rapides
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center text-white`}>
                  {action.icon}
                </div>
                <span className="text-xs text-[var(--text-secondary)] text-center">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Order Card */}
        {recentOrder && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Commande en cours
              </h3>
              <Link href="/orders" className="text-sm text-[var(--brand-primary)] font-medium">
                Voir tout
              </Link>
            </div>

            <Link href={`/orders/${recentOrder.id}`} className="order-card block">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-sm text-[var(--text-muted)]">{recentOrder.id}</p>
                  <p className="font-medium text-[var(--text-primary)]">{recentOrder.pharmacy}</p>
                </div>
                <span className="status-badge status-preparing">
                  {recentOrder.statusLabel}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="progress-steps">
                <div className="progress-step completed">
                  <div className="progress-step-icon">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="progress-step-label">Verifie</span>
                </div>
                <div className="flex-1 h-0.5 bg-[var(--brand-primary)] mx-1" />
                <div className="progress-step active">
                  <div className="progress-step-icon">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <span className="progress-step-label">Preparation</span>
                </div>
                <div className="flex-1 h-0.5 bg-[var(--border-primary)] mx-1" />
                <div className="progress-step">
                  <div className="progress-step-icon">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  </div>
                  <span className="progress-step-label">Livraison</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-primary)]">
                <span className="text-sm text-[var(--text-muted)]">{recentOrder.items} articles</span>
                <span className="text-sm font-medium text-[var(--brand-primary)]">
                  ETA: {recentOrder.eta}
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Chronic Care Banner */}
        <div className="card p-4 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Suivi Maladies Chroniques</p>
              <p className="text-sm text-white/80">Renouvellement automatique de vos traitements</p>
            </div>
            <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
