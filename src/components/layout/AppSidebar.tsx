import { Receipt, PieChart, BarChart3, Menu, LogOut, Moon, Sun, Wallet, Wrench, Target, CheckCircle2, Calendar, Bot, LayoutDashboard, GitCommitHorizontal, Package, Zap } from 'lucide-react';
import { useBotStatus, isBotOnline } from '@/hooks/useBotStatus';
import { NavLink } from '@/components/NavLink';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
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

export function AppSidebar() {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      navigate('/auth');
    }
  };

  const navBase = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/70 transition-all duration-150 hover:bg-secondary hover:text-foreground';
  const navActive = 'bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 hover:bg-secondary/80">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]">
        <SheetHeader className="border-b border-[hsl(var(--sidebar-border))] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}>
              <Zap className="h-5 w-5 text-white" fill="white" strokeWidth={0} />
              <div className="absolute inset-0 rounded-xl"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)' }} />
            </div>
            <div>
              <SheetTitle className="text-left text-base font-bold tracking-tight">Flipr</SheetTitle>
              <p className="text-xs text-muted-foreground/50">Panel de ventas</p>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground/35 px-3 mb-1.5 uppercase">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={() => setOpen(false)}
                    className={navBase}
                    activeClassName={navActive}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold bg-primary/12 text-primary">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground/35 px-3 mb-1.5 uppercase">
              SISTEMA
            </p>
            <NavLink
              to="/bot"
              onClick={() => setOpen(false)}
              className={navBase}
              activeClassName={navActive}
            >
              <Bot className="h-4 w-4 shrink-0" />
              <span className="flex-1">Panel del Bot</span>
              <span className={`flex items-center gap-1 text-[10px] font-semibold ${botOnline ? 'text-success' : 'text-muted-foreground/40'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${botOnline ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
                {botOnline ? 'Activo' : 'Parado'}
              </span>
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-2">
          <Button variant="outline" className="w-full justify-start gap-3 rounded-xl font-medium" onClick={toggleTheme}>
            {theme === 'light'
              ? <><Moon className="h-4 w-4" />Modo oscuro</>
              : <><Sun className="h-4 w-4" />Modo claro</>
            }
          </Button>
          {user && (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground/50 truncate px-1 pt-1">{user.email}</p>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-xl font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
