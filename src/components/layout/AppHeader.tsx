import { AppSidebar } from './AppSidebar';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <AppSidebar />
        <span className="text-sm font-medium text-muted-foreground">Gestión de Inventario</span>
      </div>
    </header>
  );
}
