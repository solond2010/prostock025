-- ============================================================
-- Migración: Sistema unificado (Deals del bot + Tareas + Agenda)
-- Fecha: 2026-05-28
-- ============================================================

-- ============================================================
-- TABLA: deals (ofertas detectadas por el bot Wallapop)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Datos del anuncio
  item_id TEXT NOT NULL,             -- id interno del anuncio en wallapop
  item_url TEXT NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC(10,2),
  description TEXT,
  image_url TEXT,
  location TEXT,
  seller_id TEXT,
  search_keyword TEXT,

  -- Scoring / categorización
  score TEXT CHECK (score IN ('fire', 'good', 'ok')) DEFAULT 'ok',
  is_archived BOOLEAN DEFAULT FALSE,

  -- Estado de contacto
  message_status TEXT CHECK (message_status IN ('pending', 'sent', 'failed', 'skipped')) DEFAULT 'pending',
  message_sent_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_deals_user_created ON public.deals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_user_status ON public.deals(user_id, message_status);
CREATE INDEX IF NOT EXISTS idx_deals_user_score ON public.deals(user_id, score);

-- ============================================================
-- TABLA: tasks (tareas tipo Apple Notes/Reminders)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  notes TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  is_done BOOLEAN DEFAULT FALSE,
  due_date DATE,

  -- Vinculación opcional a un producto del stock o a un deal
  linked_stock_id UUID,
  linked_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_done ON public.tasks(user_id, is_done, due_date);

-- ============================================================
-- TABLA: events (citas / agenda con clientes y compras)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('sale', 'purchase', 'repair', 'other')) DEFAULT 'other',

  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT,
  contact_name TEXT,
  contact_phone TEXT,

  -- Económico
  amount NUMERIC(10,2),

  -- Vinculación opcional
  linked_stock_id UUID,
  linked_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,

  -- Google Calendar sync (opcional, fase 2)
  google_event_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_starts ON public.events(user_id, starts_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo ve / edita sus propios registros
CREATE POLICY "deals_select_own" ON public.deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "deals_insert_own" ON public.deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "deals_update_own" ON public.deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "deals_delete_own" ON public.deals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "events_select_own" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "events_insert_own" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_update_own" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "events_delete_own" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- REALTIME: habilitar Realtime en las 3 tablas para feed en vivo
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
