import { useState, useEffect, useRef } from 'react';
import { Target, Pencil, Check, X, TrendingUp } from 'lucide-react';

const LS_KEY = 'flipr_annual_goal';

interface Props {
  benYear: number; // beneficio acumulado en lo que va de año
}

/** Objetivo anual de beneficio + proyección a fin de año según el ritmo actual. */
export function AnnualGoal({ benYear }: Props) {
  const [goal, setGoal] = useState<number>(() => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? Number(raw) : 6000;
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) { setDraft(String(goal)); setTimeout(() => inputRef.current?.select(), 50); }
  }, [editing]);

  const confirm = () => {
    const v = parseFloat(draft);
    if (!isNaN(v) && v > 0) { setGoal(v); localStorage.setItem(LS_KEY, String(v)); }
    setEditing(false);
  };

  // Proyección a fin de año según el ritmo actual
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1).getTime();
  const dayOfYear = Math.max(1, Math.floor((now.getTime() - startOfYear) / 86400000) + 1);
  const daysInYear = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
  const projected = Math.round((benYear / dayOfYear) * daysInYear);

  const pct = goal > 0 ? Math.min((benYear / goal) * 100, 100) : 0;
  const projPct = goal > 0 ? Math.min((projected / goal) * 100, 100) : 0;
  const onTrack = projected >= goal;
  const accent = onTrack ? 'hsl(160,84%,38%)' : pct >= 50 ? 'hsl(38,92%,46%)' : 'hsl(262,73%,55%)';

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 animate-slide-up-3" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0" style={{ background: `${accent}18` }}>
          <Target className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Objetivo anual {year}</span>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="ml-auto h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors">
            <Pencil className="h-3 w-3" />
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-1">
            <div className="relative flex items-center">
              <input ref={inputRef} type="number" value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setEditing(false); }}
                className="h-7 w-28 rounded-lg border border-border bg-background px-2 pr-5 text-sm font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-primary" />
              <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none">€</span>
            </div>
            <button onClick={confirm} className="h-6 w-6 flex items-center justify-center rounded-md bg-success/15 text-success hover:bg-success/25"><Check className="h-3.5 w-3.5" /></button>
            <button onClick={() => setEditing(false)} className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground/60 hover:bg-muted/60"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5 mb-2.5">
        <span className="text-2xl font-extrabold tabular-nums leading-none" style={{ color: accent }}>
          {benYear >= 0 ? '+' : ''}{Math.round(benYear)}€
        </span>
        <span className="text-sm text-muted-foreground font-medium mb-0.5 leading-none">/ {Math.round(goal)}€</span>
      </div>

      {/* Barra con marca de proyección */}
      <div className="relative h-2.5 w-full rounded-full bg-muted/50 overflow-hidden mb-1">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: accent }} />
        {/* marca de proyección */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/40" style={{ left: `${projPct}%` }} title="Proyección" />
      </div>

      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-3 w-3 shrink-0" style={{ color: accent }} />
        <span className="text-[11px] text-muted-foreground">
          A este ritmo cierras el año en <b style={{ color: accent }}>~{projected}€</b>
          {onTrack ? ' — ¡vas a superar tu objetivo! 🎉' : ` (${Math.round(projPct)}% del objetivo)`}
        </span>
      </div>
    </div>
  );
}
