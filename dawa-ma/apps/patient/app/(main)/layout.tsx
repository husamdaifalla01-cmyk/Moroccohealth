import { BottomNav } from '@/components/bottom-nav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <main className="safe-area-bottom">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
