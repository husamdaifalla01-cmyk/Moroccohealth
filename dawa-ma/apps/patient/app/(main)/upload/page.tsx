'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// AI Analysis states
type AnalysisState = 'idle' | 'capturing' | 'analyzing' | 'success' | 'warning' | 'error';

interface AnalysisResult {
  quality_score: number;
  lighting_ok: boolean;
  focus_ok: boolean;
  angle_ok: boolean;
  zones_detected: {
    header: boolean;
    medication: boolean;
    dosage: boolean;
    signature: boolean;
    date: boolean;
  };
  issues: string[];
  guidance: string;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<AnalysisState>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      // Fallback to file upload
      fileInputRef.current?.click();
    }
  };

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        setState('capturing');
        stopCamera();
        analyzeImage(imageData);
      }
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        setState('capturing');
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate AI analysis (in production, this would call the AI verification API)
  const analyzeImage = async (imageData: string) => {
    setState('analyzing');

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock analysis result - in production this would come from the AI service
    const mockResult: AnalysisResult = {
      quality_score: 0.87,
      lighting_ok: true,
      focus_ok: true,
      angle_ok: true,
      zones_detected: {
        header: true,
        medication: true,
        dosage: true,
        signature: true,
        date: true,
      },
      issues: [],
      guidance: 'L\'image est de bonne qualite. Vous pouvez continuer.',
    };

    setAnalysisResult(mockResult);
    setState(mockResult.quality_score >= 0.7 ? 'success' : 'warning');
  };

  // Submit prescription
  const submitPrescription = () => {
    // In production, this would upload the image and create the prescription
    router.push('/orders/new');
  };

  // Retry capture
  const retryCapture = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setState('idle');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--bg-elevated)] border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Scanner l'ordonnance
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-4">
        {/* Camera View */}
        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera overlay guides */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[90%] max-w-sm aspect-[3/4]">
                {/* Corner guides */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-white rounded-br-lg" />
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute top-safe-area left-0 right-0 p-4">
              <p className="text-center text-white text-sm bg-black/50 rounded-lg py-2 px-4">
                Alignez l'ordonnance dans le cadre
              </p>
            </div>

            {/* Controls */}
            <div className="absolute bottom-safe-area left-0 right-0 p-6 flex items-center justify-between">
              <button
                onClick={stopCamera}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white border-4 border-white/50 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Initial State - Upload Options */}
        {state === 'idle' && !showCamera && (
          <div className="space-y-6">
            {/* Camera Option */}
            <button
              onClick={startCamera}
              className="w-full p-6 bg-[var(--bg-surface)] rounded-2xl border-2 border-dashed border-[var(--border-primary)] flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--brand-light)] flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  Prendre une photo
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Utilisez votre camera pour scanner l'ordonnance
                </p>
              </div>
            </button>

            {/* Gallery Option */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-primary)] flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                <svg className="w-7 h-7 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-[var(--text-primary)]">
                  Choisir depuis la galerie
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Selectionnez une image existante
                </p>
              </div>
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Tips */}
            <div className="bg-[var(--bg-surface)] rounded-xl p-4">
              <p className="font-semibold text-[var(--text-primary)] mb-3">
                Conseils pour une bonne photo
              </p>
              <ul className="space-y-2">
                {[
                  'Assurez un bon eclairage, evitez les ombres',
                  'Placez l\'ordonnance a plat sur une surface claire',
                  'Cadrez toute l\'ordonnance dans l\'image',
                  'Evitez les reflets et la lumiere directe',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {state === 'analyzing' && capturedImage && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-surface)]">
              <img src={capturedImage} alt="Ordonnance" className="w-full" />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-white font-medium">Analyse en cours...</p>
                <p className="text-white/70 text-sm mt-1">Verification de la qualite</p>
              </div>
            </div>

            {/* Analysis Steps */}
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 space-y-3">
              {[
                { label: 'Verification de la luminosite', done: true },
                { label: 'Detection du texte', done: true },
                { label: 'Extraction des informations', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.done ? (
                    <svg className="w-5 h-5 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <div className="w-5 h-5 border-2 border-[var(--border-primary)] rounded-full animate-pulse" />
                  )}
                  <span className={step.done ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && capturedImage && analysisResult && (
          <div className="space-y-6">
            {/* Preview with success overlay */}
            <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-surface)]">
              <img src={capturedImage} alt="Ordonnance" className="w-full" />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Qualite OK
              </div>
            </div>

            {/* Quality Score */}
            <div className="bg-[var(--bg-surface)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-[var(--text-primary)]">Score de qualite</span>
                <span className="text-2xl font-bold text-green-500">
                  {Math.round(analysisResult.quality_score * 100)}%
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${analysisResult.quality_score * 100}%` }}
                />
              </div>
            </div>

            {/* Detected Zones */}
            <div className="bg-[var(--bg-surface)] rounded-xl p-4">
              <p className="font-semibold text-[var(--text-primary)] mb-3">Zones detectees</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'header', label: 'En-tete medecin', detected: analysisResult.zones_detected.header },
                  { key: 'medication', label: 'Medicaments', detected: analysisResult.zones_detected.medication },
                  { key: 'dosage', label: 'Posologie', detected: analysisResult.zones_detected.dosage },
                  { key: 'signature', label: 'Signature', detected: analysisResult.zones_detected.signature },
                  { key: 'date', label: 'Date', detected: analysisResult.zones_detected.date },
                ].map((zone) => (
                  <div
                    key={zone.key}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      zone.detected ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    {zone.detected ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`text-sm ${zone.detected ? 'text-green-600' : 'text-red-600'}`}>
                      {zone.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={submitPrescription}
                className="w-full py-4 bg-[var(--brand-primary)] text-white font-semibold rounded-xl"
              >
                Continuer
              </button>
              <button
                onClick={retryCapture}
                className="w-full py-4 bg-[var(--bg-surface)] text-[var(--text-secondary)] font-medium rounded-xl border border-[var(--border-primary)]"
              >
                Reprendre la photo
              </button>
            </div>
          </div>
        )}

        {/* Warning State */}
        {state === 'warning' && capturedImage && analysisResult && (
          <div className="space-y-6">
            {/* Preview with warning overlay */}
            <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-surface)]">
              <img src={capturedImage} alt="Ordonnance" className="w-full" />
              <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Qualite moyenne
              </div>
            </div>

            {/* Issues */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-200">
                    Image de qualite moyenne
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {analysisResult.guidance}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={retryCapture}
                className="w-full py-4 bg-[var(--brand-primary)] text-white font-semibold rounded-xl"
              >
                Reprendre la photo
              </button>
              <button
                onClick={submitPrescription}
                className="w-full py-4 bg-[var(--bg-surface)] text-[var(--text-secondary)] font-medium rounded-xl border border-[var(--border-primary)]"
              >
                Continuer quand meme
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
