'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-[var(--brand-primary)] rounded-2xl flex items-center justify-center">
          <span className="text-white text-3xl font-bold">D</span>
        </div>
        <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
