import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteFooter } from "@/components/SiteFooter";
import { StarRating } from "@/components/StarRating";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel do Voluntário — Cartas Motivacionais" },
      { name: "description", content: "Seu link exclusivo e o alcance das suas cartas." },
      { property: "og:title", content: "Painel do Voluntário — Cartas Motivacionais" },
      { property: "og:description", content: "Seu link exclusivo e o alcance das suas cartas." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VolunteerPanel,
});

type Stats = {
  name: string;
  matricula: string;
  reached: number;
  shared: number;
  opens: number;
  ratings: { stars: number; comment: string | null; created_at: string }[];
};

function VolunteerPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      const [profile, logs, shares, ratings] = await Promise.all([
        supabase.from("profiles").select("name, matricula").eq("id", uid).maybeSingle(),
        supabase.from("access_logs").select("id, share_id").eq("volunteer_id", uid),
        supabase.from("shares").select("id").eq("volunteer_id", uid),
        supabase
          .from("volunteer_ratings")
          .select("stars, comment, created_at")
          .eq("volunteer_id", uid)
          .order("created_at", { ascending: false }),
      ]);
      const logIds = (logs.data ?? []).map((l) => l.id);
      let opens = 0;
      if (logIds.length) {
        const { count } = await supabase
          .from("letter_opens")
          .select("id", { count: "exact", head: true })
          .in("access_log_id", logIds);
        opens = count ?? 0;
      }
      setStats({
        name: profile.data?.name ?? "",
        matricula: profile.data?.matricula ?? "",
        reached: (logs.data ?? []).length,
        shared: (shares.data ?? []).length,
        opens,
        ratings: ratings.data ?? [],
      });
    }
    void load();
  }, []);

  const link =
    typeof window !== "undefined" && stats
      ? `${window.location.origin}/?v=${encodeURIComponent(stats.matricula)}`
      : "";

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="page-bg min-h-screen font-body text-ink">
      <header className="frost sticky top-0 z-30 border-b border-ink/10">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="leading-tight">
            <p className="font-display text-[19px] font-semibold">Painel do Voluntário</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-inksoft">
              {stats ? `${stats.name} | ${stats.matricula}` : "carregando"}
            </p>
          </div>
          <button
            onClick={() => void signOut()}
            className="rounded-full border border-ink/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-44 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
          seu link exclusivo
        </p>
        <div className="frost mt-2 rounded-[18px] p-5 ring-1 ring-ink/10">
          <p className="break-all rounded-lg bg-steel/40 p-2.5 font-mono text-[11px]">{link}</p>
          <button
            onClick={() => {
              void navigator.clipboard.writeText(link);
              toast.success("Link copiado!");
            }}
            className="mt-3 w-full rounded-xl bg-seal py-3 text-[13px] font-semibold text-ink"
          >
            Copiar link
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Destinatários" value={stats?.reached ?? 0} />
          <Stat label="Cartas abertas" value={stats?.opens ?? 0} />
          <Stat label="Compartilhamentos" value={stats?.shared ?? 0} />
        </div>

        <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
          avaliações que você recebeu
        </p>
        <div className="mt-2 space-y-2">
          {(stats?.ratings ?? []).length === 0 ? (
            <p className="text-[13px] text-inksoft">Ainda sem avaliações.</p>
          ) : (
            stats?.ratings.map((r, i) => (
              <div key={i} className="frost rounded-2xl p-4 ring-1 ring-ink/10">
                <div className="flex items-center justify-between">
                  <StarRating value={r.stars} size={16} readOnly />
                  <span className="font-mono text-[9px] text-inksoft">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {r.comment ? <p className="mt-2 text-[13px]">{r.comment}</p> : null}
              </div>
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="frost rounded-2xl p-4 text-center ring-1 ring-ink/10">
      <p className="font-display text-[28px] font-semibold leading-none">{value}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-inksoft">{label}</p>
    </div>
  );
}
