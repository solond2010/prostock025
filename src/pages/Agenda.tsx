import { useState, useMemo } from 'react';
import { Calendar, Plus, MapPin, Phone, Euro, Trash2 } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useEvents, CalEvent } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';

const TYPE_LABEL: Record<CalEvent['event_type'], { label: string; emoji: string; border: string }> = {
  sale: { label: 'Venta', emoji: '💰', border: 'border-l-success' },
  purchase: { label: 'Compra', emoji: '🛒', border: 'border-l-primary' },
  repair: { label: 'Reparación', emoji: '🔧', border: 'border-l-warning' },
  other: { label: 'Otro', emoji: '📌', border: 'border-l-muted-foreground' },
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
          toast({ title: 'Cita añadida' });
          setOpen(false);
          setForm({
            ...form,
            title: '',
            description: '',
            location: '',
            contact_name: '',
            contact_phone: '',
            amount: '',
          });
        },
      }
    );
  };

  const formatDayLabel = (date: Date) => {
    if (isToday(date)) return 'HOY';
    if (isTomorrow(date)) return 'MAÑANA';
    return format(date, 'EEEE', { locale: es }).toUpperCase();
  };

  const nextEvent = events.find((e) => new Date(e.starts_at).getTime() > Date.now());

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-chart-3/10 border border-chart-3/20">
            <Calendar className="h-6 w-6 text-chart-3" style={{ color: 'hsl(var(--chart-3))' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
            <p className="text-sm text-muted-foreground">Citas con clientes, recogidas y entregas</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
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
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Entrega iPhone 12 a Carlos"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={form.event_type}
                    onValueChange={(v) => setForm({ ...form, event_type: v as CalEvent['event_type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Inicio</Label>
                  <Input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fin (opcional)</Label>
                  <Input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Ubicación</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Ej: Sol, Madrid"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contacto</Label>
                  <Input
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdd} disabled={!form.title.trim() || addEvent.isPending}>
                Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {nextEvent && (
        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary text-xl">
              {TYPE_LABEL[nextEvent.event_type].emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Próxima cita</p>
              <p className="font-semibold">{nextEvent.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(nextEvent.starts_at), "EEEE d 'a las' HH:mm", { locale: es })}
                {nextEvent.location ? ` · ${nextEvent.location}` : ''}
              </p>
            </div>
            {nextEvent.amount != null && (
              <div className="text-right">
                <p className="font-bold text-lg">{nextEvent.amount}€</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sin citas próximas. Crea la primera con el botón de arriba.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dateKey, dayEvents]) => {
            const date = parseISO(dateKey);
            return (
              <Card key={dateKey}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge variant={isToday(date) ? 'default' : 'outline'}>
                      {formatDayLabel(date)}
                    </Badge>
                    <span className="text-muted-foreground font-normal">
                      {format(date, "d 'de' MMMM", { locale: es })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayEvents.map((e) => {
                    const type = TYPE_LABEL[e.event_type];
                    return (
                      <div
                        key={e.id}
                        className={`p-3 rounded-r-lg border-l-4 bg-secondary/30 ${type.border} flex items-start gap-3`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground font-semibold">
                            {format(parseISO(e.starts_at), 'HH:mm')}
                            {e.ends_at && ` — ${format(parseISO(e.ends_at), 'HH:mm')}`}
                            <span className="ml-2">
                              {type.emoji} {type.label}
                            </span>
                          </div>
                          <p className="font-semibold text-sm mt-0.5">{e.title}</p>
                          {e.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1.5">
                            {e.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {e.location}
                              </span>
                            )}
                            {e.contact_name && (
                              <span>{e.contact_name}</span>
                            )}
                            {e.contact_phone && (
                              <a
                                href={`tel:${e.contact_phone}`}
                                className="flex items-center gap-1 text-primary"
                              >
                                <Phone className="h-3 w-3" /> {e.contact_phone}
                              </a>
                            )}
                            {e.amount != null && (
                              <span className="flex items-center gap-1 font-semibold text-foreground">
                                <Euro className="h-3 w-3" /> {e.amount}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteEvent.mutate(e.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Agenda;
