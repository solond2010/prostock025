import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNav } from './BottomNav';
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
        {/* Padding inferior en móvil para que la barra de navegación no tape el contenido */}
        <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      </div>

      {/* Navegación inferior — solo en móvil */}
      <BottomNav />

      {/* Chat IA flotante — visible en todas las páginas */}
      <AIChat />
    </div>
  );
}
