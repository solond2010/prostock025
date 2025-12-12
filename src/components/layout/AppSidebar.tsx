import { Package, Receipt, PieChart, BarChart3, Menu, LogOut } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { title: 'Gestor de Stock', url: '/', icon: Package },
  { title: 'Gráficos Mensuales', url: '/graficos', icon: BarChart3 },
  { title: 'Gasto en Material', url: '/gasto-material', icon: Receipt },
  { title: 'Estadísticas Avanzadas', url: '/estadisticas', icon: PieChart },
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
      setOpen(false);
      navigate('/auth');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-left text-lg font-semibold">Menú</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeClassName="bg-secondary text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 truncate">{user.email}</p>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
