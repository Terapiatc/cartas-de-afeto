CREATE TYPE public.app_role AS ENUM ('admin', 'volunteer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  matricula text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "profiles públicos" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin gerencia profiles" ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "usuário vê próprio papel" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  title text NOT NULL,
  body_html text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.letters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.letters TO authenticated;
GRANT ALL ON public.letters TO service_role;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cartas ativas públicas" ON public.letters FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin gerencia cartas" ON public.letters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  institutional_text text NOT NULL DEFAULT '',
  ombudsman_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config pública" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin edita config" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "redes públicas" ON public.social_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin gerencia redes" ON public.social_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  letter_id uuid REFERENCES public.letters(id) ON DELETE SET NULL,
  volunteer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name text,
  anonymous boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.shares TO anon;
GRANT SELECT, INSERT ON public.shares TO authenticated;
GRANT ALL ON public.shares TO service_role;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "share público" ON public.shares FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "qualquer um cria share" ON public.shares FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  volunteer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  share_id uuid REFERENCES public.shares(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.access_logs TO anon;
GRANT SELECT, INSERT ON public.access_logs TO authenticated;
GRANT ALL ON public.access_logs TO service_role;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visitante cria log" ON public.access_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin e voluntário leem logs" ON public.access_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR volunteer_id = auth.uid());

ALTER TABLE public.shares ADD COLUMN access_log_id uuid REFERENCES public.access_logs(id) ON DELETE SET NULL;

CREATE TABLE public.letter_opens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_log_id uuid NOT NULL REFERENCES public.access_logs(id) ON DELETE CASCADE,
  letter_id uuid NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.letter_opens TO anon;
GRANT SELECT, INSERT ON public.letter_opens TO authenticated;
GRANT ALL ON public.letter_opens TO service_role;
ALTER TABLE public.letter_opens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visitante registra abertura" ON public.letter_opens FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin e voluntário leem aberturas" ON public.letter_opens FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.access_logs l WHERE l.id = access_log_id AND l.volunteer_id = auth.uid()));

CREATE TABLE public.letter_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_log_id uuid REFERENCES public.access_logs(id) ON DELETE SET NULL,
  letter_id uuid NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  stars smallint NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.letter_ratings TO anon;
GRANT SELECT, INSERT ON public.letter_ratings TO authenticated;
GRANT ALL ON public.letter_ratings TO service_role;
ALTER TABLE public.letter_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visitante avalia carta" ON public.letter_ratings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin e voluntário leem avaliações de carta" ON public.letter_ratings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.access_logs l WHERE l.id = access_log_id AND l.volunteer_id = auth.uid()));

CREATE TABLE public.volunteer_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_log_id uuid REFERENCES public.access_logs(id) ON DELETE SET NULL,
  volunteer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stars smallint NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.volunteer_ratings TO anon;
GRANT SELECT, INSERT ON public.volunteer_ratings TO authenticated;
GRANT ALL ON public.volunteer_ratings TO service_role;
ALTER TABLE public.volunteer_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visitante avalia voluntário" ON public.volunteer_ratings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin e voluntário leem avaliações de voluntário" ON public.volunteer_ratings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR volunteer_id = auth.uid());

INSERT INTO public.site_settings (id, institutional_text, ombudsman_url) VALUES
  (true, 'Projeto social sem fins lucrativos. Cada carta é doada por voluntários que acreditam na força de um gesto.', 'https://exemplo.org/ouvidoria');

INSERT INTO public.social_links (label, url, sort_order) VALUES
  ('Instagram', 'https://instagram.com', 1),
  ('WhatsApp', 'https://wa.me/5511999999999', 2);

INSERT INTO public.letters (number, title, body_html) VALUES
  (1, 'Você é mais forte do que imagina', '<p>{name},</p><p>Encontrei esta carta e, antes de abri-la, já sabia que seria para você. <b>Não precisa ser perfeito hoje</b> — basta continuar caminhando.</p><p>As manhãs difíceis também passam. <i>Respira, um passo de cada vez.</i></p><p style="text-align:right"><i>Com carinho</i></p>'),
  (2, 'Um recomeço cabe em qualquer dia', '<p>Oi, {name}.</p><p>Ninguém combinou que a vida seria em linha reta. Recomeçar não apaga o caminho — <b>ele conta como parte da história</b>.</p><p><u>Hoje pode ser o primeiro dia de novo.</u></p>'),
  (3, 'Você não está sozinha nessa', '<p>{name}, existe gente torcendo por você mesmo sem te conhecer.</p><p>Esta carta é a prova: alguém sentou, pensou em você e escreveu.</p><p><i>Guarde isso.</i></p>'),
  (4, 'Respire, o cansaço também passa', '<p>{name},</p><p>Descansar não é desistir. É parte de continuar.</p><p><b>Permita-se parar hoje</b> — amanhã você segue.</p>'),
  (5, 'O que você fez até aqui já é muito', '<p>Querido(a) {name},</p><p>Você provavelmente não lembra de metade das coisas difíceis que já atravessou. <i>Mas atravessou.</i></p><p>Isso é força.</p>'),
  (6, 'Que hoje seja um pouco mais leve', '<p>{name},</p><p>Não desejo perfeição para o seu dia. Desejo <b>leveza</b>.</p><p>Um café quente, uma boa notícia, um respiro.</p>');