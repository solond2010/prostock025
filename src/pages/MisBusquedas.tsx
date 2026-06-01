import { useState } from 'react';
import { useBotSearches, BotSearch, NewBotSearch } from '@/hooks/useBotSearches';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Trash2, Pencil, MapPin, Radio } from 'lucide-react';
import { toast } from 'sonner';

const ORDER_LABEL: Record<string, string> = { newest: 'Más nuevos', relevance: 'Relevancia' };
const TIME_LABEL: Record<string, string> = { today: 'Últimas 24h', lastWeek: 'Última semana', lastMonth: 'Último mes' };

const EMPTY: NewBotSearch = {
  name: '', keywords: '', order_by: 'newest', time_filter: 'lastWeek',
  distance_km: null, lat: null, lng: null, min_price: null, max_price: null, active: true,
};

export default function MisBusquedas() {
  const { searches, isLoading, create, update, remove } = useBotSearches();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BotSearch | null>(null);
  const [form, setForm] = useState<NewBotSearch>(EMPTY);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (s: BotSearch) => {
    setEditing(s);
    setForm({ name: s.name, keywords: s.keywords, order_by: s.order_by, time_filter: s.time_filter,
      distance_km: s.distance_km, lat: s.lat, lng: s.lng, min_price: s.min_price, max_price: s.max_price, active: s.active });
    setOpen(true);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { toast.error('Tu navegador no soporta geolocalización'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude })); toast.success('Ubicación fijada ✓'); },
      () => toast.error('No se pudo obtener tu ubicación')
    );
  };

  const save = () => {
    if (!form.name.trim() || !form.keywords.trim()) { toast.error('Pon un nombre y las palabras clave'); return; }
    if (editing) update.mutate({ id: editing.id, patch: form }, { onSuccess: () => { setOpen(false); toast.success('Búsqueda actualizada'); } });
    else create.mutate(form, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <PageHeader
        icon={Search}
        title="Mis búsquedas"
        iconColor="cyan"
        subtitle="Configura qué busca el bot en Wallapop para ti"
        actions={
          <Button onClick={openNew} className="btn-primary-gradient h-9 text-white gap-1.5">
            <Plus className="h-4 w-4" /> Nueva búsqueda
          </Button>
        }
      />

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
        <Radio className="h-4 w-4 shrink-0 mt-0.5" />
        <span>El bot rastrea tus búsquedas activas y te enseña los chollos en <b>En directo</b>. El contacto automático con vendedores está en camino 🔒.</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : searches.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card flex flex-col items-center justify-center py-14 text-center">
          <Search className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium">Aún no tienes búsquedas</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Crea tu primera para que el bot empiece a buscarte chollos.</p>
          <Button onClick={openNew} className="btn-primary-gradient text-white gap-1.5"><Plus className="h-4 w-4" /> Crear búsqueda</Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {searches.map((s) => (
            <div key={s.id} className="rounded-xl border border-border/60 bg-card p-4" style={{ borderTop: `3px solid ${s.active ? 'hsl(188,84%,40%)' : 'hsl(var(--muted-foreground))'}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">🔍 {s.keywords}</p>
                </div>
                <Switch checked={s.active} onCheckedChange={(v) => update.mutate({ id: s.id, patch: { active: v } })} />
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] mb-3">
                <span className="px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">{ORDER_LABEL[s.order_by]}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">{TIME_LABEL[s.time_filter]}</span>
                {(s.min_price != null || s.max_price != null) && (
                  <span className="px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                    {s.min_price ?? 0}–{s.max_price ?? '∞'}€
                  </span>
                )}
                {s.distance_km != null && s.lat != null && (
                  <span className="px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{s.distance_km}km</span>
                )}
                <span className="px-1.5 py-0.5 rounded-md font-semibold" style={{ color: s.active ? 'hsl(160,84%,38%)' : 'hsl(var(--muted-foreground))', background: s.active ? 'hsl(160 84% 38% / 0.12)' : 'hsl(var(--muted)/0.6)' }}>
                  {s.active ? '● Activa' : '○ Pausada'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => openEdit(s)}><Pencil className="h-3 w-3 mr-1" />Editar</Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10" onClick={() => remove.mutate(s.id)}><Trash2 className="h-3 w-3 mr-1" />Borrar</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog crear/editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>{editing ? 'Editar búsqueda' : 'Nueva búsqueda'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: iPhone pantalla rota" />
            </div>
            <div className="space-y-1.5">
              <Label>Palabras clave (lo que buscas en Wallapop)</Label>
              <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="iphone pantalla rota" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ordenar por</Label>
                <Select value={form.order_by} onValueChange={(v) => setForm({ ...form, order_by: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Más nuevos</SelectItem>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Antigüedad</Label>
                <Select value={form.time_filter} onValueChange={(v) => setForm({ ...form, time_filter: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Últimas 24h</SelectItem>
                    <SelectItem value="lastWeek">Última semana</SelectItem>
                    <SelectItem value="lastMonth">Último mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Precio mín (€)</Label>
                <Input type="number" value={form.min_price ?? ''} onChange={(e) => setForm({ ...form, min_price: e.target.value ? parseInt(e.target.value) : null })} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Precio máx (€)</Label>
                <Input type="number" value={form.max_price ?? ''} onChange={(e) => setForm({ ...form, max_price: e.target.value ? parseInt(e.target.value) : null })} placeholder="Sin límite" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1.5">
                <Label>Distancia (km)</Label>
                <Input type="number" value={form.distance_km ?? ''} onChange={(e) => setForm({ ...form, distance_km: e.target.value ? parseInt(e.target.value) : null })} placeholder="Sin límite" />
              </div>
              <Button type="button" variant="outline" className="h-10 gap-1.5" onClick={useMyLocation}>
                <MapPin className="h-3.5 w-3.5" />
                {form.lat != null ? 'Ubicación ✓' : 'Usar mi ubicación'}
              </Button>
            </div>
            {form.distance_km != null && form.lat == null && (
              <p className="text-[11px] text-amber-500">Para filtrar por distancia, pulsa "Usar mi ubicación".</p>
            )}
            <div className="flex items-center justify-between pt-1">
              <Label>Búsqueda activa</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="btn-primary-gradient text-white" onClick={save} disabled={create.isPending || update.isPending}>
              {editing ? 'Guardar cambios' : 'Crear búsqueda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
