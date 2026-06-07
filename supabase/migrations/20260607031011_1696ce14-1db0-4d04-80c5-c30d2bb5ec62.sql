
-- Achievement Management System (AMS) - Phase 1 schema
-- Super admin only; uses public.has_role(auth.uid(), 'super_admin')

-- 1) achievement_categories
CREATE TABLE public.achievement_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievement_categories TO authenticated;
GRANT ALL ON public.achievement_categories TO service_role;
ALTER TABLE public.achievement_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams cats read auth" ON public.achievement_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams cats admin write" ON public.achievement_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 2) achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.achievement_categories(id) ON DELETE SET NULL,
  applies_to_role TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  point_reward INTEGER NOT NULL DEFAULT 0,
  badge_icon TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  status TEXT NOT NULL DEFAULT 'active',
  is_repeatable BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams ach read auth" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams ach admin write" ON public.achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 3) achievement_rules
CREATE TABLE public.achievement_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  condition JSONB NOT NULL DEFAULT '{}'::jsonb,
  threshold NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievement_rules TO authenticated;
GRANT ALL ON public.achievement_rules TO service_role;
ALTER TABLE public.achievement_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams rules admin all" ON public.achievement_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 4) achievement_logs (per user unlocks)
CREATE TABLE public.achievement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  source TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_ams_logs_user ON public.achievement_logs(user_id);
CREATE INDEX idx_ams_logs_ach ON public.achievement_logs(achievement_id);
GRANT SELECT ON public.achievement_logs TO authenticated;
GRANT ALL ON public.achievement_logs TO service_role;
ALTER TABLE public.achievement_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams logs own read" ON public.achievement_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ams logs admin all" ON public.achievement_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 5) xp_transactions
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  xp_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ams_xp_user ON public.xp_transactions(user_id);
GRANT SELECT ON public.xp_transactions TO authenticated;
GRANT ALL ON public.xp_transactions TO service_role;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams xp own read" ON public.xp_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ams xp admin all" ON public.xp_transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 6) levels
CREATE TABLE public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  xp_required INTEGER NOT NULL,
  rewards JSONB NOT NULL DEFAULT '{}'::jsonb,
  benefits JSONB NOT NULL DEFAULT '{}'::jsonb,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.levels TO authenticated;
GRANT ALL ON public.levels TO service_role;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams lvl read" ON public.levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams lvl admin write" ON public.levels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 7) ranks
CREATE TABLE public.ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  tier INTEGER NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  role_scope TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ranks TO authenticated;
GRANT ALL ON public.ranks TO service_role;
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams ranks read" ON public.ranks FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams ranks admin write" ON public.ranks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 8) badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  icon TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams badges read" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams badges admin write" ON public.badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 9) trophies
CREATE TABLE public.trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL DEFAULT 'rare',
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trophies TO authenticated;
GRANT ALL ON public.trophies TO service_role;
ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams troph read" ON public.trophies FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams troph admin write" ON public.trophies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 10) reward_store
CREATE TABLE public.reward_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL,
  cost_xp INTEGER NOT NULL DEFAULT 0,
  cost_points INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stock INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reward_store TO authenticated;
GRANT ALL ON public.reward_store TO service_role;
ALTER TABLE public.reward_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams store read" ON public.reward_store FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams store admin write" ON public.reward_store FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 11) reward_transactions
CREATE TABLE public.reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_id UUID REFERENCES public.reward_store(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  cost_xp INTEGER NOT NULL DEFAULT 0,
  cost_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ams_rwd_user ON public.reward_transactions(user_id);
GRANT SELECT ON public.reward_transactions TO authenticated;
GRANT ALL ON public.reward_transactions TO service_role;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams rwd own read" ON public.reward_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ams rwd admin all" ON public.reward_transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 12) leaderboards (snapshots)
CREATE TABLE public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,
  scope_value TEXT,
  period TEXT NOT NULL,
  user_id UUID NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ams_lb_scope ON public.leaderboards(scope, period, computed_at DESC);
GRANT SELECT ON public.leaderboards TO authenticated;
GRANT ALL ON public.leaderboards TO service_role;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams lb read" ON public.leaderboards FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams lb admin write" ON public.leaderboards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 13) missions
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  goal JSONB NOT NULL DEFAULT '{}'::jsonb,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.missions TO authenticated;
GRANT ALL ON public.missions TO service_role;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams missions read" ON public.missions FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams missions admin write" ON public.missions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 14) challenges
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cadence TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  goal JSONB NOT NULL DEFAULT '{}'::jsonb,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.challenges TO authenticated;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams chal read" ON public.challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "ams chal admin write" ON public.challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 15) certificates
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  certificate_type TEXT NOT NULL,
  title TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  certificate_url TEXT
);
CREATE INDEX idx_ams_cert_user ON public.certificates(user_id);
GRANT SELECT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams cert own read" ON public.certificates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ams cert admin all" ON public.certificates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 16) celebrations
CREATE TABLE public.celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  seen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ams_celeb_user ON public.celebrations(user_id);
GRANT SELECT, UPDATE ON public.celebrations TO authenticated;
GRANT ALL ON public.celebrations TO service_role;
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams celeb own read" ON public.celebrations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ams celeb own update" ON public.celebrations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ams celeb admin all" ON public.celebrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 17) achievement_audit_logs
CREATE TABLE public.achievement_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  target_user_id UUID,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievement_audit_logs TO authenticated;
GRANT ALL ON public.achievement_audit_logs TO service_role;
ALTER TABLE public.achievement_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams audit admin all" ON public.achievement_audit_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- updated_at triggers
CREATE TRIGGER trg_ams_cats_upd BEFORE UPDATE ON public.achievement_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ams_ach_upd BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ams_rules_upd BEFORE UPDATE ON public.achievement_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ams_lvl_upd BEFORE UPDATE ON public.levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ams_ranks_upd BEFORE UPDATE ON public.ranks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ams_badges_upd BEFORE UPDATE ON public.badges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ams_troph_upd BEFORE UPDATE ON public.trophies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ams_store_upd BEFORE UPDATE ON public.reward_store FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ams_miss_upd BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ams_chal_upd BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
