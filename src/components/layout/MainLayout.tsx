import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { DesktopSidebar } from './DesktopSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar fijo — solo en desktop (lg+) */}
      <DesktopSidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header con hamburger — solo en móvil */}
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
