import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from '@/components/ui/command';
import {
  LayoutDashboard, Package, Target, GitCommitHorizontal, BarChart3, Wallet,
  Receipt, PieChart, Wrench, CheckCircle2, Calendar, Bot, Box, Tag,
} from 'lucide-react';
import { useStockItems } from '@/hooks/useStockItems';
import { useDeals } from '@/hooks/useDeals';

const PAGES = [
  { label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { label: 'Gestor de Stock', url: '/', icon: Package },
  { label: 'En directo (ofertas)', url: '/ofertas', icon: Target },
  { label: 'Pipeline', url: '/pipeline', icon: GitCommitHorizontal },
  { label: 'Estadísticas', url: '/estadisticas', icon: PieChart },
  { label: 'Gráficos anuales', url: '/graficos', icon: BarChart3 },
  { label: 'Finanzas', url: '/finanzas-personales', icon: Wallet },
  { label: 'Gasto en material', url: '/gasto-material', icon: Receipt },
  { label: 'Inventario de piezas', url: '/inventario-piezas', icon: Wrench },
  { label: 'Tareas', url: '/tareas', icon: CheckCircle2 },
  { label: 'Agenda', url: '/agenda', icon: Calendar },
  { label: 'Panel del bot', url: '/bot', icon: Bot },
];

/** Paleta de búsqueda global (⌘K / Ctrl+K). Encuentra productos, ofertas y
 *  páginas desde cualquier pantalla. Se abre con el atajo o con el evento
 *  'flipr:open-search' que disparan los botones de búsqueda. */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { data: items = [] } = useStockItems();
  const { deals = [] } = useDeals();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('flipr:open-search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('flipr:open-search', onOpen);
    };
  }, []);

  const q = query.trim().toLowerCase();

  const matchedProducts = useMemo(() => {
    if (!q) return [];
    return items
      .filter((i) => i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [items, q]);

  const matchedDeals = useMemo(() => {
    if (!q) return [];
    return deals
      .filter((d: any) => (d.title || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [deals, q]);

  const go = (url: string) => {
    setOpen(false);
    setQuery('');
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar productos, ofertas o páginas..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>

        {matchedProducts.length > 0 && (
          <CommandGroup heading="Productos">
            {matchedProducts.map((p) => (
              <CommandItem key={p.id} value={`prod-${p.id}-${p.name}`} onSelect={() => go(`/?q=${encodeURIComponent(p.name)}`)}>
                <Box className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{p.estado}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {matchedDeals.length > 0 && (
          <CommandGroup heading="Ofertas del bot">
            {matchedDeals.map((d: any) => (
              <CommandItem key={d.id} value={`deal-${d.id}-${d.title}`} onSelect={() => go('/ofertas')}>
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{d.title}</span>
                {d.price != null && <span className="text-[10px] text-muted-foreground ml-2 tabular-nums">{d.price}€</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Ir a">
          {PAGES.filter((p) => !q || p.label.toLowerCase().includes(q)).map((p) => (
            <CommandItem key={p.url} value={`page-${p.label}`} onSelect={() => go(p.url)}>
              <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
