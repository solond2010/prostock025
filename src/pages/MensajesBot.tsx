import { useState } from 'react';
import { useBotMessages } from '@/hooks/useBotMessages';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Plus, Trash2, Check, X, Pencil } from 'lucide-react';

export default function MensajesBot() {
  const { messages, isLoading, create, update, remove } = useBotMessages();
  const [newText, setNewText] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const add = () => {
    if (!newText.trim()) return;
    create.mutate(newText.trim(), { onSuccess: () => setNewText('') });
  };
  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    update.mutate({ id, patch: { text: editText.trim() } }, { onSuccess: () => setEditId(null) });
  };

  return (
    <div className="mx-auto max-w-[760px] px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <PageHeader
        icon={MessageSquare}
        title="Mensajes del bot"
        iconColor="violet"
        subtitle="Plantillas que el bot usa al contactar (elige una al azar)"
      />

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-xs text-amber-600 dark:text-amber-400">
        💡 Cuantas más variantes tengas, más natural parece y menos riesgo de baneo. El bot elige una al azar de las que estén <b>activas</b>.
      </div>

      {/* Añadir */}
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
        <Textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Escribe una plantilla, ej: hola buenas, ¿sigue disponible? si me lo dejas un poco mejor de precio me lo llevo hoy, gracias!"
          rows={2}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={add} disabled={!newText.trim() || create.isPending} className="btn-primary-gradient text-white gap-1.5">
            <Plus className="h-4 w-4" /> Añadir plantilla
          </Button>
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card py-12 text-center text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-15" />
          <p className="text-sm font-medium">Sin plantillas propias</p>
          <p className="text-xs mt-1">Mientras no añadas ninguna, el bot usa sus mensajes por defecto.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={`rounded-xl border bg-card p-3.5 ${m.active ? 'border-border/60' : 'border-border/40 opacity-60'}`}>
              {editId === m.id ? (
                <div className="space-y-2">
                  <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} className="resize-none" />
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => setEditId(null)}><X className="h-3.5 w-3.5 mr-1" />Cancelar</Button>
                    <Button size="sm" className="btn-primary-gradient text-white" onClick={() => saveEdit(m.id)}><Check className="h-3.5 w-3.5 mr-1" />Guardar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-sm leading-snug">{m.text}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch checked={m.active} onCheckedChange={(v) => update.mutate({ id: m.id, patch: { active: v } })} />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditId(m.id); setEditText(m.text); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => remove.mutate(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
