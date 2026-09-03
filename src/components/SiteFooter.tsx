import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function SiteFooter() {
  const { data } = useQuery({
    queryKey: ["footer"],
    queryFn: async () => {
      const [settings, links] = await Promise.all([
        supabase.from("site_settings").select("institutional_text, ombudsman_url").maybeSingle(),
        supabase.from("social_links").select("id, label, url").order("sort_order"),
      ]);
      return { settings: settings.data, links: links.data ?? [] };
    },
  });

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30">
      <div className="frost border-t border-ink/10">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <p className="max-w-[52ch] text-[10.5px] leading-relaxed text-inksoft">
            {data?.settings?.institutional_text ?? ""}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {data?.links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-wider text-ink/70 hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            {data?.settings?.ombudsman_url ? (
              <a
                href={data.settings.ombudsman_url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-wider text-ink/70 hover:text-ink"
              >
                Ouvidoria
              </a>
            ) : null}
            <Link
              to="/auth"
              className="ml-auto rounded-full bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-paper"
            >
              Acesso Restrito
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
