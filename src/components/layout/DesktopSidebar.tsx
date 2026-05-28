import { Receipt, PieChart, BarChart3, LogOut, Moon, Sun, Wallet, Wrench, Target, CheckCircle2, Calendar, Bot, LayoutDashboard, GitCommitHorizontal, Package, Zap } from 'lucide-react';
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
    label: 'LIVE',
    items: [
      { title: 'En directo', url: '/ofertas',  icon: Target,              badge: 'LIVE' },
      { title: 'Pipeline',   url: '/pipeline', icon: GitCommitHorizontal, badge: 'NEW' },
      { title: 'Tareas',     url: '/tareas',   icon: CheckCircle2,        badge: 'NEW' },
      { title: 'Agenda',     url: '/agenda',   icon: Calendar,            badge: 'NEW' },
    ],
  },
];

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

  const navBase = 'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[11.5px] font-medium text-muted-foreground/70 transition-all duration-150 hover:bg-secondary hover:text-foreground';
  const navActive = 'bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_2px_8px_-2px_hsl(var(--primary)/0.2)]';

  return (
    <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col min-h-dvh sticky top-0 h-dvh overflow-y-auto pt-safe pl-safe bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]">

      {/* ── Brand ── */}
      <div className="px-4 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3">
          {/* Gradient logo */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}>
            <Zap className="h-5 w-5 text-white" fill="white" strokeWidth={0} />
            <div className="absolute inset-0 rounded-xl"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)' }} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none tracking-tight text-foreground">Flipr</p>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-medium">Panel de ventas</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex flex-col gap-5 p-3 flex-1">
        {menuSections.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground/35 px-2 mb-1.5 uppercase">
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
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.badge && (
                    <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[8px] font-bold bg-primary/12 text-primary">
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
          <p className="text-[9px] font-bold tracking-widest text-muted-foreground/35 px-2 mb-1.5 uppercase">
            SISTEMA
          </p>
          <NavLink to="/bot" className={navBase} activeClassName={navActive}>
            <Bot className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">Panel del Bot</span>
            <span className={`flex items-center gap-1 text-[9px] font-bold ${botOnline ? 'text-success' : 'text-muted-foreground/40'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${botOnline ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
              {botOnline ? 'ON' : 'OFF'}
            </span>
          </NavLink>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="p-3 space-y-1 border-t border-[hsl(var(--sidebar-border))]">
        <button
          onClick={toggleTheme}
          className={navBase + ' w-full'}
        >
          {theme === 'light'
            ? <><Moon className="h-3.5 w-3.5" /><span>Modo oscuro</span></>
            : <><Sun className="h-3.5 w-3.5" /><span>Modo claro</span></>
          }
        </button>

        {user && (
          <>
            <Separator className="my-1 bg-[hsl(var(--sidebar-border))]" />
            <p className="text-[10px] text-muted-foreground/40 truncate px-2.5 py-1 font-medium">
              {user.email}
            </p>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[11.5px] font-medium text-destructive/70 transition-all duration-150 hover:bg-destructive/8 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
