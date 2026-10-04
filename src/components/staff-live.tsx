import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, ExternalLink, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type LiveStaff = {
  profile_url: string;
  display_name: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  orcid_url: string | null;
  biography: string | null;
  biography_zh: string | null;
  research_interests: string[];
  publications: { category: string; title: string; url: string | null; citation: string }[];
  supervision: { name: string; url: string | null }[];
  other_sections: { heading: string; text: string }[];
  is_active: boolean;
  last_synced_at: string | null;
};

let cache: Map<string, LiveStaff> | null = null;
let pending: Promise<Map<string, LiveStaff>> | null = null;

function load() {
  if (!pending)
    pending = Promise.resolve(
      supabase
        .from("staff_profiles")
        .select(
          "profile_url, display_name, role, phone, email, orcid_url, biography, biography_zh, research_interests, publications, supervision, other_sections, is_active, last_synced_at",
        ),
    ).then(({ data }) => {
      cache = new Map(((data ?? []) as unknown as LiveStaff[]).map((r) => [r.profile_url, r]));
      return cache;
    });
  return pending;
}

export function useLiveStaff() {
  const [map, setMap] = useState<Map<string, LiveStaff>>(cache ?? new Map());
  useEffect(() => {
    let alive = true;
    load().then((m) => alive && setMap(m));
    return () => {
      alive = false;
    };
  }, []);
  return map;
}

/** Text searched for any keyword: biography, publications, sections, etc. */
export function liveSearchText(s?: LiveStaff) {
  if (!s) return "";
  return [
    s.display_name,
    s.role,
    s.biography,
    s.biography_zh,
    ...s.research_interests,
    ...s.publications.map((p) => `${p.title} ${p.citation}`),
    ...s.supervision.map((p) => p.name),
    ...s.other_sections.map((p) => `${p.heading} ${p.text}`),
  ]
    .filter(Boolean)
    .join(" ");
}

function Fold({ title, count, children, open = false }: { title: string; count?: number; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-border py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold">
        <span>
          {title}
          {count !== undefined && <span className="ml-2 text-xs font-normal text-muted-foreground">{count}</span>}
        </span>
        <ChevronDown className="size-4 text-primary transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function Publications({ items }: { items: LiveStaff["publications"] }) {
  const [limit, setLimit] = useState(10);
  return (
    <div>
      <ul className="space-y-3">
        {items.slice(0, limit).map((p, i) => (
          <li key={i} className="text-xs leading-5">
            <span className="text-[10px] font-bold uppercase text-primary">{p.category}</span>
            {p.url ? (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="block font-semibold text-foreground underline-offset-2 hover:underline">{p.title}</a>
            ) : (
              <strong className="block">{p.title}</strong>
            )}
            {p.citation && <span className="block break-words text-muted-foreground">{p.citation}</span>}
          </li>
        ))}
      </ul>
      {items.length > limit && (
        <button type="button" onClick={() => setLimit((l) => l + 20)} className="mt-4 w-full rounded-md border border-border py-2 text-xs font-semibold text-primary">
          显示更多（剩余 {items.length - limit} 条）
        </button>
      )}
    </div>
  );
}

export function LiveProfileSections({ live }: { live?: LiveStaff }) {
  if (!live || !live.last_synced_at) return null;
  return (
    <section className="mt-8 border-t border-border">
      {(live.biography || live.biography_zh) && (
        <Fold title="个人简介 Biography" open>
          {live.biography_zh && <p className="whitespace-pre-line text-sm leading-7 text-foreground">{live.biography_zh}</p>}
          {live.biography && <p className="mt-3 whitespace-pre-line text-xs leading-6 text-muted-foreground">{live.biography}</p>}
        </Fold>
      )}
      {live.research_interests.length > 0 && (
        <Fold title="研究方向 Research interests" count={live.research_interests.length} open>
          <ul className="flex flex-wrap gap-2">
            {live.research_interests.map((r) => (
              <li key={r} className="rounded-full border border-border px-3 py-1 text-xs">{r}</li>
            ))}
          </ul>
        </Fold>
      )}
      {live.other_sections.map((s) => (
        <Fold key={s.heading} title={s.heading}>
          <p className="whitespace-pre-line text-xs leading-6 text-muted-foreground">{s.text}</p>
        </Fold>
      ))}
      {live.publications.length > 0 && (
        <Fold title="论文与成果 Publications" count={live.publications.length}>
          <Publications items={live.publications} />
        </Fold>
      )}
      {live.supervision.length > 0 && (
        <Fold title="指导学生 Supervision" count={live.supervision.length}>
          <ul className="space-y-2 text-sm">
            {live.supervision.map((s) => <li key={s.name}>{s.name}</li>)}
          </ul>
        </Fold>
      )}
      {(live.email || live.phone || live.orcid_url) && (
        <Fold title="联系方式 Contact" open>
          <ul className="space-y-3 text-sm">
            {live.email && <li><a className="flex items-center gap-2 text-primary" href={`mailto:${live.email}`}><Mail className="size-4" />{live.email}</a></li>}
            {live.phone && <li><a className="flex items-center gap-2 text-primary" href={`tel:${live.phone.replace(/[^+\d]/g, "")}`}><Phone className="size-4" />{live.phone}</a></li>}
            {live.orcid_url && <li><a className="flex items-center gap-2 text-primary" href={live.orcid_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />ORCID</a></li>}
          </ul>
        </Fold>
      )}
      <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
        信息来源：杜伦大学官网 · 最后同步 {new Date(live.last_synced_at).toLocaleString("zh-CN", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" })}（伦敦时间），每日自动更新
      </p>
    </section>
  );
}
