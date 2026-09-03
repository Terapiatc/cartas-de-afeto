import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { matriculaToEmail } from "@/lib/cartas";
import { adminExists, bootstrapAdmin } from "@/lib/admin.functions";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso Restrito — Cartas Motivacionais" },
      {
        name: "description",
        content: "Área de acesso para voluntários e administradores do projeto.",
      },
      { property: "og:title", content: "Acesso Restrito — Cartas Motivacionais" },
      {
        property: "og:description",
        content: "Área de acesso para voluntários e administradores do projeto.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupName, setSetupName] = useState("");

  useEffect(() => {
    void adminExists().then((r) => setNeedsSetup(!r.exists));
  }, []);

  async function routeAfterLogin(userId: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = (data ?? []).map((r) => r.role);
    void navigate({ to: roles.includes("admin") ? "/admin" : "/painel" });
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: matriculaToEmail(matricula),
      password,
    });
    setLoading(false);
    if (error || !data.user) {
      toast.error("Matrícula ou senha inválida.");
      return;
    }
    await routeAfterLogin(data.user.id);
  }

  async function createFirstAdmin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await bootstrapAdmin({
        data: { name: setupName, matricula, password },
      });
      const { data } = await supabase.auth.signInWithPassword({
        email: matriculaToEmail(matricula),
        password,
      });
      if (data.user) await routeAfterLogin(data.user.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar administrador");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-bg min-h-screen font-body text-ink">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-44 pt-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
          acesso restrito
        </p>
        <h1 className="mt-1 font-display text-[30px] font-semibold leading-[1.05]">
          {needsSetup ? "Primeiro acesso" : "Voluntários e administração"}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-inksoft">
          {needsSetup
            ? "Nenhum administrador cadastrado ainda. Crie o primeiro acesso administrativo."
            : "Informe sua matrícula e senha para continuar."}
        </p>

        <form
          onSubmit={needsSetup ? createFirstAdmin : signIn}
          className="frost mt-5 space-y-3 rounded-[18px] p-5 ring-1 ring-ink/10"
        >
          {needsSetup ? (
            <input
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              placeholder="Nome do administrador"
              aria-label="Nome do administrador"
              className="w-full rounded-xl bg-white/70 px-3 py-2.5 text-[14px] ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-seal/60"
            />
          ) : null}
          <input
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            placeholder="Matrícula"
            aria-label="Matrícula"
            className="w-full rounded-xl bg-white/70 px-3 py-2.5 text-[14px] ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-seal/60"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            aria-label="Senha"
            className="w-full rounded-xl bg-white/70 px-3 py-2.5 text-[14px] ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-seal/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-ink py-3 text-[13px] font-medium text-paper disabled:opacity-60"
          >
            {needsSetup ? "Criar administrador" : "Entrar"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
