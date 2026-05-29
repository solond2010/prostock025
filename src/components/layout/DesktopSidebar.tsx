import {
  Receipt, PieChart, BarChart3, LogOut, Moon, Sun, Wallet, Wrench,
  Target, CheckCircle2, Calendar, Bot, LayoutDashboard, GitCommitHorizontal,
  Package, Zap, ChevronRight
} from 'lucide-react';
import { useBotStatus, isBotOnline } from '@/hooks/useBotStatus';
import { NavLink } from '@/components/NavLink';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const menuSections = [
  {
    label: 'GESTIÓN',
    items: [
      { title: 'Dashboard',         url: '/dashboard',           icon: LayoutDashboard },
      { title: 'Gestor de Stock',   url: '/',                    icon: Package },
      { title: 'Gráficos Anuales',  url: '/graficos',            icon: BarChart3 },
      { title: 'Gasto en Material', url: '/gasto-material',      icon: Receipt },
      { title: 'Estadísticas',      url: '/estadisticas',        icon: PieChart },
      { title: 'Finanzas',          url: '/finanzas-personales', icon: Wallet },
      { title: 'Inventario Piezas', url: '/inventario-piezas',   icon: Wrench },
    ],
  },
  {
    label: 'DIRECTO',
    items: [
      { title: 'En directo', url: '/ofertas',  icon: Target,              badge: 'DIRECTO' },
      { title: 'Pipeline',   url: '/pipeline', icon: GitCommitHorizontal, badge: 'NUEVO' },
      { title: 'Tareas',     url: '/tareas',   icon: CheckCircle2,        badge: 'NUEVO' },
      { title: 'Agenda',     url: '/agenda',   icon: Calendar,            badge: 'NUEVO' },
    ],
  },
];

const BADGE_STYLES: Record<string, string> = {
  DIRECTO: 'bg-destructive/15 text-destructive border border-destructive/30',
  NUEVO:   'bg-primary/12 text-primary border border-primary/20',
};

export function DesktopSidebar() {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { status } = useBotStatus();
  const botOnline = isBotOnline(status);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: 'Error', description: 'No se pudo cerrar la sesión', variant: 'destructive' });
    } else {
      toast({ title: 'Sesión cerrada' });
      navigate('/auth');
    }
  };

  // Initials from email
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  const navBase = [
    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium',
    'text-muted-foreground/65 transition-all duration-150',
    'hover:bg-[hsl(var(--sidebar-accent))] hover:text-foreground',
  ].join(' ');

  const navActive = [
    'bg-primary/12 text-primary font-semibold',
    'hover:bg-primary/16 hover:text-primary',
    'shadow-[inset_3px_0_0_hsl(var(--primary)),0_0_0_1px_hsl(var(--primary)/0.15)]',
  ].join(' ');

  return (
    <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col min-h-dvh sticky top-0 h-dvh overflow-y-auto pt-safe pl-safe bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]">

      {/* ── Brand ── */}
      <div className="px-4 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))',
              boxShadow: '0 3px 10px -2px hsl(262 73% 55% / 0.5)',
            }}
          >
            <Zap className="h-5 w-5 text-white relative z-10" fill="white" strokeWidth={0} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 55%)' }} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none tracking-tight">Flipr</p>
            <p className="text-[10px] text-muted-foreground/45 mt-0.5 font-medium">Panel de ventas</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex flex-col gap-4 p-2.5 flex-1 pt-3">
        {menuSections.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-bold tracking-[0.12em] text-muted-foreground/30 px-3 mb-1 uppercase">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className={navBase}
                  activeClassName={navActive}
                >
                  <item.icon className="h-[15px] w-[15px] shrink-0" />
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[8px] font-bold leading-none ${BADGE_STYLES[item.badge] ?? 'bg-muted text-muted-foreground'}`}>
                      {item.badge === 'DIRECTO' && <span className="mr-0.5 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse inline-block" />}
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* ── Sistema ── */}
        <div>
          <p className="text-[9px] font-bold tracking-[0.12em] text-muted-foreground/30 px-3 mb-1 uppercase">
            SISTEMA
          </p>
          <NavLink to="/bot" className={navBase} activeClassName={navActive}>
            <Bot className="h-[15px] w-[15px] shrink-0" />
            <span className="flex-1">Panel del Bot</span>
            <span className="flex items-center gap-1">
              {botOnline
                ? <span className="status-dot-online" />
                : <span className="h-2 w-2 rounded-full bg-muted-foreground/25" />}
              <span className={`text-[9px] font-bold ${botOnline ? 'text-success' : 'text-muted-foreground/35'}`}>
                {botOnline ? 'ON' : 'OFF'}
              </span>
            </span>
          </NavLink>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="p-2.5 space-y-0.5 border-t border-[hsl(var(--sidebar-border))]">
        <button
          onClick={toggleTheme}
          className={navBase + ' w-full'}
        >
          {theme === 'light'
            ? <><Moon className="h-[15px] w-[15px]" /><span>Modo oscuro</span></>
            : <><Sun className="h-[15px] w-[15px]" /><span>Modo claro</span></>
          }
        </button>

        {user && (
          <>
            <Separator className="my-2 bg-[hsl(var(--sidebar-border))]" />
            {/* User chip */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-[10px] font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}
              >
                {initials}
              </div>
              <p className="text-[10px] text-muted-foreground/50 truncate font-medium flex-1">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-destructive/60 transition-all duration-150 hover:bg-destructive/8 hover:text-destructive"
            >
              <LogOut className="h-[15px] w-[15px]" />
              <span>Cerrar sesión</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
