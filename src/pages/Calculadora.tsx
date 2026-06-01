import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Calculator, TrendingUp } from 'lucide-react';
import { listModels, detectModel } from '@/lib/iphoneModels';
import { useStockItems } from '@/hooks/useStockItems';

const MODELS = listModels();

export default function Calculadora() {
  const { data: stockItems = [] } = useStockItems();
  const [modelKey, setModelKey] = useState(MODELS[0]?.key ?? '');
  const [broken, setBroken] = useState(true);
  const [margin, setMargin] = useState(40);

  const model = MODELS.find((m) => m.key === modelKey);

  // Venta y reparación: tu media real si existe, si no la referencia de mercado.
  const data = useMemo(() => {
    if (!model) return null;
    const sold = stockItems.filter(
      (h) => h.estado === 'Vendido' && Number(h.precio_venta_real) > 0 && detectModel(h.name)?.key === model.key
    );
    let sale = model.refSale, saleSource: 'historial' | 'mercado' = 'mercado';
    if (sold.length >= 1) {
      sale = Math.round(sold.reduce((s, h) => s + Number(h.precio_venta_real), 0) / sold.length);
      saleSource = 'historial';
    }
    let repair = broken ? model.refRepair : 0;
    let repairSource: 'historial' | 'mercado' = 'mercado';
    if (broken) {
      const rep = sold.filter((h) => Number(h.coste_reparacion) > 0);
      if (rep.length >= 1) {
        repair = Math.round(rep.reduce((s, h) => s + Number(h.coste_reparacion), 0) / rep.length);
        repairSource = 'historial';
      }
    }
    // margen sobre coste: coste = venta/(1+m); compra = coste − reparación
    const cost = sale / (1 + margin / 100);
    const maxBuy = Math.max(0, Math.round(cost - repair));
    const profit = Math.round(sale - maxBuy - repair);
    return { sale, saleSource, repair, repairSource, maxBuy, profit, count: sold.length };
  }, [model, stockItems, broken, margin]);

  return (
    <div className="mx-auto max-w-[680px] px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <PageHeader
        icon={Calculator}
        title="¿Cuánto puedo pagar?"
        iconColor="violet"
        subtitle="Calcula el precio máximo de compra para tu margen objetivo"
      />

      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Modelo</Label>
            <Select value={modelKey} onValueChange={setModelKey}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {MODELS.map((m) => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Margen que quieres ganar</Label>
            <div className="flex items-center gap-2">
              <Input type="number" value={margin} onChange={(e) => setMargin(Math.max(0, parseInt(e.target.value) || 0))} className="w-24" />
              <span className="text-sm text-muted-foreground">% sobre el coste</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">¿Está roto / necesita reparación?</p>
            <p className="text-[11px] text-muted-foreground">Resta el coste estimado de reparación</p>
          </div>
          <Switch checked={broken} onCheckedChange={setBroken} />
        </div>
      </div>

      {data && (
        <div className="rounded-2xl border p-6 text-center" style={{ borderColor: 'hsl(262 73% 55% / 0.4)', background: 'hsl(262 73% 55% / 0.06)' }}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Paga como máximo</p>
          <p className="text-5xl font-extrabold tabular-nums" style={{ color: 'hsl(262,73%,55%)' }}>{data.maxBuy}€</p>
          <p className="text-sm text-muted-foreground mt-2">
            …y ganarías <b className="text-success">≈ +{data.profit}€</b> ({margin}% margen)
          </p>

          <div className="mt-5 pt-4 border-t border-border/40 grid grid-cols-3 gap-2 text-left">
            <div>
              <p className="text-[10px] text-muted-foreground">Venta estimada</p>
              <p className="text-sm font-bold tabular-nums">{data.sale}€</p>
              <p className="text-[9px] text-muted-foreground/70">{data.saleSource === 'historial' ? `tu media (${data.count})` : 'aprox. mercado'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Reparación</p>
              <p className="text-sm font-bold tabular-nums">{data.repair > 0 ? `−${data.repair}€` : '—'}</p>
              <p className="text-[9px] text-muted-foreground/70">{data.repair > 0 ? (data.repairSource === 'historial' ? 'tu media' : 'aprox.') : 'sin reparar'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Compra máx.</p>
              <p className="text-sm font-bold tabular-nums" style={{ color: 'hsl(262,73%,55%)' }}>{data.maxBuy}€</p>
              <p className="text-[9px] text-muted-foreground/70">tu tope</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
        Úsalo al negociar: si el vendedor te lo deja en ese precio o menos, te sale el margen que buscas. Cuanto más vendas ese modelo, más se ajusta a tus números reales.
      </p>
    </div>
  );
}
