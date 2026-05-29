import { useState, useMemo } from 'react';
import { Calendar, Plus, MapPin, Phone, Euro, Trash2, CalendarDays } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/ui/PageHeader';
import { useEvents, CalEvent } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';

const TYPE_CFG: Record<CalEvent['event_type'], { label: string; emoji: string; accent: string; bg: string; border: string }> = {
  sale:     { label: 'Venta',       emoji: '💰', accent: 'hsl(var(--success))',  bg: 'hsl(var(--success)/0.08)',  border: 'hsl(var(--success)/0.3)' },
  purchase: { label: 'Compra',      emoji: '🛒', accent: 'hsl(262,73%,55%)',     bg: 'hsl(262 73% 55%/0.08)',     border: 'hsl(262 73% 55%/0.3)' },
  repair:   { label: 'Reparación',  emoji: '🔧', accent: 'hsl(38,92%,46%)',      bg: 'hsl(38 92% 46%/0.08)',      border: 'hsl(38 92% 46%/0.3)' },
  other:    { label: 'Otro',        emoji: '📌', accent: 'hsl(217,91%,54%)',     bg: 'hsl(217 91% 54%/0.08)',     border: 'hsl(217 91% 54%/0.3)' },
};

const Agenda = () => {
  const { toast } = useToast();
  const { events, isLoading, addEvent, deleteEvent } = useEvents();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'sale' as CalEvent['event_type'],
    starts_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    ends_at: '',
    location: '',
    contact_name: '',
    contact_phone: '',
    amount: '',
  });

  const grouped = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const key = format(startOfDay(parseISO(e.starts_at)), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).sort();
  }, [events]);

  const handleAdd = () => {
    if (!form.title.trim() || !form.starts_at) return;
    addEvent.mutate(
      {
        title: form.title.trim(),
        description: form.description || undefined,
        event_type: form.event_type,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : undefined,
        location: form.location || undefined,
        contact_name: form.contact_name || undefined,
        contact_phone: form.contact_phone || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Cita añadida ✓' });
          setOpen(false);
          setForm({ ...form, title: '', description: '', location: '', contact_name: '', contact_phone: '', amount: '' });
        },
      }
    );
  };

  const formatDayLabel = (date: Date) => {
    if (isToday(date)) return 'HOY';
    if (isTomorrow(date)) return 'MAÑANA';
    return format(date, 'EEEE', { locale: es }).toUpperCase();
  };

  const nextEvent = events.find(e => new Date(e.starts_at).getTime() > Date.now());

  const newCitaDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary-gradient h-9 text-white">
          <Plus className="h-4 w-4 mr-1.5" /> Nueva cita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
          <div>
            <Label>Título</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ej: Entrega iPhone 12 a Carlos" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.event_type} onValueChange={v => setForm({ ...form, event_type: v as CalEvent['event_type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">💰 Venta</SelectItem>
                  <SelectItem value="purchase">🛒 Compra</SelectItem>
                  <SelectItem value="repair">🔧 Reparación</SelectItem>
                  <SelectItem value="other">📌 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Importe (€)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Inicio</Label>
              <Input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} />
            </div>
            <div>
              <Label>Fin (opcional)</Label>
              <Input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Ubicación</Label>
            <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ej: Sol, Madrid" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contacto</Label>
              <Input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} placeholder="Nombre" />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input type="tel" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={!form.title.trim() || addEvent.isPending}>Crear</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-6">

      <PageHeader
        icon={CalendarDays}
        title="Agenda"
        subtitle="Citas con clientes, recogidas y entregas"
        iconColor="blue"
        badge={
          events.length > 0 ? (
            <Badge variant="outline" className="text-[10px] font-bold">{events.length} cita{events.length !== 1 ? 's' : ''}</Badge>
          ) : undefined
        }
        actions={newCitaDialog}
      />

      {/* Próxima cita highlight */}
      {nextEvent && (() => {
        const t = TYPE_CFG[nextEvent.event_type];
        return (
          <div
            className="flex items-center gap-4 p-4 rounded-2xl border animate-slide-up-1"
            style={{ background: t.bg, borderColor: t.border }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
              style={{ background: t.accent + '20' }}
            >
              {t.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Próxima cita</p>
              <p className="font-semibold leading-snug">{nextEvent.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(parseISO(nextEvent.starts_at), "EEEE d 'a las' HH:mm", { locale: es })}
                {nextEvent.location ? ` · ${nextEvent.location}` : ''}
              </p>
            </div>
            {nextEvent.amount != null && (
              <div className="text-right shrink-0">
                <p className="text-lg font-bold" style={{ color: t.accent }}>{nextEvent.amount}€</p>
              </div>
            )}
          </div>
        );
      })()}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Calendar className="h-12 w-12 mb-3 opacity-15" />
          <p className="text-sm font-medium">Sin citas próximas</p>
          <p className="text-xs mt-1 opacity-60">Crea la primera con el botón de arriba</p>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up-2">
          {grouped.map(([dateKey, dayEvents]) => {
            const date = parseISO(dateKey);
            const isThisToday = isToday(date);
            return (
              <div key={dateKey} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {/* Day header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-muted/20">
                  <Badge
                    className={isThisToday
                      ? 'bg-primary text-primary-foreground text-[10px] font-bold'
                      : 'bg-muted text-muted-foreground border-border/50 text-[10px] font-bold'
                    }
                  >
                    {formatDayLabel(date)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(date, "d 'de' MMMM", { locale: es })}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">{dayEvents.length} cita{dayEvents.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Events */}
                <div className="p-3 space-y-2">
                  {dayEvents.map(e => {
                    const t = TYPE_CFG[e.event_type];
                    return (
                      <div
                        key={e.id}
                        className="flex items-start gap-3 p-3 rounded-xl transition-all hover:shadow-sm"
                        style={{ background: t.bg, borderLeft: `3px solid ${t.accent}`, paddingLeft: '14px' }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-bold" style={{ color: t.accent }}>
                              {format(parseISO(e.starts_at), 'HH:mm')}
                              {e.ends_at && ` — ${format(parseISO(e.ends_at), 'HH:mm')}`}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{t.emoji} {t.label}</span>
                          </div>
                          <p className="font-semibold text-sm">{e.title}</p>
                          {e.description && <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1.5">
                            {e.location && (
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
                            )}
                            {e.contact_name && <span>{e.contact_name}</span>}
                            {e.contact_phone && (
                              <a href={`tel:${e.contact_phone}`} className="flex items-center gap-1" style={{ color: t.accent }}>
                                <Phone className="h-3 w-3" /> {e.contact_phone}
                              </a>
                            )}
                            {e.amount != null && (
                              <span className="flex items-center gap-1 font-semibold text-foreground">
                                <Euro className="h-3 w-3" /> {e.amount}€
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEvent.mutate(e.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Agenda;
