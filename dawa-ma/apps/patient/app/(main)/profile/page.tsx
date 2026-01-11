'use client';

import { useState } from 'react';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  badge?: string;
  danger?: boolean;
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Compte',
    items: [
      {
        id: 'personal',
        label: 'Informations personnelles',
        description: 'Nom, telephone, email',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        ),
      },
      {
        id: 'addresses',
        label: 'Adresses de livraison',
        description: '2 adresses enregistrees',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        ),
      },
      {
        id: 'insurance',
        label: 'Assurance maladie',
        description: 'CNSS - Active',
        badge: 'Verifie',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        ),
      },
      {
        id: 'payment',
        label: 'Moyens de paiement',
        description: 'Carte bancaire, Cash',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        ),
      },
      {
        id: 'language',
        label: 'Langue',
        description: 'Francais',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Aide & Juridique',
    items: [
      {
        id: 'help',
        label: 'Centre d\'aide',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        ),
      },
      {
        id: 'privacy',
        label: 'Politique de confidentialite',
        description: 'CNDP - Loi 09-08',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        ),
      },
      {
        id: 'terms',
        label: 'Conditions d\'utilisation',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ),
      },
      {
        id: 'data',
        label: 'Mes donnees',
        description: 'Exporter ou supprimer',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        ),
      },
    ],
  },
  {
    title: '',
    items: [
      {
        id: 'logout',
        label: 'Se deconnecter',
        danger: true,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        ),
      },
    ],
  },
];

export default function ProfilePage() {
  const [user] = useState({
    name: 'Ahmed Benali',
    phone: '+212 6 12 34 56 78',
    email: 'ahmed.benali@email.com',
    avatar: null,
  });

  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Mon Profil</h1>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Profile Card */}
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-light)] flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--brand-primary)]">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{user.name}</h2>
              <p className="text-sm text-[var(--text-muted)]">{user.phone}</p>
              <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
            </div>
            <button className="p-2 rounded-full bg-[var(--bg-surface)]">
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
                {section.title}
              </h3>
            )}
            <div className="card divide-y divide-[var(--border-primary)]">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <span className={item.danger ? 'text-red-500' : 'text-[var(--text-secondary)]'}>
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <p className={`font-medium ${item.danger ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-sm text-[var(--text-muted)]">{item.description}</p>
                    )}
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-600">
                      {item.badge}
                    </span>
                  )}
                  {!item.danger && (
                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Version */}
        <p className="text-center text-xs text-[var(--text-muted)]">
          DAWA.ma v1.0.0 (V10)
        </p>
      </div>
    </div>
  );
}
