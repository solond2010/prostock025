import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { AIChat } from '@/components/AIChat';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-dvh bg-background flex">
      {/* Sidebar fijo — solo en desktop (lg+) */}
      <DesktopSidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header con hamburger — solo en móvil */}
        <AppHeader />
        <main className="flex-1 pb-safe">{children}</main>
      </div>

      {/* Chat IA flotante — visible en todas las páginas */}
      <AIChat />
    </div>
  );
}
