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

import { durhamStaff, type StaffProfile } from "@/data/durham-staff";
import { departmentBySlug, departmentsForFaculty } from "@/data/durham-departments";

const seedByUrl = new Map(durhamStaff.map((s) => [s.profileUrl, s]));

const ROLE_ZH: [RegExp, string][] = [
  [/head of (department|school)/i, "系主任"],
  [/associate professor/i, "副教授"],
  [/assistant professor/i, "助理教授"],
  [/professor/i, "教授"],
  [/senior lecturer/i, "高级讲师"],
  [/lecturer/i, "讲师"],
  [/teaching fellow/i, "教学研究员"],
  [/reader/i, "高级讲师（Reader）"],
];
export function roleZh(role: string | null | undefined) {
  if (!role) return "";
  const hits = ROLE_ZH.filter(([re]) => re.test(role)).map(([, zh]) => zh);
  const uniq = [...new Set(hits)].filter((z, i, a) => !(z === "教授" && a.some((x) => x.includes("教授") && x !== "教授")));
  return uniq.length ? uniq.join("、") : role;
}

type SearchRow = {
  profile_url: string; display_name: string | null; role: string | null; listed_role: string | null;
  department_slug: string | null; image_url: string | null; research_interests: string[] | null;
  biography_zh: string | null; biography: string | null; total: number;
};

function toProfile(r: SearchRow): StaffProfile & { summary: string } {
  const seed = seedByUrl.get(r.profile_url);
  const dept = r.department_slug ? departmentBySlug.get(r.department_slug) : undefined;
  const role = r.listed_role || r.role || "";
  const summary = (r.biography_zh || r.biography || "").split(/(?<=[。.!?])\s*/)[0] ?? "";
  if (seed) return { ...seed, summary: summary || `${seed.departmentZh}教师，主要关注${seed.interestsZh.slice(0, 3).join("、")}等领域。` };
  const interests = r.research_interests ?? [];
  return {
    name: (r.display_name ?? "").replace(/^(Professor|Prof|Dr|Mr|Mrs|Ms|Miss|Mx)\.?\s+/, ""),
    title: role, titleZh: roleZh(role),
    facultyId: dept?.facultyId ?? "science",
    faculty: "", department: dept?.en ?? "", departmentZh: dept?.zh ?? "",
    interests, interestsZh: interests,
    profileUrl: r.profile_url,
    ...(r.image_url ? { imageUrl: r.image_url } : {}),
    summary,
  };
}

export type StaffCard = ReturnType<typeof toProfile>;
const PAGE = 40;

export function useStaffSearch(query: string, facultyId: string) {
  const [items, setItems] = useState<StaffCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState(query);
  useEffect(() => { const t = setTimeout(() => setQ(query), 300); return () => clearTimeout(t); }, [query]);
  useEffect(() => { setPage(0); }, [q, facultyId]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    const depts = facultyId === "all" ? null : departmentsForFaculty(facultyId);
    supabase.rpc("search_staff", { _q: q, _departments: depts as string[], _limit: PAGE, _offset: page * PAGE })
      .then(({ data }) => {
        if (!alive) return;
        const rows = (data ?? []) as SearchRow[];
        const mapped = rows.map(toProfile);
        setItems((prev) => (page === 0 ? mapped : [...prev, ...mapped]));
        setTotal(rows[0]?.total ?? (page === 0 ? 0 : total));
        setLoading(false);
      });
    return () => { alive = false; };
  }, [q, facultyId, page]);
  return { items, total, loading, loadMore: () => setPage((p) => p + 1), hasMore: items.length < total };
}

export function useStaffDetail(url: string) {
  const [row, setRow] = useState<LiveStaff | undefined>();
  useEffect(() => {
    let alive = true;
    supabase.from("staff_profiles")
      .select("profile_url, display_name, role, phone, email, orcid_url, biography, biography_zh, research_interests, publications, supervision, other_sections, is_active, last_synced_at")
      .eq("profile_url", url).maybeSingle()
      .then(({ data }) => { if (alive) setRow((data ?? undefined) as unknown as LiveStaff | undefined); });
    return () => { alive = false; };
  }, [url]);
  return row;
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

export function LiveProfileSections({ live }: { live: LiveStaff | undefined }) {
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
