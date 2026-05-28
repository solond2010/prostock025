import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── OpenRouter config ────────────────────────────────────────────────────────
const OPENROUTER_API_KEY_LS = 'prostock_openrouter_key';

// Free models in priority order — auto-rotation on failure
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'deepseek/deepseek-v4-flash:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'qwen/qwen3-coder:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
];

const SYSTEM_PROMPT = `Eres un asistente experto en compra-venta de iPhones de segunda mano en Wallapop España. Trabajas integrado en ProStock, una app de gestión de stock para revendedores.

Tu trabajo:
- Analizar precios de mercado con los datos reales de Wallapop que te proporcionen
- Identificar buenos deals y explicar por qué son buenos o malos
- Dar rangos de precios realistas por modelo, estado y almacenamiento
- Ayudar a decidir si un precio de compra es rentable para revender
- Responder preguntas sobre el negocio de la reventa de móviles

Cuando tengas datos de anuncios reales de Wallapop, analízalos con detalle:
- Precio medio, mínimo y máximo
- Factores que afectan al precio (batería, daños, almacenamiento, color)
- Cuáles son deals interesantes y cuáles están caros

Responde SIEMPRE en español. Sé conciso pero completo. Usa emojis con moderación.
IMPORTANTE: Estás en un panel de chat pequeño (móvil). Si usas tablas, que tengan MÁXIMO 2-3 columnas cortas. Si necesitas más columnas, usa listas con viñetas en su lugar. Nunca hagas tablas de más de 3 columnas.`;

// ─── Price keyword detection ──────────────────────────────────────────────────
function isPriceQuery(msg: string): boolean {
  const keywords = [
    'cuánto vale', 'cuanto vale', 'precio', 'vale', 'cuesta', 'valen', 'cuestan',
    'mercado', 'wallapop', 'anuncios', 'listings', 'datos', 'análisis', 'analiza',
    'iphone', 'samsung', 'xiaomi', 'comprar', 'vender', 'revender', 'margen',
    'beneficio', 'chollo', 'barato', 'caro', 'media', 'promedio', 'rango',
  ];
  const lower = msg.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

// ─── Fetch relevant deals from Supabase ───────────────────────────────────────
async function fetchDealsContext(query: string): Promise<string> {
  try {
    // Extract iPhone model from query
    const modelMatch = query.match(/iphone\s*(\d{1,2}(?:\s*(?:pro|plus|mini|max|se))*)/i);

    let q = supabase
      .from('deals' as any)
      .select('title, price, description, score, search_keyword, created_at')
      .order('created_at', { ascending: false })
      .limit(80);

    if (modelMatch) {
      // Filter by model name
      q = q.ilike('title', `%${modelMatch[0]}%`);
    }

    const { data, error } = await q;
    if (error || !data?.length) return '';

    const deals = data as any[];

    // Group stats
    const withPrice = deals.filter((d: any) => d.price && d.price > 0);
    if (withPrice.length === 0) return '';

    const prices = withPrice.map((d: any) => Number(d.price));
    const avg = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const fireDeals = deals.filter((d: any) => d.score === 'fire').length;
    const goodDeals = deals.filter((d: any) => d.score === 'good').length;

    // Recent sample (last 15 with descriptions)
    const sample = deals.slice(0, 15).map((d: any) =>
      `• ${d.title} — ${d.price}€${d.description ? ' | ' + d.description.substring(0, 120) : ''}`
    ).join('\n');

    const oldest = deals[deals.length - 1]?.created_at;
    const daysAgo = oldest
      ? Math.ceil((Date.now() - new Date(oldest).getTime()) / (1000 * 60 * 60 * 24))
      : '?';

    return `
[DATOS REALES DE WALLAPOP — ${deals.length} anuncios de los últimos ${daysAgo} días]
Precio medio: ${avg}€ | Mínimo: ${min}€ | Máximo: ${max}€
Deals clasificados: 🔥 Brutal: ${fireDeals} | ⭐ Buen precio: ${goodDeals}

Muestra de anuncios recientes:
${sample}

Analiza estos datos para responder la pregunta del usuario.`.trim();
  } catch {
    return '';
  }
}

// ─── OpenRouter call with model rotation ─────────────────────────────────────
async function callOpenRouter(
  messages: { role: string; content: string }[],
  apiKey: string,
  modelIndex = 0
): Promise<{ text: string; model: string }> {
  if (modelIndex >= FREE_MODELS.length) {
    throw new Error('Todos los modelos gratuitos están caídos o sin cuota. Inténtalo más tarde.');
  }

  const model = FREE_MODELS[modelIndex];

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://prostock.app',
      'X-Title': 'ProStock AI',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    // Rate limit or model unavailable — try next model
    // Rotate on: rate limit, unavailable, not found, or quota issues
    if (
      res.status === 429 || res.status === 503 || res.status === 502 ||
      res.status === 404 || res.status === 400 ||
      errText.includes('quota') || errText.includes('No endpoints found') || errText.includes('not found')
    ) {
      console.log(`Model ${model} failed (${res.status}), trying next...`);
      return callOpenRouter(messages, apiKey, modelIndex + 1);
    }
    throw new Error(`OpenRouter error ${res.status}: ${errText.substring(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  if (!text) {
    return callOpenRouter(messages, apiKey, modelIndex + 1);
  }
  return { text, model };
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  error?: boolean;
}

// ─── API Key setup screen ─────────────────────────────────────────────────────
function ApiKeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [key, setKey] = useState('');
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-sm">Configura la IA</p>
        <p className="text-xs text-muted-foreground mt-1">
          Necesitas una API key gratuita de{' '}
          <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="underline text-primary">
            openrouter.ai
          </a>
        </p>
      </div>
      <div className="w-full space-y-2">
        <Textarea
          className="text-xs font-mono resize-none h-16"
          placeholder="sk-or-v1-..."
          value={key}
          onChange={e => setKey(e.target.value)}
        />
        <Button
          className="w-full h-9"
          disabled={key.trim().length < 20}
          onClick={() => onSave(key.trim())}
        >
          Guardar y usar
        </Button>
      </div>
    </div>
  );
}

// ─── Suggested prompts ───────────────────────────────────────────────────────
const SUGGESTIONS = [
  '¿Cuánto vale un iPhone 13 en Wallapop ahora?',
  '¿Cuál es el mejor deal en el feed?',
  '¿Qué iPhone comprar para revender con más margen?',
  'Analiza los precios de iPhone 12 pro',
];

// ─── Main AIChat component ────────────────────────────────────────────────────
export function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() =>
    localStorage.getItem(OPENROUTER_API_KEY_LS) ?? ''
  );
  const [currentModel, setCurrentModel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opening
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 100);
  }, [open]);

  const saveApiKey = useCallback((key: string) => {
    localStorage.setItem(OPENROUTER_API_KEY_LS, key);
    setApiKey(key);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build context if price-related
      let contextText = '';
      if (isPriceQuery(text)) {
        contextText = await fetchDealsContext(text);
      }

      // Build message history for API
      const history = messages
        .filter(m => !m.error && m.role !== 'system')
        .slice(-10) // last 10 messages
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const userContent = contextText
        ? `${text}\n\n---\n${contextText}`
        : text;

      const apiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...history,
        { role: 'user' as const, content: userContent },
      ];

      const { text: responseText, model } = await callOpenRouter(apiMessages, apiKey);
      setCurrentModel(model.split('/').pop()?.replace(':free', '') ?? model);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        model,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ ${err.message}`,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, apiKey]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => setMessages([]);

  const hasKey = apiKey.length > 20;

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 border ${
          open
            ? 'bg-muted border-border text-muted-foreground rotate-0'
            : 'bg-primary border-primary/20 text-primary-foreground hover:scale-105 hover:shadow-primary/20'
        }`}
        title="Chat IA"
      >
        {open ? <ChevronDown className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] max-w-[400px] h-[500px] rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 bg-card shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">ProStock AI</p>
              {currentModel && (
                <p className="text-[10px] text-muted-foreground truncate">{currentModel}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat} title="Nueva conversación">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {!hasKey ? (
            <ApiKeySetup onSave={saveApiKey} />
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
                {messages.length === 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-muted-foreground">¿En qué te ayudo?</p>
                    </div>
                    <div className="space-y-1.5">
                      {SUGGESTIONS.map(s => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : msg.error
                          ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-bl-sm'
                          : 'bg-muted/60 text-foreground rounded-bl-sm'
                      }`}
                    >
                      {msg.role === 'user' || msg.error ? (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-xs leading-relaxed prose-chat">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                              h3: ({ children }) => <h3 className="font-bold text-foreground text-xs mt-3 mb-1.5 first:mt-0">{children}</h3>,
                              h2: ({ children }) => <h2 className="font-bold text-foreground text-sm mt-3 mb-1.5 first:mt-0">{children}</h2>,
                              ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-2 pl-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-2 pl-1">{children}</ol>,
                              li: ({ children }) => <li className="text-xs leading-relaxed">{children}</li>,
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-2 rounded-lg border border-border/50">
                                  <table className="w-full text-[11px] border-collapse">{children}</table>
                                </div>
                              ),
                              thead: ({ children }) => <thead className="bg-primary/10">{children}</thead>,
                              tbody: ({ children }) => <tbody>{children}</tbody>,
                              tr: ({ children }) => <tr className="border-b border-border/30 last:border-0">{children}</tr>,
                              th: ({ children }) => <th className="px-2.5 py-1.5 text-left font-semibold text-foreground">{children}</th>,
                              td: ({ children }) => <td className="px-2.5 py-1.5 text-muted-foreground">{children}</td>,
                              code: ({ children }) => <code className="bg-background/50 rounded px-1 py-0.5 font-mono text-[10px]">{children}</code>,
                              blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/40 pl-2 text-muted-foreground italic my-1">{children}</blockquote>,
                              hr: () => <hr className="border-border/40 my-2" />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      {msg.model && (
                        <p className="text-[9px] mt-1 opacity-50 truncate">
                          {msg.model.split('/').pop()?.replace(':free', '')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/60 shrink-0">
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pregunta sobre precios, deals..."
                    className="flex-1 min-h-[38px] max-h-[120px] text-xs resize-none py-2 px-3"
                    rows={1}
                    disabled={loading}
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[9px] text-muted-foreground/50">Enter para enviar · Shift+Enter nueva línea</p>
                  <Badge
                    variant="outline"
                    className="text-[8px] h-4 px-1.5 cursor-pointer hover:bg-muted/60"
                    onClick={() => {
                      localStorage.removeItem(OPENROUTER_API_KEY_LS);
                      setApiKey('');
                    }}
                    title="Cambiar API key"
                  >
                    API key ✕
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
