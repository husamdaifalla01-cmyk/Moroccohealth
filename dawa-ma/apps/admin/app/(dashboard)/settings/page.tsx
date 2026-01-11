'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général', icon: '⚙️' },
    { id: 'fees', label: 'Frais & Commission', icon: '💰' },
    { id: 'zones', label: 'Zones de livraison', icon: '📍' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'compliance', label: 'Conformité', icon: '🔒' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la plateforme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Nom de la plateforme</Label>
                  <Input id="platformName" defaultValue="DAWA.ma" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email support</Label>
                  <Input id="supportEmail" type="email" defaultValue="support@dawa.ma" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Téléphone support</Label>
                  <Input id="supportPhone" defaultValue="+212 5 22 XX XX XX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <select id="timezone" className="w-full px-3 py-2 border rounded-lg">
                    <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                  </select>
                </div>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">Enregistrer</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horaires d'opération</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heure d'ouverture</Label>
                  <Input type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label>Heure de fermeture</Label>
                  <Input type="time" defaultValue="23:00" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="allowNight" className="rounded" />
                <Label htmlFor="allowNight" className="text-sm">
                  Autoriser les commandes en pharmacie de garde (23h-8h)
                </Label>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">Enregistrer</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fees Settings */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frais de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Frais de base (0-3km)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="15" />
                    <span className="text-gray-500">DH</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Frais par km supplémentaire</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="3" />
                    <span className="text-gray-500">DH/km</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Distance maximale</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="15" />
                    <span className="text-gray-500">km</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Majoration de nuit (23h-8h)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="50" />
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Frais livraison express</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="10" />
                    <span className="text-gray-500">DH</span>
                  </div>
                </div>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">Enregistrer</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commission plateforme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Commission pharmacie</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="5" />
                    <span className="text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500">Prélevée sur chaque commande</p>
                </div>
                <div className="space-y-2">
                  <Label>Commission livreur</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="80" />
                    <span className="text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500">Part du livreur sur les frais de livraison</p>
                </div>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">Enregistrer</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delivery Zones */}
      {activeTab === 'zones' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Zones de livraison actives</CardTitle>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Ajouter une zone</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Casablanca Centre', pharmacies: 45, couriers: 23, status: 'active' },
                { name: 'Casablanca Ouest', pharmacies: 32, couriers: 15, status: 'active' },
                { name: 'Casablanca Est', pharmacies: 28, couriers: 12, status: 'active' },
                { name: 'Rabat', pharmacies: 24, couriers: 10, status: 'active' },
                { name: 'Marrakech', pharmacies: 18, couriers: 8, status: 'active' },
                { name: 'Fès', pharmacies: 15, couriers: 6, status: 'active' },
                { name: 'Tanger', pharmacies: 12, couriers: 5, status: 'pending' },
                { name: 'Agadir', pharmacies: 8, couriers: 4, status: 'pending' },
              ].map((zone) => (
                <div
                  key={zone.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{zone.name}</p>
                    <p className="text-sm text-gray-500">
                      {zone.pharmacies} pharmacies • {zone.couriers} livreurs
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        zone.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {zone.status === 'active' ? 'Active' : 'En attente'}
                    </span>
                    <Button variant="ghost" size="sm">Modifier</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { id: 'newPharmacy', label: 'Nouvelle inscription pharmacie', description: 'Recevoir une alerte quand une pharmacie s\'inscrit' },
              { id: 'newCourier', label: 'Nouvelle inscription livreur', description: 'Recevoir une alerte quand un livreur s\'inscrit' },
              { id: 'flaggedPrescription', label: 'Ordonnance signalée', description: 'Alerte immédiate pour les ordonnances suspectes' },
              { id: 'lowCouriers', label: 'Manque de livreurs', description: 'Alerte quand une zone manque de livreurs disponibles' },
              { id: 'systemErrors', label: 'Erreurs système', description: 'Notifications des erreurs critiques' },
              { id: 'dailyReport', label: 'Rapport quotidien', description: 'Résumé quotidien des activités de la plateforme' },
            ].map((setting) => (
              <div key={setting.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{setting.label}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
            <Button className="bg-indigo-600 hover:bg-indigo-700">Enregistrer</Button>
          </CardContent>
        </Card>
      )}

      {/* Compliance Settings */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="font-medium text-blue-900">Conformité CNDP (Loi 09-08)</p>
                  <p className="text-sm text-blue-700 mt-1">
                    DAWA.ma est conforme à la loi 09-08 relative à la protection des données personnelles.
                    Tous les accès aux données sont loggés et conservés pendant 7 ans.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rétention des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  { type: 'Logs d\'audit', retention: '7 ans', required: true },
                  { type: 'Données patients', retention: '5 ans après dernière activité', required: true },
                  { type: 'Ordonnances', retention: '10 ans', required: true },
                  { type: 'Données de paiement', retention: '10 ans', required: true },
                  { type: 'Sessions utilisateur', retention: '90 jours', required: false },
                ].map((item) => (
                  <div key={item.type} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{item.type}</p>
                      {item.required && (
                        <span className="text-xs text-orange-600">Requis par la loi</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{item.retention}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Médicaments contrôlés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Conformément à la loi 17-04 (Code du médicament et de la pharmacie), les stupéfiants et
                  psychotropes sont automatiquement bloqués. Cette liste ne peut pas être modifiée.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-medium text-red-800 mb-2">Catégories bloquées :</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Stupéfiants (Tableau I - Convention de 1961)</li>
                    <li>• Psychotropes (Tableaux I-IV - Convention de 1971)</li>
                    <li>• Précurseurs chimiques contrôlés</li>
                  </ul>
                </div>
                <Button variant="outline" disabled>
                  Modifier (désactivé - requis par la loi)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
