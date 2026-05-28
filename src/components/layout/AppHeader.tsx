import { AppSidebar } from './AppSidebar';
import { Package } from 'lucide-react';

export function AppHeader() {
  return (
    // Solo visible en móvil — en desktop el sidebar fijo lo reemplaza
    <header className="lg:hidden sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center gap-3 px-4">
        <AppSidebar />
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <span className="text-base font-bold tracking-tight">ProStock</span>
        </div>
      </div>
    </header>
  );
}
