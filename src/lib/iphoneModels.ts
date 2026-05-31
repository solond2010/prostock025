// Detección de modelo de iPhone a partir del nombre del producto + precios de
// referencia de reventa. Replica la tabla del bot (supabase-deals.js) para que
// la web pueda analizar por modelo y sugerir precios.

// [precio_compra_roto_max, precio_compra_bueno_max] — lo que conviene pagar.
// Orden de MÁS específico a MENOS (importante para la detección).
const REF: [string, [number, number]][] = [
  ['se 1', [20, 45]],
  ['se 2', [25, 60]],
  ['se 3', [30, 80]],
  ['11 pro max', [65, 140]],
  ['11 pro', [55, 120]],
  ['11', [45, 100]],
  ['12 pro max', [80, 170]],
  ['12 pro', [75, 155]],
  ['12 mini', [50, 105]],
  ['12', [55, 120]],
  ['13 pro max', [110, 230]],
  ['13 pro', [100, 210]],
  ['13 mini', [65, 135]],
  ['13', [80, 175]],
  ['14 pro max', [160, 340]],
  ['14 pro', [145, 310]],
  ['14 plus', [110, 230]],
  ['14', [100, 220]],
  ['15 pro max', [220, 460]],
  ['15 pro', [200, 420]],
  ['15 plus', [150, 310]],
  ['15', [140, 290]],
  ['16 pro max', [300, 620]],
  ['16 pro', [270, 560]],
  ['16 plus', [200, 420]],
  ['16', [185, 390]],
  ['xs max', [45, 95]],
  ['xs', [40, 85]],
  ['xr', [40, 90]],
  ['x ', [35, 80]],
  ['8', [20, 50]],
  ['7', [15, 35]],
  ['6s', [10, 20]],
];

function labelFor(key: string): string {
  const k = key.trim();
  if (k.startsWith('se ')) return `iPhone SE ${k.slice(3)}`;
  if (k === 'x') return 'iPhone X';
  if (k === 'xr' || k === 'xs') return `iPhone ${k.toUpperCase()}`;
  if (k === 'xs max') return 'iPhone XS Max';
  // numéricos: "13 pro max" -> "13 Pro Max"
  const pretty = k.replace(/\b\w/g, (c) => c.toUpperCase());
  return `iPhone ${pretty}`;
}

export interface IphoneModel {
  key: string;
  label: string;
  refRoto: number;   // precio compra máx si está roto
  refBueno: number;  // precio compra máx si está bien
}

/** Detecta el modelo de iPhone en un nombre de producto, o null si no se reconoce. */
export function detectModel(name: string | null | undefined): IphoneModel | null {
  if (!name) return null;
  const t = name.toLowerCase();
  for (const [key, [refRoto, refBueno]] of REF) {
    // 'x ' lleva espacio para no confundir con xr/xs
    if (t.includes(key)) {
      return { key: key.trim(), label: labelFor(key), refRoto, refBueno };
    }
  }
  return null;
}

const BROKEN_RE = /pant.+rot|no enciende|para piezas|roto|averi|sin face.?id|water|mojad|golpe|cristal roto|bater[ií]a baja|no carga|placa/i;

/** Heurística para saber si el texto sugiere que el móvil está roto. */
export function looksBroken(text: string | null | undefined): boolean {
  return BROKEN_RE.test(text || '');
}
