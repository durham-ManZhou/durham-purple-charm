import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loading, PageHeader, Panel } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersAdmin });

function UsersAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles, error }, { data: roles }, { data: me }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id").eq("role", "admin"),
        supabase.auth.getUser(),
      ]);
      if (error) throw error;
      const admins = new Set((roles ?? []).map((r) => r.user_id));
      return { me: me.user?.id, pending: profiles.filter((p) => !admins.has(p.id)), approved: profiles.filter((p) => admins.has(p.id)) };
    },
  });
  if (isLoading || !data) return <Loading />;
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-users"] });
  const approve = async (id: string) => { const { error } = await supabase.from("user_roles").insert({ user_id: id, role: "admin" }); if (error) toast.error("操作失败"); else { toast.success("已批准，对方刷新后即可进入后台"); void refresh(); } };
  const revoke = async (id: string) => { if (!confirm("撤销该账号的后台权限？")) return; const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin"); if (error) toast.error("操作失败"); else { toast.success("已撤销权限"); void refresh(); } };
  const row = (p: (typeof data.pending)[number], action: React.ReactNode) => <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-semibold">{p.display_name || "未填写姓名"}{p.id === data.me && <span className="ml-2 text-xs text-primary">（我）</span>}</p><p className="text-xs text-muted-foreground">{p.email} · 注册于 {new Date(p.created_at).toLocaleDateString("zh-CN")}</p></div>{action}</li>;
  return <div className="space-y-6">
    <PageHeader eyebrow="Accounts" title="账号审核" description="新注册的账号需要在这里批准后，才能进入后台管理内容。" />
    <Panel title={`待审核（${data.pending.length}）`}>{data.pending.length ? <ul className="divide-y divide-border">{data.pending.map((p) => row(p, <Button size="sm" onClick={() => approve(p.id)}>批准</Button>))}</ul> : <p className="py-4 text-center text-sm text-muted-foreground">暂无待审核账号</p>}</Panel>
    <Panel title={`管理员（${data.approved.length}）`}><ul className="divide-y divide-border">{data.approved.map((p) => row(p, p.id === data.me ? <span className="text-xs text-muted-foreground">当前账号</span> : <Button size="sm" variant="outline" onClick={() => revoke(p.id)}>撤销权限</Button>))}</ul></Panel>
  </div>;
}
