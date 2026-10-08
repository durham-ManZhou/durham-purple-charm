import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Clock, ExternalLink, GraduationCap, Images, LayoutDashboard, Loader2, LogOut, Megaphone, MessageSquareQuote, Phone, ShieldCheck, Smartphone, UsersRound, Inbox } from "lucide-react";
import { Toaster } from "sonner";
import logoWhite from "@/assets/durham-logo-white.svg.asset.json";
import logoDark from "@/assets/durham-logo-dark.svg.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "内容管理后台｜杜伦大学招生小程序" },
    { name: "description", content: "维护杜伦大学招生小程序的项目、图集、访谈、联系方式与预约数据。" },
    { property: "og:title", content: "内容管理后台｜杜伦大学招生小程序" },
    { property: "og:description", content: "维护杜伦大学招生小程序的项目、图集、访谈、联系方式与预约数据。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AdminLayout,
});

const nav = [
  { group: "总览", items: [{ to: "/admin", label: "概览", icon: LayoutDashboard, exact: true }] },
  { group: "小程序内容", items: [
    { to: "/admin/projects", label: "留学项目", icon: GraduationCap },
    { to: "/admin/ad", label: "启动弹窗", icon: Megaphone },
    { to: "/admin/campus", label: "校园环境", icon: Images },
    { to: "/admin/stories", label: "学生访谈", icon: MessageSquareQuote },
    { to: "/admin/staff", label: "教师资料", icon: UsersRound },
    { to: "/admin/contact", label: "联系方式", icon: Phone },
  ] },
  { group: "招生数据", items: [
    { to: "/admin/leads", label: "意向线索", icon: Inbox },
    { to: "/admin/bookings", label: "到校预约", icon: CalendarDays },
  ] },
  { group: "系统", items: [{ to: "/admin/users", label: "账号审核", icon: ShieldCheck }] },
] as const;

export function useAdminAccess() {
  const { user } = Route.useRouteContext();
  return useQuery({
    queryKey: ["admin-access", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const access = useAdminAccess();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (access.isLoading) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  if (!access.data) return <div className="grid min-h-screen place-items-center bg-background px-5">
    <div className="w-full max-w-md rounded-md border border-border bg-paper p-8 text-center shadow-sm">
      <img src={logoDark.url} alt="Durham University" className="mx-auto h-11 w-auto" />
      <Clock className="mx-auto mt-8 size-8 text-primary" />
      <h1 className="mt-4 font-display text-2xl font-bold">账号等待审核</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">你的账号（{user.email}）已注册成功。请联系现有管理员在「账号审核」中批准后，刷新本页即可进入后台。</p>
      <div className="mt-6 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => access.refetch()}>重新检查</Button><Button variant="outline" onClick={signOut}><LogOut className="size-4" />退出登录</Button></div>
    </div>
  </div>;

  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_1fr]">
    <aside className="bg-primary text-primary-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="flex items-center justify-between gap-3 px-5 py-5 lg:block">
        <img src={logoWhite.url} alt="Durham University" className="h-9 w-auto max-w-[180px] object-contain object-left" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent lg:mt-3">Admissions console</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:pb-0" aria-label="后台导航">
        {nav.map((g) => <div key={g.group} className="flex gap-1 lg:mb-4 lg:block">
          <p className="hidden px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50 lg:block">{g.group}</p>
          {g.items.map(({ to, label, icon: Icon, ...rest }) => <Link key={to} to={to} activeOptions={{ exact: "exact" in rest }} className="flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:text-primary-foreground" activeProps={{ className: "bg-primary-foreground/15 font-semibold !text-primary-foreground" }}><Icon className="size-4" />{label}</Link>)}
        </div>)}
      </nav>
      <div className="hidden border-t border-primary-foreground/15 p-4 lg:block">
        <a href="/" target="_blank" rel="noreferrer" className="mb-3 flex items-center gap-2 text-xs text-primary-foreground/80 hover:text-primary-foreground"><Smartphone className="size-3.5" />预览小程序<ExternalLink className="size-3" /></a>
        <p className="truncate text-xs text-primary-foreground/70">{user.email}</p>
        <button type="button" onClick={signOut} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"><LogOut className="size-3.5" />退出登录</button>
      </div>
    </aside>
    <div className="min-w-0">
      <div className="flex items-center justify-end gap-3 border-b border-border bg-paper px-5 py-2 lg:hidden"><a href="/" target="_blank" rel="noreferrer" className="text-xs text-primary">预览小程序</a><button type="button" onClick={signOut} className={cn("text-xs font-semibold text-muted-foreground")}>退出</button></div>
      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10"><Outlet /></main>
    </div>
    <Toaster position="top-center" richColors />
  </div>;
}
