-- Concede acesso via Data API (PostgREST) às tabelas públicas

GRANT SELECT ON public.letters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.letters TO authenticated;
GRANT ALL ON public.letters TO service_role;

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE, INSERT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.social_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;

GRANT SELECT, INSERT ON public.shares TO anon, authenticated;
GRANT ALL ON public.shares TO service_role;

GRANT INSERT ON public.access_logs TO anon, authenticated;
GRANT SELECT ON public.access_logs TO authenticated;
GRANT ALL ON public.access_logs TO service_role;

GRANT INSERT ON public.letter_opens TO anon, authenticated;
GRANT SELECT ON public.letter_opens TO authenticated;
GRANT ALL ON public.letter_opens TO service_role;

GRANT INSERT ON public.letter_ratings TO anon, authenticated;
GRANT SELECT ON public.letter_ratings TO authenticated;
GRANT ALL ON public.letter_ratings TO service_role;

GRANT INSERT ON public.volunteer_ratings TO anon, authenticated;
GRANT SELECT ON public.volunteer_ratings TO authenticated;
GRANT ALL ON public.volunteer_ratings TO service_role;

-- visitante precisa ler de volta o log recém-criado (id) para vincular aberturas
CREATE POLICY "visitante le proprio log recente"
ON public.access_logs FOR SELECT TO anon
USING (created_at > now() - interval '12 hours');

GRANT SELECT ON public.access_logs TO anon; 
