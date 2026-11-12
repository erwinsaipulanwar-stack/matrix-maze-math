CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  nickname text NOT NULL DEFAULT 'Teman Mahtrix',
  avatar text NOT NULL DEFAULT 'fox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.lesson_progress (
  user_id uuid NOT NULL,
  lesson_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own lessons select" ON public.lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own lessons insert" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own lessons update" ON public.lesson_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own lessons delete" ON public.lesson_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.practice_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic_id text NOT NULL,
  correct integer NOT NULL CHECK (correct >= 0),
  total integer NOT NULL CHECK (total > 0 AND correct <= total),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX practice_attempts_user_idx ON public.practice_attempts(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.practice_attempts TO authenticated;
GRANT ALL ON public.practice_attempts TO service_role;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own practice select" ON public.practice_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own practice insert" ON public.practice_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.evaluation_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  correct integer NOT NULL CHECK (correct >= 0),
  total integer NOT NULL CHECK (total > 0 AND correct <= total),
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX evaluation_attempts_user_idx ON public.evaluation_attempts(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.evaluation_attempts TO authenticated;
GRANT ALL ON public.evaluation_attempts TO service_role;
ALTER TABLE public.evaluation_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own eval select" ON public.evaluation_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own eval insert" ON public.evaluation_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nickname, avatar)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), split_part(NEW.email, '@', 1)),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'nickname', ''), 'Teman Mahtrix'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'avatar', ''), 'fox')
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();