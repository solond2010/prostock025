import { Package, Receipt, PieChart, BarChart3, Menu, LogOut, Moon, Sun, Wallet, Wrench, Target, CheckCircle2, Calendar, Bot, LayoutDashboard } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
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
      { title: 'Estadísticas Avanzadas', url: '/estadisticas', icon: PieChart },
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
      toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión correctamente' });
      setOpen(false);
      navigate('/auth');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 hover:bg-secondary/80">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card">
        <SheetHeader className="border-b border-border/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left text-lg font-semibold">ProStock</SheetTitle>
              <p className="text-xs text-muted-foreground">Cockpit v2</p>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/60 px-2 mb-1">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
                    activeClassName="bg-primary/10 text-primary hover:bg-primary/15"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {item.highlight && (
                      <Badge className="h-4 px-1.5 text-[10px] bg-primary/20 text-primary border-0 font-semibold">
                        NUEVO
                      </Badge>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* SISTEMA */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/60 px-2 mb-1">
              SISTEMA
            </p>
            <div className="flex flex-col gap-0.5">
              <NavLink
                to="/bot"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
                activeClassName="bg-primary/10 text-primary hover:bg-primary/15"
              >
                <Bot className="h-4 w-4 shrink-0" />
                <span className="flex-1">Panel del Bot</span>
                <span className={`flex items-center gap-1 text-[10px] font-semibold ${botOnline ? 'text-success' : 'text-muted-foreground'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${botOnline ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                  {botOnline ? 'Activo' : 'Parado'}
                </span>
              </NavLink>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-border/60 space-y-3">
          <Button variant="outline" className="w-full justify-start gap-3 rounded-xl" onClick={toggleTheme}>
            {theme === 'light' ? (
              <><Moon className="h-4 w-4" />Modo oscuro</>
            ) : (
              <><Sun className="h-4 w-4" />Modo claro</>
            )}
          </Button>
          {user && (
            <>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground truncate px-1">{user.email}</p>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
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
