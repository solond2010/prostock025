import { AppSidebar } from './AppSidebar';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-10 xl:px-12">
        <AppSidebar />
        <div className="flex items-center gap-3">
          <img 
            src="/logo.jpg" 
            alt="ProStock Logo" 
            className="h-9 w-9 rounded-full border border-border/50 shadow-sm object-cover"
          />
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground tracking-tight">ProStock</span>
            <span className="text-xs text-muted-foreground hidden sm:block">Gestión de Inventario</span>
          </div>
        </div>
      </div>
    </header>
  );
}
