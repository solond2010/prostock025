import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Calendar as CalIcon, Flag } from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useTasks, Task } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

const PRIORITY_LABEL: Record<Task['priority'], { label: string; className: string }> = {
  high: { label: 'Alta', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  medium: { label: 'Media', className: 'bg-warning/10 text-warning border-warning/20' },
  low: { label: 'Baja', className: 'bg-muted text-muted-foreground' },
};

const Tareas = () => {
  const { toast } = useToast();
  const { tasks, isLoading, addTask, toggleDone, deleteTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    notes: '',
    priority: 'medium' as Task['priority'],
    due_date: '',
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask.mutate(
      {
        title: form.title.trim(),
        notes: form.notes || undefined,
        priority: form.priority,
        due_date: form.due_date || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Tarea añadida' });
          setForm({ title: '', notes: '', priority: 'medium', due_date: '' });
          setOpen(false);
        },
      }
    );
  };

  const pending = tasks.filter((t) => !t.is_done);
  const done = tasks.filter((t) => t.is_done);

  const todayPending = pending.filter((t) => t.due_date && isToday(parseISO(t.due_date)));
  const overdue = pending.filter((t) => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)));
  const upcoming = pending.filter(
    (t) => !t.due_date || (!isToday(parseISO(t.due_date)) && !isPast(parseISO(t.due_date)))
  );

  const renderTask = (task: Task) => (
    <div
      key={task.id}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-secondary/50 ${
        task.is_done ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => toggleDone.mutate({ id: task.id, isDone: !task.is_done })}
        className="shrink-0 mt-0.5"
        aria-label="Marcar"
      >
        {task.is_done ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.is_done ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        {task.notes && <p className="text-xs text-muted-foreground mt-0.5">{task.notes}</p>}
        <div className="flex flex-wrap gap-2 mt-1.5">
          <Badge variant="outline" className={`text-xs h-5 ${PRIORITY_LABEL[task.priority].className}`}>
            <Flag className="h-2.5 w-2.5 mr-1" />
            {PRIORITY_LABEL[task.priority].label}
          </Badge>
          {task.due_date && (
            <Badge variant="outline" className="text-xs h-5">
              <CalIcon className="h-2.5 w-2.5 mr-1" />
              {format(parseISO(task.due_date), "d 'de' MMM", { locale: es })}
            </Badge>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => deleteTask.mutate(task.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
            <p className="text-sm text-muted-foreground">Recordatorios del día a día del negocio</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
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
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Comprar pantalla iPhone 11"
                  autoFocus
                />
              </div>
              <div>
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prioridad</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) => setForm({ ...form, priority: v as Task['priority'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🔴 Alta</SelectItem>
                      <SelectItem value="medium">🟡 Media</SelectItem>
                      <SelectItem value="low">⚪ Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha (opcional)</Label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdd} disabled={!form.title.trim() || addTask.isPending}>
                Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            {overdue.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                    🔴 Atrasadas ({overdue.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">{overdue.map(renderTask)}</CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  📅 Hoy ({todayPending.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {todayPending.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nada para hoy. Disfruta 🎉
                  </p>
                ) : (
                  todayPending.map(renderTask)
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  📋 Próximas / Sin fecha ({upcoming.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sin pendientes</p>
                ) : (
                  upcoming.map(renderTask)
                )}
              </CardContent>
            </Card>

            {done.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                    ✅ Completadas ({done.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">{done.slice(0, 5).map(renderTask)}</CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tareas;
