import { AppSidebar } from './AppSidebar';
import { Wallet } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-10 xl:px-12">
        <AppSidebar />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground tracking-tight">Gestión de Finanzas</span>
            <span className="text-xs text-muted-foreground hidden sm:block">Control financiero personal</span>
          </div>
        </div>
      </div>
    </header>
  );
}
