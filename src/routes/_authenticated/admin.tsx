import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteFooter } from "@/components/SiteFooter";
import { StarRating } from "@/components/StarRating";
import { RichTextEditor } from "@/components/RichTextEditor";
import { createVolunteer, deleteVolunteer } from "@/lib/admin.functions";
import { padNumber, type Letter } from "@/lib/cartas";
import { SOCIAL_ICONS, getSocialIcon } from "@/lib/social-icons";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração — Cartas Motivacionais" },
      { name: "description", content: "Gestão de cartas, voluntários, rodapé e relatórios." },
      { property: "og:title", content: "Administração — Cartas Motivacionais" },
      {
        property: "og:description",
        content: "Gestão de cartas, voluntários, rodapé e relatórios.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const TABS = ["Cartas", "Voluntários", "Rodapé", "Relatórios"] as const;
type Tab = (typeof TABS)[number];

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Cartas");
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setAllowed(false);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setAllowed(Boolean(data));
    }
    void check();
  }, []);

  if (allowed === false) {
    return (
      <div className="page-bg grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-display text-2xl font-semibold">Acesso restrito</p>
          <p className="mt-2 text-[13px] text-inksoft">
            Esta área é exclusiva para administradores.
          </p>
          <button
            onClick={() => void navigate({ to: "/painel" })}
            className="mt-5 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-medium text-paper"
          >
            Ir para meu painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen font-body text-ink">
      <header className="frost sticky top-0 z-30 border-b border-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="leading-tight">
            <p className="font-display text-[19px] font-semibold">Administração</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-inksoft">
              cartas motivacionais
            </p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              void navigate({ to: "/auth", replace: true });
            }}
            className="rounded-full border border-ink/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider"
          >
            Sair
          </button>
        </div>
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider " +
                (tab === t ? "bg-ink text-paper" : "text-inksoft hover:bg-steel/50")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-44 pt-6">
        {allowed === null ? (
          <p className="text-[13px] text-inksoft">Carregando…</p>
        ) : tab === "Cartas" ? (
          <LettersTab />
        ) : tab === "Voluntários" ? (
          <VolunteersTab />
        ) : tab === "Rodapé" ? (
          <FooterTab />
        ) : (
          <ReportsTab />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

const cardCls = "frost rounded-[18px] p-5 ring-1 ring-ink/10";
const inputCls =
  "w-full rounded-xl bg-white/70 px-3 py-2.5 text-[14px] ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-seal/60";
const primaryCls = "rounded-xl bg-ink px-4 py-2.5 text-[13px] font-medium text-paper";

/* ---------------- Cartas ---------------- */

function LettersTab() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [editing, setEditing] = useState<Partial<Letter> | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("letters")
      .select("id, number, title, body_html, active")
      .order("number");
    setLetters((data as Letter[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!editing?.title?.trim() || !editing.number) {
      toast.error("Informe número e título.");
      return;
    }
    const payload = {
      number: Number(editing.number),
      title: editing.title.trim().slice(0, 160),
      body_html: editing.body_html ?? "",
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("letters").update(payload).eq("id", editing.id)
      : await supabase.from("letters").insert(payload);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Número já usado." : "Erro ao salvar.");
      return;
    }
    toast.success("Carta salva.");
    setEditing(null);
    void load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("letters").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir.");
    else void load();
  }

  return (
    <div className="space-y-4">
      {editing ? (
        <div className={cardCls}>
          <p className="font-display text-[20px] font-semibold">
            {editing.id ? "Editar carta" : "Nova carta"}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[110px_1fr]">
            <input
              type="number"
              min={1}
              value={editing.number ?? ""}
              onChange={(e) => setEditing({ ...editing, number: Number(e.target.value) })}
              placeholder="Nº"
              aria-label="Número da carta"
              className={inputCls}
            />
            <input
              value={editing.title ?? ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Título (será exibido em CAIXA ALTA)"
              aria-label="Título da carta"
              className={inputCls}
            />
          </div>
          <div className="mt-3">
            <RichTextEditor
              value={editing.body_html ?? ""}
              onChange={(html) => setEditing((prev) => ({ ...prev, body_html: html }))}
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={editing.active ?? true}
              onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
            />
            Carta ativa (visível aos destinatários)
          </label>
          <div className="mt-4 flex gap-2">
            <button onClick={() => void save()} className={primaryCls}>
              Salvar
            </button>
            <button
              onClick={() => setEditing(null)}
              className="rounded-xl border border-ink/15 px-4 py-2.5 text-[13px]"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() =>
            setEditing({
              number: (letters.at(-1)?.number ?? 0) + 1,
              title: "",
              body_html: "<p>{name},</p><p></p>",
              active: true,
            })
          }
          className="w-full rounded-xl bg-seal py-3 text-[13px] font-semibold text-ink"
        >
          + Nova carta
        </button>
      )}

      <div className="space-y-2">
        {letters.map((l) => (
          <div key={l.id} className={cardCls}>
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-seal font-mono text-[11px] font-medium ring-1 ring-ink/10">
                {padNumber(l.number)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold uppercase">{l.title}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-inksoft">
                  {l.active ? "ativa" : "inativa"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setEditing(l)}
                  className="rounded-lg border border-ink/15 px-2.5 py-1 font-mono text-[10px] uppercase"
                >
                  Editar
                </button>
                <button
                  onClick={() => void remove(l.id)}
                  className="rounded-lg border border-destructive/40 px-2.5 py-1 font-mono text-[10px] uppercase text-destructive"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Voluntários ---------------- */

function VolunteersTab() {
  const [list, setList] = useState<{ id: string; name: string; matricula: string }[]>([]);
  const [form, setForm] = useState({ name: "", email: "", matricula: "", password: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "volunteer");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (!ids.length) return setList([]);
    const { data } = await supabase
      .from("profiles")
      .select("id, name, matricula")
      .in("id", ids)
      .order("name");
    setList(data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function add() {
    setBusy(true);
    try {
      await createVolunteer({ data: form });
      toast.success("Voluntário cadastrado.");
      setForm({ name: "", email: "", matricula: "", password: "" });
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <p className="font-display text-[20px] font-semibold">Cadastrar voluntário</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nome"
            aria-label="Nome"
            className={inputCls}
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="E-mail"
            aria-label="E-mail"
            className={inputCls}
          />
          <input
            value={form.matricula}
            onChange={(e) => setForm({ ...form, matricula: e.target.value })}
            placeholder="Matrícula"
            aria-label="Matrícula"
            className={inputCls}
          />
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Senha provisória (mín. 8)"
            aria-label="Senha provisória"
            className={inputCls}
          />
        </div>
        <button
          onClick={() => void add()}
          disabled={busy}
          className={primaryCls + " mt-4 disabled:opacity-60"}
        >
          Cadastrar
        </button>
      </div>

      <div className="space-y-2">
        {list.map((v) => (
          <div key={v.id} className={cardCls + " flex items-center gap-3"}>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{v.name}</p>
              <p className="font-mono text-[10px] text-inksoft">
                matrícula {v.matricula} · /?v={v.matricula}
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  await deleteVolunteer({ data: { id: v.id } });
                  void load();
                } catch {
                  toast.error("Erro ao excluir");
                }
              }}
              className="rounded-lg border border-destructive/40 px-2.5 py-1 font-mono text-[10px] uppercase text-destructive"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Rodapé ---------------- */

function FooterTab() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<{ id: string; label: string; url: string; icon: string }[]>([]);
  const [newLink, setNewLink] = useState({ label: "", url: "", icon: "link" });

  const load = useCallback(async () => {
    const [s, l] = await Promise.all([
      supabase.from("site_settings").select("institutional_text, ombudsman_url").maybeSingle(),
      supabase.from("social_links").select("id, label, url, icon").order("sort_order"),
    ]);
    setText(s.data?.institutional_text ?? "");
    setUrl(s.data?.ombudsman_url ?? "");
    setLinks(l.data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings() {
    const { error } = await supabase
      .from("site_settings")
      .update({ institutional_text: text.slice(0, 1000), ombudsman_url: url.slice(0, 500) })
      .eq("id", true);
    if (error) toast.error("Erro ao salvar.");
    else toast.success("Rodapé atualizado.");
  }

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <p className="font-display text-[20px] font-semibold">Texto institucional</p>
        <textarea
          rows={3}
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
          aria-label="Texto institucional"
          className={inputCls + " mt-3 resize-none"}
        />
        <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-inksoft">
          URL da Ouvidoria
        </p>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          aria-label="URL da Ouvidoria"
          className={inputCls + " mt-1"}
        />
        <button onClick={() => void saveSettings()} className={primaryCls + " mt-4"}>
          Salvar
        </button>
      </div>

      <div className={cardCls}>
        <p className="font-display text-[20px] font-semibold">Redes sociais</p>
        <div className="mt-3 space-y-2">
          {links.map((l) => {
            const ActiveIcon = getSocialIcon(l.icon ?? "link");
            return (
              <div key={l.id} className="flex flex-wrap items-center gap-2">
                <select
                  value={l.icon ?? "link"}
                  onChange={(e) =>
                    setLinks(links.map((x) => (x.id === l.id ? { ...x, icon: e.target.value } : x)))
                  }
                  aria-label="Ícone"
                  className={inputCls + " w-36 shrink-0"}
                >
                  {SOCIAL_ICONS.map((e) => (
                    <option key={e.key} value={e.key}>{e.label}</option>
                  ))}
                </select>
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-steel/40 ring-1 ring-ink/10">
                  <ActiveIcon className="size-4 text-ink" strokeWidth={1.75} />
                </div>
                <input
                  value={l.label}
                  onChange={(e) =>
                    setLinks(links.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)))
                  }
                  aria-label="Rótulo"
                  className={inputCls + " w-28 shrink-0"}
                />
                <input
                  value={l.url}
                  onChange={(e) =>
                    setLinks(links.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)))
                }
                aria-label="URL"
                className={inputCls + " min-w-0 flex-1"}
              />
              <button
                onClick={async () => {
                  await supabase
                    .from("social_links")
                    .update({ label: l.label, url: l.url, icon: l.icon })
                    .eq("id", l.id);
                  toast.success("Atualizado.");
                }}
                className="rounded-lg border border-ink/15 px-2.5 py-2 font-mono text-[10px] uppercase"
              >
                Salvar
              </button>
              <button
                onClick={async () => {
                  await supabase.from("social_links").delete().eq("id", l.id);
                  void load();
                }}
                className="rounded-lg border border-destructive/40 px-2.5 py-2 font-mono text-[10px] uppercase text-destructive"
              >
                Remover
              </button>
            </div>
          );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
          <select
            value={newLink.icon}
            onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
            aria-label="Ícone da nova rede"
            className={inputCls + " w-36 shrink-0"}
          >
            {SOCIAL_ICONS.map((e) => (
              <option key={e.key} value={e.key}>{e.label}</option>
            ))}
          </select>
          <input
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            placeholder="Rótulo"
            aria-label="Novo rótulo"
            className={inputCls + " w-28 shrink-0"}
          />
          <input
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="https://…"
            aria-label="Nova URL"
            className={inputCls + " min-w-0 flex-1"}
          />
          <button
            onClick={async () => {
              if (!newLink.label.trim() || !newLink.url.trim()) return;
              await supabase
                .from("social_links")
                .insert({ ...newLink, sort_order: links.length + 1 });
              setNewLink({ label: "", url: "", icon: "link" });
              void load();
            }}
            className={primaryCls}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Relatórios ---------------- */

type LogRow = {
  id: string;
  visitor_name: string;
  created_at: string;
  volunteer_id: string | null;
  share_id: string | null;
};

function ReportsTab() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [volunteerFilter, setVolunteerFilter] = useState("");
  const [volunteers, setVolunteers] = useState<{ id: string; name: string; matricula: string }[]>(
    [],
  );
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [opens, setOpens] = useState<{ access_log_id: string; letter_id: string }[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [letterRatings, setLetterRatings] = useState<
    { access_log_id: string | null; letter_id: string; stars: number; comment: string | null; created_at: string }[]
  >([]);
  const [volRatings, setVolRatings] = useState<
    { access_log_id: string | null; volunteer_id: string; stars: number; comment: string | null; created_at: string }[]
  >([]);
  const [shares, setShares] = useState<
    { id: string; access_log_id: string | null; volunteer_id: string | null }[]
  >([]);

  const load = useCallback(async () => {
    let logQuery = supabase
      .from("access_logs")
      .select("id, visitor_name, created_at, volunteer_id, share_id")
      .order("created_at", { ascending: false });
    if (from) logQuery = logQuery.gte("created_at", from);
    if (to) logQuery = logQuery.lte("created_at", `${to}T23:59:59`);
    if (volunteerFilter) logQuery = logQuery.eq("volunteer_id", volunteerFilter);

    const [logRes, openRes, lettersRes, lrRes, vrRes, sharesRes, profRes, rolesRes] =
      await Promise.all([
        logQuery,
        supabase.from("letter_opens").select("access_log_id, letter_id"),
        supabase.from("letters").select("id, number, title, body_html, active").order("number"),
        supabase
          .from("letter_ratings")
          .select("access_log_id, letter_id, stars, comment, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("volunteer_ratings")
          .select("access_log_id, volunteer_id, stars, comment, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("shares").select("id, access_log_id, volunteer_id"),
        supabase.from("profiles").select("id, name, matricula").order("name"),
        supabase.from("user_roles").select("user_id").eq("role", "volunteer"),
      ]);

    const volIds = new Set((rolesRes.data ?? []).map((r) => r.user_id));
    setVolunteers((profRes.data ?? []).filter((p) => volIds.has(p.id)));
    setLogs((logRes.data as LogRow[]) ?? []);
    setOpens(openRes.data ?? []);
    setLetters((lettersRes.data as Letter[]) ?? []);
    setLetterRatings(lrRes.data ?? []);
    setVolRatings(vrRes.data ?? []);
    setShares(sharesRes.data ?? []);
  }, [from, to, volunteerFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const nameOf = (id: string | null) =>
    volunteers.find((v) => v.id === id)?.name ?? (id ? "—" : "Acesso direto");
  const letterOf = (id: string) => {
    const l = letters.find((x) => x.id === id);
    return l ? `nº ${padNumber(l.number)} · ${l.title}` : "—";
  };

  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <p className="font-mono text-[10px] uppercase tracking-wider text-inksoft">filtros</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="Data inicial"
            className={inputCls}
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="Data final"
            className={inputCls}
          />
          <select
            value={volunteerFilter}
            onChange={(e) => setVolunteerFilter(e.target.value)}
            aria-label="Voluntário"
            className={inputCls}
          >
            <option value="">Todos os voluntários</option>
            {volunteers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.matricula})
              </option>
            ))}
          </select>
        </div>
      </div>

      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
          desempenho dos voluntários
        </p>
        <div className="mt-2 space-y-2">
          {volunteers.map((v) => {
            const own = logs.filter((l) => l.volunteer_id === v.id && !l.share_id);
            const derived = logs.filter((l) => l.volunteer_id === v.id && l.share_id);
            const ids = logs.filter((l) => l.volunteer_id === v.id).map((l) => l.id);
            const openCount = opens.filter((o) => ids.includes(o.access_log_id)).length;
            const shareCount = shares.filter((s) => s.volunteer_id === v.id).length;
            return (
              <div key={v.id} className={cardCls}>
                <p className="text-[14px] font-medium">
                  {v.name} <span className="font-mono text-[10px] text-inksoft">{v.matricula}</span>
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                  <Mini label="próprios" value={own.length} />
                  <Mini label="compartilhados" value={derived.length} />
                  <Mini label="cartas abertas" value={openCount} />
                  <Mini label="compartilhamentos" value={shareCount} />
                </div>
              </div>
            );
          })}
          {volunteers.length === 0 ? (
            <p className="text-[13px] text-inksoft">Nenhum voluntário cadastrado.</p>
          ) : null}
        </div>
      </section>

      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
          logs de acesso
        </p>
        <div className="mt-2 space-y-2">
          {logs.map((log) => {
            const logOpens = opens.filter((o) => o.access_log_id === log.id);
            const lr = letterRatings.filter((r) => r.access_log_id === log.id);
            const vr = volRatings.filter((r) => r.access_log_id === log.id);
            const derivedShares = shares.filter((s) => s.access_log_id === log.id).map((s) => s.id);
            const derivedVisitors = logs.filter(
              (l) => l.share_id && derivedShares.includes(l.share_id),
            ).length;
            return (
              <div key={log.id} className={cardCls}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-medium">{log.visitor_name}</p>
                    <p className="font-mono text-[10px] text-inksoft">
                      voluntário: {nameOf(log.volunteer_id)}
                      {log.share_id ? " · via compartilhamento" : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[9px] text-inksoft">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-inksoft">
                  {logOpens.length} carta(s) aberta(s) · {derivedVisitors} destinatário(s) derivado(s)
                </p>
                {logOpens.length ? (
                  <ul className="mt-1 space-y-0.5">
                    {logOpens.map((o, i) => (
                      <li key={i} className="font-mono text-[10px] text-ink/70">
                        {letterOf(o.letter_id)}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {lr.map((r, i) => (
                  <div key={`lr${i}`} className="mt-2 rounded-lg bg-steel/40 p-2.5">
                    <div className="flex items-center gap-2">
                      <StarRating value={r.stars} size={14} readOnly />
                      <span className="font-mono text-[9px] uppercase text-inksoft">
                        carta {letterOf(r.letter_id)}
                      </span>
                    </div>
                    {r.comment ? <p className="mt-1 text-[12px]">{r.comment}</p> : null}
                  </div>
                ))}
                {vr.map((r, i) => (
                  <div key={`vr${i}`} className="mt-2 rounded-lg bg-seal/15 p-2.5">
                    <div className="flex items-center gap-2">
                      <StarRating value={r.stars} size={14} readOnly />
                      <span className="font-mono text-[9px] uppercase text-inksoft">
                        voluntário {nameOf(r.volunteer_id)}
                      </span>
                    </div>
                    {r.comment ? <p className="mt-1 text-[12px]">{r.comment}</p> : null}
                  </div>
                ))}
              </div>
            );
          })}
          {logs.length === 0 ? (
            <p className="text-[13px] text-inksoft">Nenhum acesso no período.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-steel/40 p-2">
      <p className="font-display text-[20px] font-semibold leading-none">{value}</p>
      <p className="font-mono text-[8px] uppercase tracking-wider text-inksoft">{label}</p>
    </div>
  );
}
