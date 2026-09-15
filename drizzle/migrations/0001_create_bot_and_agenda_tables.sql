-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  plan text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- DEALS
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  item_id text NOT NULL,
  item_url text NOT NULL,
  title text NOT NULL,
  price numeric,
  description text,
  image_url text,
  location text,
  seller_id text,
  search_keyword text,
  score text NOT NULL DEFAULT 'ok',
  is_archived boolean NOT NULL DEFAULT false,
  message_status text NOT NULL DEFAULT 'pending',
  message_sent_at timestamptz,
  pipeline_status text DEFAULT 'found',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX deals_user_created_idx ON public.deals (user_id, created_at DESC);
CREATE UNIQUE INDEX deals_user_item_idx ON public.deals (user_id, item_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deals" ON public.deals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BOT STATUS
CREATE TABLE public.bot_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid(),
  is_running boolean NOT NULL DEFAULT false,
  pid integer,
  started_at timestamptz,
  last_search_at timestamptz,
  next_search_at timestamptz,
  current_search text,
  searches_today integer NOT NULL DEFAULT 0,
  messages_today integer NOT NULL DEFAULT 0,
  items_seen_today integer NOT NULL DEFAULT 0,
  last_logs text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_status TO authenticated;
GRANT ALL ON public.bot_status TO service_role;
ALTER TABLE public.bot_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bot_status" ON public.bot_status FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_bot_status_updated_at BEFORE UPDATE ON public.bot_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BOT COMMANDS
CREATE TABLE public.bot_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  command text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_commands TO authenticated;
GRANT ALL ON public.bot_commands TO service_role;
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bot_commands" ON public.bot_commands FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BOT MESSAGES
CREATE TABLE public.bot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  text text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_messages TO authenticated;
GRANT ALL ON public.bot_messages TO service_role;
ALTER TABLE public.bot_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bot_messages" ON public.bot_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BOT SEARCHES
CREATE TABLE public.bot_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  keywords text NOT NULL,
  order_by text NOT NULL DEFAULT 'newest',
  time_filter text NOT NULL DEFAULT 'today',
  distance_km numeric,
  lat numeric,
  lng numeric,
  min_price numeric,
  max_price numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_searches TO authenticated;
GRANT ALL ON public.bot_searches TO service_role;
ALTER TABLE public.bot_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bot_searches" ON public.bot_searches FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TASKS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  notes text,
  priority text NOT NULL DEFAULT 'medium',
  is_done boolean NOT NULL DEFAULT false,
  due_date date,
  linked_stock_id uuid,
  linked_deal_id uuid,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'other',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  contact_name text,
  contact_phone text,
  amount numeric,
  linked_stock_id uuid,
  linked_deal_id uuid,
  google_event_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own events" ON public.events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- REALTIME
ALTER TABLE public.deals REPLICA IDENTITY FULL;
ALTER TABLE public.bot_status REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_status;