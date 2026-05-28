import { AppSidebar } from './AppSidebar';
import { Zap } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 pt-safe">
      <div className="flex h-14 items-center gap-3 px-4">
        <AppSidebar />
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}>
            <Zap className="h-4 w-4 text-white" fill="white" strokeWidth={0} />
          </div>
          <span className="text-base font-bold tracking-tight">Flipr</span>
        </div>
      </div>
    </header>
  );
}
