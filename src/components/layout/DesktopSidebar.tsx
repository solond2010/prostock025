import { Package, Receipt, PieChart, BarChart3, LogOut, Moon, Sun, Wallet, Wrench, Target, CheckCircle2, Calendar, Bot, LayoutDashboard } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const menuSections = [
  {
    label: 'EXISTENTE',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Gestor de Stock', url: '/', icon: Package },
      { title: 'Gráficos Anuales', url: '/graficos', icon: BarChart3 },
      { title: 'Gasto en Material', url: '/gasto-material', icon: Receipt },
      { title: 'Estadísticas', url: '/estadisticas', icon: PieChart },
      { title: 'Finanzas Personales', url: '/finanzas-personales', icon: Wallet },
      { title: 'Inventario Piezas', url: '/inventario-piezas', icon: Wrench },
    ],
  },
  {
    label: 'NUEVO',
    items: [
      { title: 'En directo', url: '/ofertas', icon: Target, highlight: true },
      { title: 'Tareas', url: '/tareas', icon: CheckCircle2, highlight: true },
      { title: 'Agenda', url: '/agenda', icon: Calendar, highlight: true },
    ],
  },
];

export function DesktopSidebar() {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: 'Error', description: 'No se pudo cerrar la sesión', variant: 'destructive' });
    } else {
      toast({ title: 'Sesión cerrada' });
      navigate('/auth');
    }
  };

  return (
    <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col border-r border-border/60 bg-card min-h-dvh sticky top-0 h-dvh overflow-y-auto pt-safe pl-safe">
      {/* Logo */}
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">ProStock</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Cockpit v2</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-4 p-3 flex-1">
        {menuSections.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground/50 px-2 mb-1">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                  activeClassName="bg-primary/10 text-primary hover:bg-primary/15 font-semibold"
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.highlight && (
                    <Badge className="h-3.5 px-1 text-[8px] bg-primary/15 text-primary border-0 font-bold leading-none">
                      NEW
                    </Badge>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Sistema */}
        <div>
          <p className="text-[9px] font-bold tracking-widest text-muted-foreground/50 px-2 mb-1">
            SISTEMA
          </p>
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground">
            <Bot className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">Bot Wallapop</span>
            <span className="flex items-center gap-1 text-[9px] text-success font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              ON
            </span>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/60 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs h-8"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <><Moon className="h-3.5 w-3.5" />Modo oscuro</> : <><Sun className="h-3.5 w-3.5" />Modo claro</>}
        </Button>
        {user && (
          <>
            <Separator />
            <p className="text-[10px] text-muted-foreground truncate px-2">{user.email}</p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
