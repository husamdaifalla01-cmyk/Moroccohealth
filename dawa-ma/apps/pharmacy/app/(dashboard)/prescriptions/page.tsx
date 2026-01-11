'use client';

import { useState, useCallback, useEffect } from 'react';

// Types for AI verification
interface AIVerification {
  status: 'pending' | 'verified' | 'flagged' | 'rejected';
  confidence: number;
  extracted_medications: {
    name: string;
    dosage: string;
    quantity: number;
    match_confidence: number;
  }[];
  extracted_entities: {
    doctor_name: string;
    doctor_license: string;
    patient_name: string;
    prescription_date: string;
  };
  drug_interactions: {
    severity: 'low' | 'moderate' | 'high';
    drugs: string[];
    description: string;
  }[];
  compliance_flags: string[];
}

interface Prescription {
  id: string;
  order_id: string;
  patient_name: string;
  uploaded_at: string;
  priority_score: number;
  sla_breach_in_minutes: number;
  ai_verification: AIVerification;
  image_url: string;
}

// Mock prescriptions with AI verification data
const mockPrescriptions: Prescription[] = [
  {
    id: 'RX-001',
    order_id: 'DW-2026-00123',
    patient_name: 'Ahmed Benali',
    uploaded_at: 'Il y a 3 min',
    priority_score: 92,
    sla_breach_in_minutes: 12,
    image_url: '/placeholder-prescription.jpg',
    ai_verification: {
      status: 'verified',
      confidence: 0.94,
      extracted_medications: [
        { name: 'Glucophage 850mg', dosage: '1 comprimé 2x/jour', quantity: 60, match_confidence: 0.98 },
        { name: 'Amlor 5mg', dosage: '1 comprimé/jour', quantity: 30, match_confidence: 0.95 },
        { name: 'Triatec 5mg', dosage: '1 comprimé/jour', quantity: 30, match_confidence: 0.92 },
      ],
      extracted_entities: {
        doctor_name: 'Dr. Karim Fassi',
        doctor_license: 'CNOM-12345',
        patient_name: 'Ahmed Benali',
        prescription_date: '2026-01-10',
      },
      drug_interactions: [
        {
          severity: 'moderate',
          drugs: ['Amlor', 'Triatec'],
          description: 'Risque d\'hypotension - surveillance recommandée',
        },
      ],
      compliance_flags: [],
    },
  },
  {
    id: 'RX-002',
    order_id: 'DW-2026-00125',
    patient_name: 'Fatima Zahra',
    uploaded_at: 'Il y a 8 min',
    priority_score: 78,
    sla_breach_in_minutes: 22,
    image_url: '/placeholder-prescription.jpg',
    ai_verification: {
      status: 'flagged',
      confidence: 0.72,
      extracted_medications: [
        { name: 'Tramadol 50mg', dosage: '1 comprimé 3x/jour', quantity: 30, match_confidence: 0.89 },
        { name: 'Doliprane 1000mg', dosage: '1 comprimé si douleur', quantity: 16, match_confidence: 0.97 },
      ],
      extracted_entities: {
        doctor_name: 'Dr. Nadia Alami',
        doctor_license: 'CNOM-67890',
        patient_name: 'Fatima Zahra',
        prescription_date: '2026-01-09',
      },
      drug_interactions: [],
      compliance_flags: ['Substance contrôlée détectée (Tramadol)', 'Vérification manuelle requise'],
    },
  },
  {
    id: 'RX-003',
    order_id: 'DW-2026-00119',
    patient_name: 'Mohammed Kabbaj',
    uploaded_at: 'Il y a 15 min',
    priority_score: 65,
    sla_breach_in_minutes: 35,
    image_url: '/placeholder-prescription.jpg',
    ai_verification: {
      status: 'pending',
      confidence: 0,
      extracted_medications: [],
      extracted_entities: {
        doctor_name: '',
        doctor_license: '',
        patient_name: '',
        prescription_date: '',
      },
      drug_interactions: [],
      compliance_flags: ['Analyse en cours...'],
    },
  },
  {
    id: 'RX-004',
    order_id: 'DW-2026-00117',
    patient_name: 'Sara Lahlou',
    uploaded_at: 'Il y a 25 min',
    priority_score: 45,
    sla_breach_in_minutes: 55,
    image_url: '/placeholder-prescription.jpg',
    ai_verification: {
      status: 'verified',
      confidence: 0.88,
      extracted_medications: [
        { name: 'Aerius 5mg', dosage: '1 comprimé/jour', quantity: 30, match_confidence: 0.96 },
      ],
      extracted_entities: {
        doctor_name: 'Dr. Hassan Bennani',
        doctor_license: 'CNOM-11111',
        patient_name: 'Sara Lahlou',
        prescription_date: '2026-01-08',
      },
      drug_interactions: [],
      compliance_flags: [],
    },
  },
];

export default function PrescriptionsPage() {
  const [prescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(prescriptions[0] || null);
  const [showInteractionDetails, setShowInteractionDetails] = useState(false);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'j':
          setSelectedIndex((prev) => {
            const newIndex = Math.min(prev + 1, prescriptions.length - 1);
            setSelectedPrescription(prescriptions[newIndex]);
            return newIndex;
          });
          break;
        case 'k':
          setSelectedIndex((prev) => {
            const newIndex = Math.max(prev - 1, 0);
            setSelectedPrescription(prescriptions[newIndex]);
            return newIndex;
          });
          break;
        case 'v':
          if (selectedPrescription) {
            console.log('Verify prescription:', selectedPrescription.id);
          }
          break;
        case 'r':
          if (selectedPrescription) {
            console.log('Reject prescription:', selectedPrescription.id);
          }
          break;
        case 'i':
          setShowInteractionDetails((prev) => !prev);
          break;
        case 'escape':
          setSelectedPrescription(null);
          break;
      }
    },
    [prescriptions, selectedPrescription]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getStatusBadge = (status: AIVerification['status']) => {
    const styles = {
      verified: 'badge-verify',
      flagged: 'badge-warning',
      rejected: 'badge-critical',
      pending: 'badge-pending',
    };
    const labels = {
      verified: 'IA Vérifié',
      flagged: 'Attention',
      rejected: 'Rejeté',
      pending: 'En analyse...',
    };
    return <span className={`badge ${styles[status]}`}>{labels[status]}</span>;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-[var(--color-verify)]';
    if (confidence >= 0.7) return 'text-[var(--color-warning)]';
    return 'text-[var(--priority-critical)]';
  };

  const getSeverityBadge = (severity: 'low' | 'moderate' | 'high') => {
    const styles = {
      low: 'badge-verify',
      moderate: 'badge-warning',
      high: 'badge-critical',
    };
    const labels = {
      low: 'Faible',
      moderate: 'Modéré',
      high: 'Élevé',
    };
    return <span className={`badge ${styles[severity]}`}>{labels[severity]}</span>;
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Prescription Queue */}
      <div className="w-96 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Ordonnances
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {prescriptions.length} en attente de vérification
            </p>
          </div>
          <div className="keyboard-shortcut">
            <span className="kbd">J</span>/<span className="kbd">K</span> naviguer
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {prescriptions.map((prescription, index) => (
            <div
              key={prescription.id}
              className={`queue-item ${selectedIndex === index ? 'queue-item-selected' : ''}`}
              onClick={() => {
                setSelectedIndex(index);
                setSelectedPrescription(prescription);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="priority-badge" style={{
                    background: prescription.priority_score >= 80
                      ? 'var(--priority-critical)'
                      : prescription.priority_score >= 50
                      ? 'var(--priority-high)'
                      : 'var(--priority-medium)'
                  }}>
                    {prescription.priority_score}
                  </span>
                  <span className="font-mono text-sm text-[var(--text-secondary)]">
                    {prescription.id}
                  </span>
                </div>
                {getStatusBadge(prescription.ai_verification.status)}
              </div>

              <p className="font-medium text-[var(--text-primary)] mb-1">
                {prescription.patient_name}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">{prescription.uploaded_at}</span>
                <span className={`font-mono ${
                  prescription.sla_breach_in_minutes <= 15
                    ? 'text-[var(--priority-critical)]'
                    : 'text-[var(--text-muted)]'
                }`}>
                  SLA: {prescription.sla_breach_in_minutes}min
                </span>
              </div>

              {prescription.ai_verification.status === 'verified' && (
                <div className="mt-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--color-verify)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-[var(--color-verify)]">
                    {(prescription.ai_verification.confidence * 100).toFixed(0)}% confiance
                  </span>
                </div>
              )}

              {prescription.ai_verification.compliance_flags.length > 0 && (
                <div className="mt-2">
                  {prescription.ai_verification.compliance_flags.slice(0, 1).map((flag, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--color-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm text-[var(--color-warning)]">{flag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prescription Detail Panel */}
      {selectedPrescription ? (
        <div className="flex-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-semibold text-[var(--text-primary)]">
                  {selectedPrescription.patient_name}
                </h3>
                {getStatusBadge(selectedPrescription.ai_verification.status)}
              </div>
              <p className="text-[var(--text-muted)]">
                Commande {selectedPrescription.order_id} • {selectedPrescription.uploaded_at}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-verify">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Valider <span className="kbd ml-2">V</span>
              </button>
              <button className="btn-reject">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rejeter <span className="kbd ml-2">R</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Prescription Image */}
            <div>
              <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)] p-4 h-80 flex items-center justify-center">
                <div className="text-center text-[var(--text-muted)]">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">Aperçu de l'ordonnance</p>
                  <p className="text-xs mt-1">Cliquez pour agrandir</p>
                </div>
              </div>

              {/* Extracted Entities */}
              <div className="mt-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)] p-4">
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                  Informations extraites
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Médecin</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {selectedPrescription.ai_verification.extracted_entities.doctor_name || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">N° CNOM</span>
                    <span className="font-mono text-[var(--accent-primary)]">
                      {selectedPrescription.ai_verification.extracted_entities.doctor_license || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Patient</span>
                    <span className="text-[var(--text-primary)]">
                      {selectedPrescription.ai_verification.extracted_entities.patient_name || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Date prescription</span>
                    <span className="text-[var(--text-primary)]">
                      {selectedPrescription.ai_verification.extracted_entities.prescription_date || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - AI Analysis */}
            <div className="space-y-4">
              {/* AI Confidence */}
              <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Analyse IA
                  </h4>
                  <span className={`text-2xl font-bold ${getConfidenceColor(selectedPrescription.ai_verification.confidence)}`}>
                    {selectedPrescription.ai_verification.confidence > 0
                      ? `${(selectedPrescription.ai_verification.confidence * 100).toFixed(0)}%`
                      : '—'
                    }
                  </span>
                </div>
                <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--color-verify)] transition-all duration-500"
                    style={{ width: `${selectedPrescription.ai_verification.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Medications List */}
              <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)] p-4">
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                  Médicaments détectés
                </h4>
                {selectedPrescription.ai_verification.extracted_medications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPrescription.ai_verification.extracted_medications.map((med, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{med.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {med.dosage} • Qté: {med.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono text-sm ${getConfidenceColor(med.match_confidence)}`}>
                            {(med.match_confidence * 100).toFixed(0)}%
                          </span>
                          <p className="text-xs text-[var(--text-muted)]">correspondance</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 mx-auto mb-3 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full" />
                    <p className="text-[var(--text-muted)]">Analyse en cours...</p>
                  </div>
                )}
              </div>

              {/* Drug Interactions */}
              {selectedPrescription.ai_verification.drug_interactions.length > 0 && (
                <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--color-warning)] p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowInteractionDetails(!showInteractionDetails)}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[var(--color-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h4 className="text-sm font-semibold text-[var(--color-warning)] uppercase tracking-wider">
                        Interactions médicamenteuses
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-warning">
                        {selectedPrescription.ai_verification.drug_interactions.length}
                      </span>
                      <span className="kbd">I</span>
                    </div>
                  </div>

                  {showInteractionDetails && (
                    <div className="mt-4 space-y-3">
                      {selectedPrescription.ai_verification.drug_interactions.map((interaction, index) => (
                        <div key={index} className="p-3 bg-[var(--bg-primary)] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[var(--text-primary)] font-medium">
                              {interaction.drugs.join(' + ')}
                            </span>
                            {getSeverityBadge(interaction.severity)}
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">
                            {interaction.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Compliance Flags */}
              {selectedPrescription.ai_verification.compliance_flags.length > 0 && (
                <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--priority-critical)] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[var(--priority-critical)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-[var(--priority-critical)] uppercase tracking-wider">
                      Alertes de conformité
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedPrescription.ai_verification.compliance_flags.map((flag, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-[var(--priority-critical)]/10 rounded">
                        <svg className="w-4 h-4 text-[var(--priority-critical)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-[var(--text-primary)]">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="mt-6 p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)]">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <div>
                <p className="font-medium text-[var(--text-primary)] mb-1">
                  Conformité Loi 17-04
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  En tant que pharmacien agréé, vous êtes responsable de la vérification finale de chaque ordonnance.
                  L'IA assiste mais ne remplace pas votre jugement professionnel.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-[var(--text-muted)]">
              Sélectionnez une ordonnance pour voir les détails
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Utilisez <span className="kbd">J</span> / <span className="kbd">K</span> pour naviguer
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
