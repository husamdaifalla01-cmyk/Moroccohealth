import { BottomNav } from '@/components/bottom-nav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
