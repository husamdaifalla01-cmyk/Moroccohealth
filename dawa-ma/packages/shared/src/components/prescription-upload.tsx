/**
 * DAWA.ma V10 - Prescription Upload Component
 * Pre-upload image analysis with real-time feedback
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { PreUploadAnalysis, DetectedZones } from '../ai-verification/types';
import {
  generateGuidanceMessage,
  shouldApproveUpload,
  formatConfidence,
  getConfidenceColorClass,
  createMockPreUploadAnalysis,
} from '../ai-verification/analyzer';

interface PrescriptionUploadProps {
  onUpload: (file: File, analysis: PreUploadAnalysis) => void;
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (analysis: PreUploadAnalysis) => void;
  disabled?: boolean;
  className?: string;
}

type UploadState = 'idle' | 'capturing' | 'analyzing' | 'reviewed' | 'uploading';

interface AnalysisResultProps {
  analysis: PreUploadAnalysis;
  onRetake: () => void;
  onConfirm: () => void;
}

/**
 * Analysis Score Ring Component
 */
function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);

  const getScoreColor = (s: number) => {
    if (s >= 0.9) return 'var(--color-verify)';
    if (s >= 0.7) return 'var(--color-warning)';
    return 'var(--priority-critical)';
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--bg-surface)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: '25px' }}>
        <span className="text-2xl font-bold" style={{ color: getScoreColor(score) }}>
          {Math.round(score * 100)}%
        </span>
      </div>
      <span className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

/**
 * Zone Detection Indicator
 */
function ZoneIndicator({ zones }: { zones: DetectedZones }) {
  const zoneLabels: Record<keyof DetectedZones, string> = {
    header_visible: 'En-tête',
    patient_visible: 'Patient',
    medication_visible: 'Médicament',
    dosage_visible: 'Posologie',
    signature_visible: 'Signature',
    date_visible: 'Date',
  };

  const requiredZones: (keyof DetectedZones)[] = ['medication_visible', 'dosage_visible', 'signature_visible'];

  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.entries(zones) as [keyof DetectedZones, boolean][]).map(([zone, detected]) => {
        const isRequired = requiredZones.includes(zone);
        return (
          <div
            key={zone}
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{
              background: detected ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${detected ? 'var(--color-verify)' : 'var(--priority-critical)'}`,
            }}
          >
            <span className="text-sm">{detected ? '✓' : '✗'}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {zoneLabels[zone]}
              {isRequired && <span style={{ color: 'var(--priority-critical)' }}> *</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Analysis Result Display
 */
function AnalysisResult({ analysis, onRetake, onConfirm }: AnalysisResultProps) {
  const { approved, reasons } = shouldApproveUpload(analysis);
  const guidanceMessage = generateGuidanceMessage(reasons);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex justify-center gap-8">
        <div className="relative">
          <ScoreRing score={analysis.lighting_score} label="Éclairage" />
        </div>
        <div className="relative">
          <ScoreRing score={analysis.focus_score} label="Netteté" />
        </div>
        <div className="relative">
          <ScoreRing score={analysis.completeness_score} label="Complétude" />
        </div>
      </div>

      {/* Zone Detection */}
      <div>
        <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Zones détectées
        </h4>
        <ZoneIndicator zones={analysis.detected_zones} />
      </div>

      {/* Guidance Message */}
      {!approved && (
        <div
          className="p-4 rounded-lg"
          style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid var(--color-warning)',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium" style={{ color: 'var(--color-warning)' }}>
                Conseils pour améliorer l'image
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {guidanceMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approval Status */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: approved ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${approved ? 'var(--color-verify)' : 'var(--priority-critical)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{approved ? '✓' : '⚠️'}</span>
          <div>
            <p
              className="font-medium"
              style={{ color: approved ? 'var(--color-verify)' : 'var(--priority-critical)' }}
            >
              {approved ? 'Image prête pour l\'envoi' : 'Image non conforme'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {approved
                ? 'L\'ordonnance sera vérifiée par un pharmacien'
                : 'Veuillez reprendre une photo en suivant les conseils ci-dessus'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onRetake}
          className="flex-1 py-3 rounded-lg font-medium transition-all"
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          Reprendre
        </button>
        <button
          onClick={onConfirm}
          disabled={!approved}
          className="flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: approved ? 'var(--accent-primary)' : 'var(--bg-surface)',
            color: 'white',
          }}
        >
          {approved ? 'Confirmer et envoyer' : 'Image non valide'}
        </button>
      </div>
    </div>
  );
}

/**
 * Main Prescription Upload Component
 */
export function PrescriptionUpload({
  onUpload,
  onAnalysisStart,
  onAnalysisComplete,
  disabled = false,
  className = '',
}: PrescriptionUploadProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PreUploadAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Simulate image analysis (in production, this would call the actual analysis API)
   */
  const analyzeImage = useCallback(async (file: File): Promise<PreUploadAnalysis> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo purposes, return mock analysis with some randomness
    const baseScore = 0.7 + Math.random() * 0.3;
    return createMockPreUploadAnalysis({
      lighting_score: baseScore * (0.9 + Math.random() * 0.1),
      focus_score: baseScore * (0.85 + Math.random() * 0.15),
      completeness_score: baseScore * (0.9 + Math.random() * 0.1),
      angle_score: 0.85 + Math.random() * 0.15,
      detected_zones: {
        header_visible: Math.random() > 0.2,
        patient_visible: Math.random() > 0.3,
        medication_visible: Math.random() > 0.1,
        dosage_visible: Math.random() > 0.1,
        signature_visible: Math.random() > 0.15,
        date_visible: Math.random() > 0.2,
      },
    });
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setState('analyzing');
      onAnalysisStart?.();

      try {
        const result = await analyzeImage(file);
        setAnalysis(result);
        setState('reviewed');
        onAnalysisComplete?.(result);
      } catch (error) {
        console.error('Analysis failed:', error);
        setState('idle');
      }
    },
    [analyzeImage, onAnalysisStart, onAnalysisComplete]
  );

  const handleRetake = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedFile && analysis) {
      setState('uploading');
      onUpload(selectedFile, analysis);
    }
  }, [selectedFile, analysis, onUpload]);

  const handleCaptureClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`prescription-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Idle State - Upload Area */}
      {state === 'idle' && (
        <div
          onClick={handleCaptureClick}
          className="cursor-pointer p-8 rounded-xl transition-all hover:opacity-90"
          style={{
            background: 'var(--bg-elevated)',
            border: '2px dashed var(--border-primary)',
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-surface)' }}
            >
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Ajouter une ordonnance
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Prenez une photo ou sélectionnez un fichier
            </p>
            <div className="flex gap-4">
              <button
                className="px-6 py-2 rounded-lg font-medium"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                }}
              >
                📷 Prendre une photo
              </button>
              <button
                className="px-6 py-2 rounded-lg font-medium"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                📁 Choisir un fichier
              </button>
            </div>

            {/* Tips */}
            <div className="mt-6 pt-6 border-t w-full" style={{ borderColor: 'var(--border-primary)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                Conseils pour une bonne capture :
              </p>
              <div className="grid grid-cols-3 gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <span>💡</span>
                  <span>Bon éclairage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📐</span>
                  <span>Photo droite</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔍</span>
                  <span>Texte lisible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {state === 'analyzing' && (
        <div
          className="p-8 rounded-xl"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="flex flex-col items-center">
            {/* Preview Image */}
            {previewUrl && (
              <div className="w-full max-w-md mb-6 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Aperçu de l'ordonnance"
                  className="w-full h-auto opacity-50"
                />
              </div>
            )}

            {/* Loading Animation */}
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-4"
                style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
              />
              <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Analyse en cours...
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Vérification de la qualité de l'image
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review State */}
      {state === 'reviewed' && analysis && (
        <div
          className="p-6 rounded-xl"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
          }}
        >
          {/* Preview Image */}
          {previewUrl && (
            <div className="w-full max-w-md mx-auto mb-6 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Aperçu de l'ordonnance"
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Analysis Results */}
          <AnalysisResult
            analysis={analysis}
            onRetake={handleRetake}
            onConfirm={handleConfirm}
          />
        </div>
      )}

      {/* Uploading State */}
      {state === 'uploading' && (
        <div
          className="p-8 rounded-xl"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-4"
              style={{ borderColor: 'var(--color-verify)', borderTopColor: 'transparent' }}
            />
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Envoi en cours...
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              L'ordonnance sera vérifiée par un pharmacien
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionUpload;
