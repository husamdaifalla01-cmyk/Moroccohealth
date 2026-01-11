'use client';

import { useState } from 'react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  remaining: number;
  totalDays: number;
  lastRefill: string;
  nextRefill: string;
  isChronic: boolean;
}

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Glucophage',
    dosage: '850mg',
    frequency: '2x par jour',
    remaining: 12,
    totalDays: 30,
    lastRefill: '15 Dec 2025',
    nextRefill: '12 Jan 2026',
    isChronic: true,
  },
  {
    id: '2',
    name: 'Amlor',
    dosage: '5mg',
    frequency: '1x par jour',
    remaining: 18,
    totalDays: 30,
    lastRefill: '20 Dec 2025',
    nextRefill: '17 Jan 2026',
    isChronic: true,
  },
  {
    id: '3',
    name: 'Lipitor',
    dosage: '20mg',
    frequency: '1x par jour',
    remaining: 8,
    totalDays: 30,
    lastRefill: '05 Jan 2026',
    nextRefill: '02 Feb 2026',
    isChronic: true,
  },
  {
    id: '4',
    name: 'Doliprane',
    dosage: '1000mg',
    frequency: 'Si besoin',
    remaining: 6,
    totalDays: 10,
    lastRefill: '10 Jan 2026',
    nextRefill: '-',
    isChronic: false,
  },
];

export default function MedicationsPage() {
  const [medications] = useState<Medication[]>(mockMedications);
  const [selectedMed, setSelectedMed] = useState<string | null>(null);

  const chronicMeds = medications.filter((m) => m.isChronic);
  const otherMeds = medications.filter((m) => !m.isChronic);

  const getProgressColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 40) return 'bg-amber-500';
    return 'bg-[var(--brand-primary)]';
  };

  const MedicationCard = ({ med }: { med: Medication }) => (
    <div
      className="card p-4 cursor-pointer"
      onClick={() => setSelectedMed(selectedMed === med.id ? null : med.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">{med.name}</h3>
          <p className="text-sm text-[var(--text-muted)]">{med.dosage} - {med.frequency}</p>
        </div>
        {med.remaining <= med.totalDays * 0.2 && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600">
            Bientot epuise
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[var(--text-muted)]">Restant</span>
          <span className="font-medium text-[var(--text-secondary)]">{med.remaining} jours</span>
        </div>
        <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(med.remaining, med.totalDays)}`}
            style={{ width: `${(med.remaining / med.totalDays) * 100}%` }}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {selectedMed === med.id && (
        <div className="pt-3 border-t border-[var(--border-primary)] space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Dernier renouvellement</span>
            <span className="text-[var(--text-secondary)]">{med.lastRefill}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Prochain renouvellement</span>
            <span className="font-medium text-[var(--brand-primary)]">{med.nextRefill}</span>
          </div>
          <button className="btn-secondary w-full mt-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Renouveler maintenant
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Mes Medicaments</h1>
        <button className="p-2 rounded-full bg-[var(--bg-surface)]">
          <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Adherence Summary */}
        <div className="card p-4 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Score d'observance</p>
              <p className="text-3xl font-bold text-white">87%</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white/80 text-sm mt-2">Excellent! Continuez ainsi</p>
        </div>

        {/* Chronic Medications */}
        {chronicMeds.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Traitements Chroniques
              </h2>
            </div>
            <div className="space-y-3">
              {chronicMeds.map((med) => (
                <MedicationCard key={med.id} med={med} />
              ))}
            </div>
          </div>
        )}

        {/* Other Medications */}
        {otherMeds.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Autres Medicaments
            </h2>
            <div className="space-y-3">
              {otherMeds.map((med) => (
                <MedicationCard key={med.id} med={med} />
              ))}
            </div>
          </div>
        )}

        {/* Reminder Setup CTA */}
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-light)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)]">Rappels de prise</p>
              <p className="text-sm text-[var(--text-muted)]">Configurez des alertes pour ne jamais oublier</p>
            </div>
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
