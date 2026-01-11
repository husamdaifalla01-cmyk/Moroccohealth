'use client';

import { useState } from 'react';

// Types for settings
interface PharmacySettings {
  name: string;
  license_number: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  delivery_radius_km: number;
  preparation_time_min: number;
  cold_storage_available: boolean;
  accepts_prescriptions: boolean;
  operating_hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  notifications: {
    new_orders: boolean;
    stock_alerts: boolean;
    daily_reports: boolean;
    prescription_reminders: boolean;
  };
}

const defaultSettings: PharmacySettings = {
  name: 'Pharmacie Atlas',
  license_number: 'PPB-12345',
  address: '123 Boulevard Mohammed V',
  city: 'Casablanca',
  phone: '+212 522 123 456',
  email: 'contact@pharmacie-atlas.ma',
  delivery_radius_km: 5,
  preparation_time_min: 15,
  cold_storage_available: true,
  accepts_prescriptions: true,
  operating_hours: {
    lundi: { open: '08:00', close: '20:00', closed: false },
    mardi: { open: '08:00', close: '20:00', closed: false },
    mercredi: { open: '08:00', close: '20:00', closed: false },
    jeudi: { open: '08:00', close: '20:00', closed: false },
    vendredi: { open: '08:00', close: '20:00', closed: false },
    samedi: { open: '09:00', close: '18:00', closed: false },
    dimanche: { open: '10:00', close: '14:00', closed: true },
  },
  notifications: {
    new_orders: true,
    stock_alerts: true,
    daily_reports: false,
    prescription_reminders: true,
  },
};

const dayLabels: { [key: string]: string } = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<PharmacySettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'pharmacy' | 'hours' | 'delivery' | 'notifications'>('pharmacy');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const updateNotification = (key: keyof PharmacySettings['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: 'pharmacy', label: 'Pharmacie', icon: '🏥' },
    { id: 'hours', label: 'Horaires', icon: '🕐' },
    { id: 'delivery', label: 'Livraison', icon: '🚴' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ] as const;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Paramètres
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Gérez les informations et préférences de votre pharmacie
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-verify"
        >
          {isSaving ? (
            <>
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Enregistrement...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Enregistrer
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-primary)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        {activeTab === 'pharmacy' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Informations de la pharmacie
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Nom de la pharmacie
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Numéro de licence (PPB)
                </label>
                <input
                  type="text"
                  value={settings.license_number}
                  disabled
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-muted)] cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-primary)]">
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                Capacités
              </h4>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cold_storage_available}
                    onChange={(e) => setSettings({ ...settings, cold_storage_available: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border-primary)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]"
                  />
                  <div>
                    <p className="text-[var(--text-primary)]">Stockage réfrigéré</p>
                    <p className="text-xs text-[var(--text-muted)]">Capacité de stocker des médicaments thermosensibles</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.accepts_prescriptions}
                    onChange={(e) => setSettings({ ...settings, accepts_prescriptions: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border-primary)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]"
                  />
                  <div>
                    <p className="text-[var(--text-primary)]">Ordonnances acceptées</p>
                    <p className="text-xs text-[var(--text-muted)]">Accepter les commandes avec ordonnance</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Horaires d'ouverture
            </h3>

            <div className="space-y-3">
              {Object.entries(settings.operating_hours).map(([day, hours]) => (
                <div
                  key={day}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    hours.closed
                      ? 'bg-[var(--bg-primary)]'
                      : 'bg-[var(--bg-elevated)]'
                  }`}
                >
                  <span className="w-24 font-medium text-[var(--text-primary)]">
                    {dayLabels[day]}
                  </span>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => updateHours(day, 'open', e.target.value)}
                    disabled={hours.closed}
                    className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-[var(--text-muted)]">à</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => updateHours(day, 'close', e.target.value)}
                    disabled={hours.closed}
                    className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label className="flex items-center gap-2 ml-auto cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => updateHours(day, 'closed', e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--border-primary)] bg-[var(--bg-elevated)] text-[var(--priority-critical)]"
                    />
                    <span className={`text-sm ${hours.closed ? 'text-[var(--priority-critical)]' : 'text-[var(--text-muted)]'}`}>
                      Fermé
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-[var(--text-primary)]">
                    Ces horaires sont affichés aux patients sur DAWA.ma
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Assurez-vous qu'ils correspondent à vos horaires réels pour éviter les confusions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Paramètres de livraison
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Rayon de livraison (km)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.delivery_radius_km}
                    onChange={(e) => setSettings({ ...settings, delivery_radius_km: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">km</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Zone couverte autour de votre pharmacie
                </p>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Temps de préparation moyen (min)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.preparation_time_min}
                    onChange={(e) => setSettings({ ...settings, preparation_time_min: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">min</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Temps estimé pour préparer une commande
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-elevated)]">
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                Zone de livraison
              </h4>
              <div className="h-48 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center text-[var(--text-muted)]">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm">Carte interactive</p>
                  <p className="text-xs mt-1">Rayon: {settings.delivery_radius_km} km</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm text-[var(--text-primary)]">
                    SLA de livraison DAWA.ma
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Les commandes doivent être prêtes dans les 30 minutes pour garantir une livraison sous 1h.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Préférences de notification
            </h3>

            <div className="space-y-4">
              {[
                {
                  key: 'new_orders' as const,
                  title: 'Nouvelles commandes',
                  description: 'Recevoir une alerte pour chaque nouvelle commande',
                  icon: '📦',
                },
                {
                  key: 'stock_alerts' as const,
                  title: 'Alertes de stock',
                  description: 'Notification quand un produit atteint le seuil minimum',
                  icon: '⚠️',
                },
                {
                  key: 'prescription_reminders' as const,
                  title: 'Rappels ordonnances',
                  description: 'Alerte pour les ordonnances en attente de vérification',
                  icon: '📋',
                },
                {
                  key: 'daily_reports' as const,
                  title: 'Rapports quotidiens',
                  description: 'Recevoir un résumé par email chaque jour à 20h',
                  icon: '📊',
                },
              ].map((notification) => (
                <div
                  key={notification.key}
                  className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-elevated)]"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{notification.icon}</span>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {notification.title}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[notification.key]}
                      onChange={(e) => updateNotification(notification.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--bg-primary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-elevated)]">
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                Canaux de notification
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Push</p>
                  <p className="text-xs text-[var(--color-verify)]">Activé</p>
                </div>
                <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Email</p>
                  <p className="text-xs text-[var(--text-muted)]">Configurer</p>
                </div>
                <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-[var(--text-primary)]">SMS</p>
                  <p className="text-xs text-[var(--text-muted)]">Configurer</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="font-medium text-[var(--text-primary)] mb-1">
              Conformité DAWA.ma
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Ces paramètres sont utilisés pour la conformité réglementaire et l'expérience patient.
              Le numéro de licence PPB est vérifié par le Conseil National de l'Ordre des Pharmaciens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
