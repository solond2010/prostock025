import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Calendar as CalIcon, Flag, AlertCircle, Clock, ListChecks } from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTasks, Task } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

const PRIORITY_CFG: Record<Task['priority'], { label: string; accent: string; bg: string; border: string; icon: string }> = {
  high:   { label: 'Alta',  accent: 'hsl(var(--destructive))', bg: 'hsl(var(--destructive)/0.08)', border: 'hsl(var(--destructive)/0.3)', icon: '🔴' },
  medium: { label: 'Media', accent: 'hsl(38,92%,46%)',         bg: 'hsl(38 92% 46%/0.08)',         border: 'hsl(38 92% 46%/0.3)',         icon: '🟡' },
  low:    { label: 'Baja',  accent: 'hsl(var(--muted-foreground))', bg: 'hsl(var(--muted)/0.5)', border: 'hsl(var(--border)/0.6)',     icon: '⚪' },
};

const SECTION_CFG = {
  overdue: { label: 'Atrasadas', icon: AlertCircle, accent: 'hsl(var(--destructive))' },
  today:   { label: 'Hoy',       icon: Clock,        accent: 'hsl(262,73%,55%)' },
  upcoming:{ label: 'Próximas',  icon: CalIcon,      accent: 'hsl(217,91%,54%)' },
  done:    { label: 'Completadas', icon: CheckCircle2, accent: 'hsl(var(--success))' },
};

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const p = PRIORITY_CFG[task.priority];
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 hover:shadow-sm ${
      task.is_done ? 'opacity-55 bg-muted/20 border-border/30' : 'bg-card border-border/50 hover:border-primary/20'
    }`}>
      <button onClick={onToggle} className="shrink-0 mt-0.5 transition-transform hover:scale-110 active:scale-95">
        {task.is_done
          ? <CheckCircle2 className="h-5 w-5 text-success" />
          : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${task.is_done ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        {task.notes && <p className="text-xs text-muted-foreground mt-0.5">{task.notes}</p>}
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <span
            className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-semibold border"
            style={{ color: p.accent, background: p.bg, borderColor: p.border }}
          >
            <Flag className="h-2.5 w-2.5" />
            {p.label}
          </span>
          {task.due_date && (
            <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-medium border border-border/50 text-muted-foreground bg-muted/30">
              <CalIcon className="h-2.5 w-2.5" />
              {format(parseISO(task.due_date), "d 'de' MMM", { locale: es })}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Section({
  sectionKey,
  tasks,
  onToggle,
  onDelete,
  emptyText,
  maxShow,
}: {
  sectionKey: keyof typeof SECTION_CFG;
  tasks: Task[];
  onToggle: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
  emptyText?: string;
  maxShow?: number;
}) {
  const cfg = SECTION_CFG[sectionKey];
  const Icon = cfg.icon;
  const shown = maxShow ? tasks.slice(0, maxShow) : tasks;

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-border/40"
        style={{ borderLeft: `3px solid ${cfg.accent}`, background: `${cfg.accent}08` }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: cfg.accent }} />
        <span className="text-sm font-semibold">{cfg.label}</span>
        <span
          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
          style={{ color: cfg.accent, background: `${cfg.accent}15`, borderColor: `${cfg.accent}30` }}
        >
          {tasks.length}
        </span>
      </div>
      <div className="p-3 space-y-2">
        {shown.length === 0 && emptyText ? (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyText}</p>
        ) : (
          shown.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggle(task.id, !task.is_done)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

const Tareas = () => {
  const { toast } = useToast();
  const { tasks, isLoading, addTask, toggleDone, deleteTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', notes: '', priority: 'medium' as Task['priority'], due_date: '' });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask.mutate(
      { title: form.title.trim(), notes: form.notes || undefined, priority: form.priority, due_date: form.due_date || undefined },
      {
        onSuccess: () => {
          toast({ title: 'Tarea añadida ✓' });
          setForm({ title: '', notes: '', priority: 'medium', due_date: '' });
          setOpen(false);
        },
      }
    );
  };

  const pending = tasks.filter(t => !t.is_done);
  const done = tasks.filter(t => t.is_done);
  const todayPending = pending.filter(t => t.due_date && isToday(parseISO(t.due_date)));
  const overdue = pending.filter(t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)));
  const upcoming = pending.filter(t => !t.due_date || (!isToday(parseISO(t.due_date)) && !isPast(parseISO(t.due_date))));

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-6">

      <PageHeader
        icon={ListChecks}
        title="Tareas"
        subtitle="Recordatorios del día a día del negocio"
        iconColor="green"
        badge={
          pending.length > 0 ? (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
              {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
            </Badge>
          ) : undefined
        }
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient h-9 text-white">
                <Plus className="h-4 w-4 mr-1.5" /> Nueva tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva tarea</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Ej: Comprar pantalla iPhone 11"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  />
                </div>
                <div>
                  <Label>Notas (opcional)</Label>
                  <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Prioridad</Label>
                    <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as Task['priority'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔴 Alta</SelectItem>
                        <SelectItem value="medium">🟡 Media</SelectItem>
                        <SelectItem value="low">⚪ Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fecha (opcional)</Label>
                    <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleAdd} disabled={!form.title.trim() || addTask.isPending}>Crear</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Mini KPI strip */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up-1">
        {[
          { label: 'Atrasadas', value: overdue.length, accent: 'hsl(var(--destructive))' },
          { label: 'Para hoy', value: todayPending.length, accent: 'hsl(262,73%,55%)' },
          { label: 'Completadas', value: done.length, accent: 'hsl(var(--success))' },
        ].map(k => (
          <div key={k.label} className="kpi-card px-4 py-3 flex items-center gap-3" style={{ borderTop: `3px solid ${k.accent}` }}>
            <p className="text-2xl font-bold leading-none" style={{ color: k.accent }}>{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4 animate-slide-up-2">
          <div className="space-y-4">
            {overdue.length > 0 && (
              <Section sectionKey="overdue" tasks={overdue}
                onToggle={(id, isDone) => toggleDone.mutate({ id, isDone })}
                onDelete={id => deleteTask.mutate(id)} />
            )}
            <Section sectionKey="today" tasks={todayPending}
              onToggle={(id, isDone) => toggleDone.mutate({ id, isDone })}
              onDelete={id => deleteTask.mutate(id)}
              emptyText="Nada para hoy. ¡Disfruta! 🎉" />
          </div>
          <div className="space-y-4">
            <Section sectionKey="upcoming" tasks={upcoming}
              onToggle={(id, isDone) => toggleDone.mutate({ id, isDone })}
              onDelete={id => deleteTask.mutate(id)}
              emptyText="Sin pendientes próximas" />
            {done.length > 0 && (
              <Section sectionKey="done" tasks={done}
                onToggle={(id, isDone) => toggleDone.mutate({ id, isDone })}
                onDelete={id => deleteTask.mutate(id)}
                maxShow={5} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tareas;
