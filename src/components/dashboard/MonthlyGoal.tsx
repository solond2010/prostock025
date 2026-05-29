import { useState, useEffect, useRef } from 'react';
import { Target, Pencil, Check, X, Trophy, Flame, TrendingUp, Zap } from 'lucide-react';

const LS_KEY = 'flipr_monthly_goal';

function CircleRing({ pct, color }: { pct: number; color: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = circ * Math.min(pct / 100, 1);
  const gap = circ - filled;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      {/* track */}
      <circle cx="48" cy="48" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
      {/* progress */}
      <circle
        cx="48" cy="48" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${gap}`}
        strokeDashoffset={circ / 4}   /* start from top */
        style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)' }}
      />
      {/* center text */}
      <text
        x="48" y="44"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="800"
        fill={color}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {Math.round(Math.min(pct, 999))}%
      </text>
      <text x="48" y="60" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" fontWeight="600">
        {pct >= 100 ? '¡META!' : 'objetivo'}
      </text>
    </svg>
  );
}

function getAccent(pct: number) {
  if (pct >= 100) return 'hsl(160,84%,38%)';
  if (pct >= 75)  return 'hsl(160,70%,44%)';
  if (pct >= 50)  return 'hsl(38,92%,46%)';
  if (pct >= 25)  return 'hsl(262,73%,55%)';
  return 'hsl(0,72%,51%)';
}

function getMessage(pct: number, benMes: number, goal: number) {
  if (pct >= 100) return { text: `¡Meta superada! +${(benMes - goal).toFixed(0)}€ extra 🎉`, Icon: Trophy };
  if (pct >= 80)  return { text: `¡Casi! Te faltan solo ${(goal - benMes).toFixed(0)}€`, Icon: Flame };
  if (pct >= 50)  return { text: `Buen ritmo, llevas el ${pct.toFixed(0)}% del camino`, Icon: TrendingUp };
  if (pct >= 25)  return { text: `Vas arrancando, ¡a por ello!`, Icon: Zap };
  return { text: `Define tu meta y véncela cada mes`, Icon: Target };
}

interface Props {
  benMes: number;
}

export function MonthlyGoal({ benMes }: Props) {
  const [goal, setGoal] = useState<number>(() => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? Number(raw) : 500;
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(String(goal));
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [editing]);

  const confirm = () => {
    const v = parseFloat(draft);
    if (!isNaN(v) && v > 0) {
      setGoal(v);
      localStorage.setItem(LS_KEY, String(v));
    }
    setEditing(false);
  };

  const pct = goal > 0 ? (benMes / goal) * 100 : 0;
  const accent = getAccent(pct);
  const { text: msg, Icon: MsgIcon } = getMessage(pct, benMes, goal);

  const barPct = Math.min(pct, 100);

  return (
    <div
      className="rounded-xl border border-border/60 bg-card p-4 flex items-center gap-4 sm:gap-6 animate-slide-up-2"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {/* Ring */}
      <CircleRing pct={pct} color={accent} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
            style={{ background: `${accent}18` }}
          >
            <Target className="h-3.5 w-3.5" style={{ color: accent }} />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Objetivo del mes
          </span>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="ml-auto h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </button>
          ) : (
            <div className="ml-auto flex items-center gap-1">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="number"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setEditing(false); }}
                  className="h-7 w-24 rounded-lg border border-border bg-background px-2 pr-5 text-sm font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none">€</span>
              </div>
              <button onClick={confirm} className="h-6 w-6 flex items-center justify-center rounded-md bg-success/15 text-success hover:bg-success/25 transition-colors">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setEditing(false)} className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground/60 hover:bg-muted/60 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Numbers */}
        <div className="flex items-end gap-1.5 mb-2.5">
          <span className="text-2xl font-extrabold tabular-nums leading-none" style={{ color: accent }}>
            {benMes >= 0 ? '+' : ''}{benMes.toFixed(0)}€
          </span>
          <span className="text-sm text-muted-foreground font-medium mb-0.5 leading-none">
            / {goal.toFixed(0)}€
          </span>
        </div>

        {/* Bar */}
        <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${barPct}%`, background: accent }}
          />
        </div>

        {/* Message */}
        <div className="flex items-center gap-1.5">
          <MsgIcon className="h-3 w-3 shrink-0" style={{ color: accent }} />
          <span className="text-[11px] text-muted-foreground font-medium leading-snug">{msg}</span>
        </div>
      </div>
    </div>
  );
}
