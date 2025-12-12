import { Package, Receipt, PieChart, BarChart3, Menu } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const menuItems = [
  { title: 'Gestor de Stock', url: '/', icon: Package },
  { title: 'Gráficos Mensuales', url: '/graficos', icon: BarChart3 },
  { title: 'Gasto en Material', url: '/gasto-material', icon: Receipt },
  { title: 'Estadísticas Avanzadas', url: '/estadisticas', icon: PieChart },
];

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-left text-lg font-semibold">Menú</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
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
      </SheetContent>
    </Sheet>
  );
}
