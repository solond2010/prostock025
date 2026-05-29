import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Target, GitCommitHorizontal } from 'lucide-react';

const ITEMS = [
  { title: 'Inicio', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Stock', url: '/', icon: Package },
  { title: 'Directo', url: '/ofertas', icon: Target },
  { title: 'Pipeline', url: '/pipeline', icon: GitCommitHorizontal },
];

/**
 * Barra de navegación inferior fija — solo en móvil (oculta en lg+).
 * Da acceso de un toque a las 4 secciones más usadas, como una app nativa.
 * El resto de secciones siguen en el menú hamburguesa del header.
 */
export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 pb-safe">
      <div className="grid grid-cols-4 h-16">
        {ITEMS.map(({ title, url, icon: Icon }) => (
          <NavLink
            key={url}
            to={url}
            end={url === '/'}
            className="relative flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors active:scale-95"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute top-0 h-0.5 w-10 rounded-full"
                    style={{ background: 'hsl(262,73%,55%)' }}
                  />
                )}
                <Icon
                  className="h-[22px] w-[22px] transition-colors"
                  style={isActive ? { color: 'hsl(262,73%,55%)' } : undefined}
                />
                <span
                  className="text-[10px] font-medium leading-none transition-colors"
                  style={isActive ? { color: 'hsl(262,73%,55%)' } : undefined}
                >
                  {title}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
