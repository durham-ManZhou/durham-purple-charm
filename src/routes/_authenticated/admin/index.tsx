import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, GraduationCap, Inbox, UsersRound } from "lucide-react";
import { PageHeader, Panel } from "@/components/admin/kit";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Overview });

function Overview() {
  const projects = useSiteContent("projects");
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [leads, pending, bookings, staff] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("follow_up_status", "待跟进"),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "待到访").gte("visit_date", today),
        supabase.from("staff_profiles").select("profile_url", { count: "exact", head: true }).eq("is_active", true).eq("admin_hidden", false),
      ]);
      return { leads: leads.count ?? 0, pending: pending.count ?? 0, bookings: bookings.count ?? 0, staff: staff.count ?? 0 };
    },
  });
  const recent = useQuery({
    queryKey: ["admin-recent-leads"],
    queryFn: async () => (await supabase.from("leads").select("id,name,intended_program,follow_up_status,created_at").order("created_at", { ascending: false }).limit(5)).data ?? [],
  });
  const cards = [
    { label: "意向线索", value: stats.data?.leads, sub: `${stats.data?.pending ?? "–"} 条待跟进`, icon: Inbox, to: "/admin/leads" as const },
    { label: "待到访预约", value: stats.data?.bookings, sub: "今天及以后", icon: CalendarDays, to: "/admin/bookings" as const },
    { label: "上架项目", value: projects.filter((p) => p.status === "上架").length, sub: `共 ${projects.length} 个项目`, icon: GraduationCap, to: "/admin/projects" as const },
    { label: "展示中的教师", value: stats.data?.staff, sub: "每日自动同步", icon: UsersRound, to: "/admin/staff" as const },
  ];
  return <div className="space-y-8">
    <PageHeader eyebrow="Overview" title="概览" description="小程序内容与招生数据一览。修改内容后保存，小程序即时生效。" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, sub, icon: Icon, to }) => <Link key={label} to={to} className="group rounded-md border border-border bg-paper p-5 shadow-sm transition hover:border-primary">
        <div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">{label}</span><Icon className="size-4 text-primary" /></div>
        <p className="mt-4 font-display text-4xl font-bold text-foreground">{value ?? "–"}</p>
        <p className="mt-1 flex items-center justify-between text-xs text-muted-foreground">{sub}<ArrowRight className="size-3.5 text-primary opacity-0 transition group-hover:opacity-100" /></p>
      </Link>)}
    </div>
    <Panel title="最新意向线索" actions={<Link to="/admin/leads" className="text-xs font-semibold text-primary">查看全部</Link>}>
      {recent.data?.length ? <ul className="divide-y divide-border">{recent.data.map((l) => <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="font-semibold">{l.name}</span><span className="flex-1 text-muted-foreground">{l.intended_program}</span><span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-primary">{l.follow_up_status}</span><span className="hidden text-xs text-muted-foreground sm:block">{new Date(l.created_at).toLocaleDateString("zh-CN")}</span></li>)}</ul> : <p className="py-6 text-center text-sm text-muted-foreground">暂无线索</p>}
    </Panel>
  </div>;
}
