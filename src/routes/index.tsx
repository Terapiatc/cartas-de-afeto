import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteFooter } from "@/components/SiteFooter";
import { StarRating } from "@/components/StarRating";
import { socialImageMeta } from "@/lib/site";

import {
  clearSession,
  loadSession,
  makeToken,
  padNumber,
  renderLetterHtml,
  saveSession,
  type Letter,
  type Origin,
  type VisitorSession,
} from "@/lib/cartas";

type Search = { v?: string | undefined; s?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    v: typeof search["v"] === "string" ? search["v"] : undefined,
    s: typeof search["s"] === "string" ? search["s"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Cartas Motivacionais — uma carta chegou para você" },
      {
        name: "description",
        content:
          "Escolha um envelope e leia uma carta de apoio escrita por voluntários do projeto Cartas Motivacionais.",
      },
      { property: "og:title", content: "Cartas Motivacionais — uma carta chegou para você" },
      {
        property: "og:description",
        content: "Escolha um envelope e leia uma carta de apoio escrita por voluntários.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      ...socialImageMeta(),
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),

  component: VisitorPage,
});

function VisitorPage() {
  const search = Route.useSearch();
  const [origin, setOrigin] = useState<Origin>({ kind: "direct" });
  const [letters, setLetters] = useState<Letter[]>([]);
  const [session, setSession] = useState<VisitorSession | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [openLetter, setOpenLetter] = useState<Letter | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  useEffect(() => {
    supabase
      .from("letters")
      .select("id, number, title, body_html, active")
      .eq("active", true)
      .order("number")
      .then(({ data }) => setLetters((data as Letter[]) ?? []));
  }, []);

  useEffect(() => {
    async function resolveOrigin() {
      if (search.v) {
        const { data } = await supabase
          .from("profiles")
          .select("id, name, matricula")
          .eq("matricula", search.v)
          .maybeSingle();
        if (data)
          setOrigin({
            kind: "volunteer",
            name: data.name,
            matricula: data.matricula,
            volunteerId: data.id,
          });
        return;
      }
      if (search.s) {
        const { data } = await supabase
          .from("shares")
          .select("id, sender_name, anonymous, volunteer_id")
          .eq("token", search.s)
          .maybeSingle();
        if (data)
          setOrigin({
            kind: "share",
            senderName: data.anonymous ? null : data.sender_name,
            volunteerId: data.volunteer_id,
            shareId: data.id,
          });
      }
    }
    void resolveOrigin();
  }, [search.v, search.s]);

  async function startSession(e: React.FormEvent) {
    e.preventDefault();
    const name = nameInput.trim().slice(0, 40);
    if (!name) return;
    const { data, error } = await supabase
      .from("access_logs")
      .insert({
        visitor_name: name,
        volunteer_id: origin.kind === "volunteer" ? origin.volunteerId : (origin.kind === "share" ? origin.volunteerId : null),
        share_id: origin.kind === "share" ? origin.shareId : null,
      })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Não conseguimos iniciar sua sessão. Tente novamente.");
      return;
    }
    const next = { name, accessLogId: data.id, readLetterIds: [] };
    saveSession(next);
    setSession(next);
  }

  async function openCard(letter: Letter) {
    setOpenLetter(letter);
    setShareOpen(false);
    if (!session) return;
    if (!session.readLetterIds.includes(letter.id)) {
      const next = { ...session, readLetterIds: [...session.readLetterIds, letter.id] };
      saveSession(next);
      setSession(next);
      await supabase
        .from("letter_opens")
        .insert({ access_log_id: session.accessLogId, letter_id: letter.id });
    }
    if (typeof window !== "undefined") {
      window.setTimeout(
        () => document.getElementById("carta-aberta")?.scrollIntoView({ behavior: "smooth" }),
        60,
      );
    }
  }

  function drawRandom() {
    const unread = letters.filter((l) => !session?.readLetterIds.includes(l.id));
    const pool = unread.length > 0 ? unread : [];
    if (pool.length === 0) {
      toast("Você já leu todas as cartas desta sessão. Escolha uma para reler.");
      return;
    }
    void openCard(pool[Math.floor(Math.random() * pool.length)]!);
  }

  const originLabel = useMemo(() => {
    if (origin.kind === "volunteer")
      return (
        <>
          Voluntário: <span className="font-medium">{origin.name.toUpperCase()}</span>{" "}
          <span className="text-inksoft">| {origin.matricula}</span>
        </>
      );
    if (origin.kind === "share")
      return (
        <>
          Remetente:{" "}
          <span className="font-medium">
            {(origin.senderName ?? "ANÔNIMO").toUpperCase()}
          </span>
        </>
      );
    return <span className="text-inksoft">Acesso direto</span>;
  }, [origin]);

  return (
    <div className="page-bg min-h-screen font-body text-ink">
      <header className="frost sticky top-0 z-30 border-b border-ink/10">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-full bg-seal text-ink ring-1 ring-ink/10">
              <span className="font-mono text-[11px] font-medium">CM</span>
            </div>
            <div className="leading-tight">
              <p className="font-display text-[19px] font-semibold">Cartas Motivacionais</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-inksoft">
                correspondência de afeto
              </p>
            </div>
          </div>
        </div>
        <div className="frost border-t border-ink/10 bg-steel/40">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2">
            <p className="font-mono text-[10px] tracking-wide text-ink/80">{originLabel}</p>
            {session ? (
              <button
                onClick={() => {
                  clearSession();
                  setSession(null);
                  setOpenLetter(null);
                }}
                className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-inksoft hover:text-ink"
              >
                destinatário: <span className="text-ink">{session.name}</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-44">
        {!session ? (
          <section className="rise pt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
              (a) quem está lendo
            </p>
            <h1 className="mt-1 font-display text-[30px] font-semibold leading-[1.05]">
              Uma carta chegou para <span className="italic">você</span>.
            </h1>
            <p className="mt-1.5 max-w-[40ch] text-[13px] leading-relaxed text-inksoft">
              Descole o lacre, desdobre o papel. Antes disso, conte só o seu primeiro nome.
            </p>
            <form onSubmit={startSession} className="mt-5 flex gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={40}
                placeholder="Seu primeiro nome"
                aria-label="Seu primeiro nome"
                className="min-w-0 flex-1 rounded-xl bg-white/70 px-4 py-3 text-[14px] ring-1 ring-ink/10 placeholder:text-inksoft/70 focus:outline-none focus:ring-2 focus:ring-seal/60"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-ink px-5 py-3 text-[13px] font-medium text-paper"
              >
                Entrar
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="rise pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
                (a) escolha sua carta
              </p>
              <h1 className="mt-1 font-display text-[30px] font-semibold leading-[1.05]">
                Uma carta chegou para <span className="italic">{session.name}</span>.
              </h1>
              <p className="mt-1.5 max-w-[40ch] text-[13px] leading-relaxed text-inksoft">
                Cada envelope guarda uma mensagem escrita por um voluntário.
              </p>
            </section>

            <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {letters.map((letter) => {
                const read = session.readLetterIds.includes(letter.id);
                return (
                  <button
                    key={letter.id}
                    onClick={() => void openCard(letter)}
                    className="group relative rounded-2xl bg-envelope p-3 text-left ring-1 ring-ink/10 transition-transform duration-300 ease-out hover:-translate-y-1"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="seal-pop grid size-12 place-items-center rounded-full bg-seal text-ink ring-1 ring-ink/10">
                        <span className="font-mono text-[11px] font-medium">
                          {padNumber(letter.number)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex aspect-[5/3] items-end justify-between rounded-[10px] border border-dashed border-ink/15 bg-steel/10 px-3 pb-2">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-inksoft">
                        sua carta
                      </span>
                      <span className="font-mono text-[9px] text-ink/40">
                        nº {padNumber(letter.number)}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                      Carta nº {padNumber(letter.number)}
                    </p>
                    <p className="text-[11px] text-inksoft">
                      {read ? "já aberta — reler" : "fechada com lacre"}
                    </p>
                  </button>
                );
              })}
            </section>

            <button
              onClick={drawRandom}
              className="rise mt-4 w-full rounded-xl bg-ink py-3 text-[13px] font-medium text-paper transition-colors hover:bg-ink/90"
            >
              Sortear Carta Aleatória
            </button>

            {openLetter ? (
              <OpenLetter
                key={openLetter.id}
                letter={openLetter}
                session={session}
                origin={origin}
                onShare={() => setShareOpen(true)}
              />
            ) : null}

            {shareOpen && openLetter ? (
              <ShareModal
                letter={openLetter}
                session={session}
                origin={origin}
                onClose={() => setShareOpen(false)}
              />
            ) : null}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function OpenLetter({
  letter,
  session,
  origin,
  onShare,
}: {
  letter: Letter;
  session: VisitorSession;
  origin: Origin;
  onShare: () => void;
}) {
  const [letterStars, setLetterStars] = useState(0);
  const [letterComment, setLetterComment] = useState("");
  const [volStars, setVolStars] = useState(0);
  const [volComment, setVolComment] = useState("");
  const [sent, setSent] = useState(false);

  const volunteerId = origin.kind === "volunteer" ? origin.volunteerId : null;

  async function submitRatings() {
    if (letterStars === 0 && volStars === 0) {
      toast.error("Escolha ao menos uma nota antes de enviar.");
      return;
    }
    if (letterStars > 0) {
      await supabase.from("letter_ratings").insert({
        access_log_id: session.accessLogId,
        letter_id: letter.id,
        stars: letterStars,
        comment: letterComment.trim().slice(0, 1000) || null,
      });
    }
    if (volunteerId && volStars > 0) {
      await supabase.from("volunteer_ratings").insert({
        access_log_id: session.accessLogId,
        volunteer_id: volunteerId,
        stars: volStars,
        comment: volComment.trim().slice(0, 1000) || null,
      });
    }
    setSent(true);
    toast.success("Obrigado pela sua avaliação!");
  }

  return (
    <>
      <section id="carta-aberta" className="mt-8 scroll-mt-28">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
            (b) carta aberta
          </p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-inksoft">
            nº {padNumber(letter.number)} · sulfite
          </p>
        </div>
        <article className="rise mt-3 rounded-[18px] bg-sulfite p-6 shadow-[0_18px_40px_-18px_rgba(43,42,38,.45)] ring-1 ring-ink/10 sm:p-8">
          <p className="mb-5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-inksoft">
            — para {session.name} —
          </p>
          <h2 className="text-center font-body text-[19px] font-bold uppercase leading-snug tracking-tight">
            {letter.title}
          </h2>
          <div className="mx-auto mt-3 mb-5 h-px w-16 bg-ink/20" />
          <div
            className="letter-body text-[14px] text-ink/90"
            dangerouslySetInnerHTML={{ __html: renderLetterHtml(letter.body_html, session.name) }}
          />
        </article>
        <button
          onClick={onShare}
          className="mt-4 w-full rounded-xl bg-seal py-3 text-[13px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
        >
          Compartilhar Carta
        </button>
      </section>

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
            (c) sua avaliação
          </p>
        </div>
        <div className="rise frost mt-3 rounded-[18px] p-5 ring-1 ring-ink/10">
          {sent ? (
            <p className="text-[13px] text-inksoft">
              Avaliação registrada. Obrigado por dedicar um instante.
            </p>
          ) : (
            <>
              <p className="text-[13px] font-medium">Como foi esta carta?</p>
              <div className="mt-2">
                <StarRating value={letterStars} onChange={setLetterStars} />
              </div>
              <textarea
                rows={2}
                maxLength={1000}
                value={letterComment}
                onChange={(e) => setLetterComment(e.target.value)}
                placeholder="Deixe um comentário sobre a carta..."
                className="mt-3 w-full resize-none rounded-lg bg-steel/40 px-3 py-2.5 text-[13px] ring-1 ring-ink/10 placeholder:text-inksoft/70 focus:outline-none focus:ring-2 focus:ring-seal/60"
              />
              {volunteerId ? (
                <div className="mt-4 border-t border-ink/10 pt-3">
                  <p className="text-[13px] font-medium">
                    Avaliar o voluntário
                    {origin.kind === "volunteer" ? ` (${origin.name})` : ""}
                  </p>
                  <div className="mt-2">
                    <StarRating value={volStars} onChange={setVolStars} size={20} />
                  </div>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={volComment}
                    onChange={(e) => setVolComment(e.target.value)}
                    placeholder="Deixe um recado para quem te enviou..."
                    className="mt-3 w-full resize-none rounded-lg bg-steel/40 px-3 py-2.5 text-[13px] ring-1 ring-ink/10 placeholder:text-inksoft/70 focus:outline-none focus:ring-2 focus:ring-seal/60"
                  />
                </div>
              ) : null}
              <button
                onClick={() => void submitRatings()}
                className="mt-4 w-full rounded-xl bg-ink py-3 text-[13px] font-medium text-paper"
              >
                Enviar avaliação
              </button>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function ShareModal({
  letter,
  session,
  origin,
  onClose,
}: {
  letter: Letter;
  session: VisitorSession;
  origin: Origin;
  onClose: () => void;
}) {
  const [anonymous, setAnonymous] = useState(true);
  const [senderName, setSenderName] = useState(session.name);
  const [link, setLink] = useState<string | null>(null);

  async function generate() {
    const token = makeToken();
    const volunteerId =
      origin.kind === "volunteer"
        ? origin.volunteerId
        : origin.kind === "share"
          ? origin.volunteerId
          : null;
    const { error } = await supabase.from("shares").insert({
      token,
      letter_id: letter.id,
      volunteer_id: volunteerId,
      access_log_id: session.accessLogId,
      anonymous,
      sender_name: anonymous ? null : senderName.trim().slice(0, 40) || null,
    });
    if (error) {
      toast.error("Não foi possível gerar o link.");
      return;
    }
    setLink(`${window.location.origin}/?s=${token}`);
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-5 ring-1 ring-ink/15">
        <div className="flex items-start justify-between">
          <p className="font-display text-[20px] font-semibold">Compartilhar carta</p>
          <button onClick={onClose} className="text-inksoft hover:text-ink" aria-label="Fechar">
            ✕
          </button>
        </div>
        <p className="mt-1 text-[12px] text-inksoft">
          Carta nº {padNumber(letter.number)} — escolha como quer aparecer.
        </p>

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2.5 rounded-xl bg-white/60 px-3 py-2.5 ring-1 ring-ink/10">
            <input
              type="radio"
              checked={anonymous}
              onChange={() => setAnonymous(true)}
              className="accent-[oklch(0.79_0.147_83)]"
            />
            <span className="text-[13px]">Enviar como Anônimo</span>
          </label>
          <label className="flex items-center gap-2.5 rounded-xl bg-white/60 px-3 py-2.5 ring-1 ring-ink/10">
            <input
              type="radio"
              checked={!anonymous}
              onChange={() => setAnonymous(false)}
              className="accent-[oklch(0.79_0.147_83)]"
            />
            <span className="text-[13px]">Identificar-me</span>
          </label>
          {!anonymous ? (
            <input
              value={senderName}
              maxLength={40}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Nome ou apelido"
              className="w-full rounded-xl bg-white/70 px-3 py-2.5 text-[13px] ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-seal/60"
            />
          ) : null}
        </div>

        {link ? (
          <div className="mt-4">
            <p className="font-mono text-[9px] uppercase tracking-wider text-inksoft">seu link</p>
            <p className="mt-1 break-all rounded-lg bg-steel/40 p-2.5 font-mono text-[11px]">
              {link}
            </p>
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
        ) : (
          <button
            onClick={() => void generate()}
            className="mt-4 w-full rounded-xl bg-ink py-3 text-[13px] font-medium text-paper"
          >
            Gerar link de compartilhamento
          </button>
        )}
      </div>
    </div>
  );
}
