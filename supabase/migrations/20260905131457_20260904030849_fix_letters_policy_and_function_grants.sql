DROP POLICY "cartas ativas públicas" ON public.letters;
CREATE POLICY "cartas ativas públicas" ON public.letters FOR SELECT TO anon USING (active);
CREATE POLICY "cartas visiveis logado" ON public.letters FOR SELECT TO authenticated
  USING (active OR private.has_role(auth.uid(), 'admin'));

REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;