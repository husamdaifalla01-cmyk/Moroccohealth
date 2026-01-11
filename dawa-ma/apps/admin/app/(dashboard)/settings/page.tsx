'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général', icon: '⚙️' },
    { id: 'fees', label: 'Frais & Commission', icon: '💰' },
    { id: 'zones', label: 'Zones de livraison', icon: '📍' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'compliance', label: 'Conformité', icon: '🔒' },
  ];

  const zones = [
    { name: 'Casablanca Centre', pharmacies: 45, couriers: 23, status: 'active' },
    { name: 'Casablanca Ouest', pharmacies: 32, couriers: 15, status: 'active' },
    { name: 'Casablanca Est', pharmacies: 28, couriers: 12, status: 'active' },
    { name: 'Rabat', pharmacies: 24, couriers: 10, status: 'active' },
    { name: 'Marrakech', pharmacies: 18, couriers: 8, status: 'active' },
    { name: 'Fès', pharmacies: 15, couriers: 6, status: 'active' },
    { name: 'Tanger', pharmacies: 12, couriers: 5, status: 'pending' },
    { name: 'Agadir', pharmacies: 8, couriers: 4, status: 'pending' },
  ];

  const notifications = [
    { id: 'newPharmacy', label: 'Nouvelle inscription pharmacie', description: 'Recevoir une alerte quand une pharmacie s\'inscrit' },
    { id: 'newCourier', label: 'Nouvelle inscription livreur', description: 'Recevoir une alerte quand un livreur s\'inscrit' },
    { id: 'flaggedPrescription', label: 'Ordonnance signalée', description: 'Alerte immédiate pour les ordonnances suspectes' },
    { id: 'lowCouriers', label: 'Manque de livreurs', description: 'Alerte quand une zone manque de livreurs disponibles' },
    { id: 'systemErrors', label: 'Erreurs système', description: 'Notifications des erreurs critiques' },
    { id: 'dailyReport', label: 'Rapport quotidien', description: 'Résumé quotidien des activités de la plateforme' },
  ];

  const retentionPolicies = [
    { type: 'Logs d\'audit', retention: '7 ans', required: true },
    { type: 'Données patients', retention: '5 ans après dernière activité', required: true },
    { type: 'Ordonnances', retention: '10 ans', required: true },
    { type: 'Données de paiement', retention: '10 ans', required: true },
    { type: 'Sessions utilisateur', retention: '90 jours', required: false },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="chart-container">
            <h3 className="section-header">Informations de la plateforme</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Nom de la plateforme
                </label>
                <input className="input" defaultValue="DAWA.ma" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Email support
                </label>
                <input className="input" type="email" defaultValue="support@dawa.ma" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Téléphone support
                </label>
                <input className="input" defaultValue="+212 5 22 XX XX XX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Fuseau horaire
                </label>
                <select className="input">
                  <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                </select>
              </div>
            </div>
            <button className="btn-primary mt-4">Enregistrer</button>
          </div>

          <div className="chart-container">
            <h3 className="section-header">Horaires d'opération</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Heure d'ouverture
                </label>
                <input className="input" type="time" defaultValue="08:00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Heure de fermeture
                </label>
                <input className="input" type="time" defaultValue="23:00" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="allowNight" className="rounded" />
              <label htmlFor="allowNight" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Autoriser les commandes en pharmacie de garde (23h-8h)
              </label>
            </div>
            <button className="btn-primary mt-4">Enregistrer</button>
          </div>
        </div>
      )}

      {/* Fees Settings */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="chart-container">
            <h3 className="section-header">Frais de livraison</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Frais de base (0-3km)
                </label>
                <div className="flex items-center gap-2">
                  <input className="input" type="number" defaultValue="15" />
                  <span style={{ color: 'var(--text-muted)' }}>DH</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Frais par km supplémentaire
                </label>
                <div className="flex items-center gap-2">
                  <input className="input" type="number" defaultValue="3" />
                  <span style={{ color: 'var(--text-muted)' }}>DH/km</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Distance maximale
                </label>
                <div className="flex items-center gap-2">
                  <input className="input" type="number" defaultValue="15" />
                  <span style={{ color: 'var(--text-muted)' }}>km</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Majoration de nuit (23h-8h)
                </label>
                <div className="flex items-center gap-2">
                  <input className="input" type="number" defaultValue="50" />
                  <span style={{ color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Frais livraison express
                </label>
                <div className="flex items-center gap-2">
                  <input className="input" type="number" defaultValue="10" />
                  <span style={{ color: 'var(--text-muted)' }}>DH</span>
                </div>
              </div>
            </div>
            <button className="btn-primary mt-4">Enregistrer</button>
          </div>

          <div className="chart-container">
            <h3 className="section-header">Commission plateforme</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Commission pharmacie
                </label>
                <div className="flex items-center gap-2">
                  <input className="input" type="number" defaultValue="5" />
                  <span style={{ color: 'var(--text-muted)' }}>%</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Prélevée sur chaque commande
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Commission livreur
                </label>
                <div className="flex items-center gap-2">
                  <input className="input" type="number" defaultValue="80" />
                  <span style={{ color: 'var(--text-muted)' }}>%</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Part du livreur sur les frais de livraison
                </p>
              </div>
            </div>
            <button className="btn-primary mt-4">Enregistrer</button>
          </div>
        </div>
      )}

      {/* Delivery Zones */}
      {activeTab === 'zones' && (
        <div className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-header !mb-0">Zones de livraison actives</h3>
            <button className="btn-primary">Ajouter une zone</button>
          </div>
          <div className="space-y-4">
            {zones.map((zone) => (
              <div
                key={zone.name}
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {zone.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {zone.pharmacies} pharmacies • {zone.couriers} livreurs
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`badge ${zone.status === 'active' ? 'badge-verify' : 'badge-warning'}`}
                  >
                    {zone.status === 'active' ? 'Active' : 'En attente'}
                  </span>
                  <button className="btn-secondary text-sm py-1 px-2">Modifier</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="chart-container">
          <h3 className="section-header">Paramètres de notification</h3>
          <div className="space-y-4">
            {notifications.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between py-3 border-b"
                style={{ borderColor: 'var(--border-secondary)' }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {setting.label}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {setting.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div
                    className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style={{
                      background: 'var(--bg-surface)',
                    }}
                  >
                    <style jsx>{`
                      input:checked + div {
                        background: var(--accent-primary) !important;
                      }
                      div::after {
                        background: var(--text-primary);
                      }
                    `}</style>
                  </div>
                </label>
              </div>
            ))}
          </div>
          <button className="btn-primary mt-4">Enregistrer</button>
        </div>
      )}

      {/* Compliance Settings */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div
            className="chart-container"
            style={{ borderColor: 'var(--color-info)', borderWidth: '1px' }}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-medium" style={{ color: 'var(--color-info)' }}>
                  Conformité CNDP (Loi 09-08)
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  DAWA.ma est conforme à la loi 09-08 relative à la protection des données personnelles.
                  Tous les accès aux données sont loggés et conservés pendant 7 ans.
                </p>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h3 className="section-header">Rétention des données</h3>
            <div className="space-y-3">
              {retentionPolicies.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: 'var(--border-secondary)' }}
                >
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.type}
                    </p>
                    {item.required && (
                      <span className="text-xs" style={{ color: 'var(--color-warning)' }}>
                        Requis par la loi
                      </span>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {item.retention}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <h3 className="section-header">Médicaments contrôlés</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Conformément à la loi 17-04 (Code du médicament et de la pharmacie), les stupéfiants et
              psychotropes sont automatiquement bloqués. Cette liste ne peut pas être modifiée.
            </p>
            <div
              className="rounded-lg p-4"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--priority-critical)',
              }}
            >
              <p className="font-medium mb-2" style={{ color: 'var(--priority-critical)' }}>
                Catégories bloquées :
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>• Stupéfiants (Tableau I - Convention de 1961)</li>
                <li>• Psychotropes (Tableaux I-IV - Convention de 1971)</li>
                <li>• Précurseurs chimiques contrôlés</li>
              </ul>
            </div>
            <button className="btn-secondary mt-4 opacity-50 cursor-not-allowed" disabled>
              Modifier (désactivé - requis par la loi)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
