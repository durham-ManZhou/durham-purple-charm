import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Loading, PageHeader, Switch, adminField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/staff")({ component: StaffAdmin });

const PAGE = 50;

function StaffAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [page, setPage] = useState(0);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-staff", q, hiddenOnly, page],
    queryFn: async () => {
      let req = supabase.from("staff_profiles").select("profile_url,display_name,role,department_slug,image_url,admin_hidden,last_synced_at", { count: "exact" }).eq("is_active", true).not("display_name", "is", null).order("display_name").range(page * PAGE, page * PAGE + PAGE - 1);
      const term = q.trim().replace(/[%,()]/g, "");
      if (term) req = req.or(`display_name.ilike.%${term}%,department_slug.ilike.%${term}%`);
      if (hiddenOnly) req = req.eq("admin_hidden", true);
      const { data, error, count } = await req;
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });
  const toggle = async (url: string, hidden: boolean) => {
    const { error } = await supabase.from("staff_profiles").update({ admin_hidden: hidden }).eq("profile_url", url);
    if (error) { toast.error("更新失败"); return; }
    toast.success(hidden ? "已在小程序中隐藏" : "已恢复展示");
    void qc.invalidateQueries({ queryKey: ["admin-staff"] });
  };
  return <div className="space-y-6">
    <PageHeader eyebrow="Academic staff" title="教师资料" description="教师资料每日从杜伦大学官网自动同步，离职教师会自动下线。如需临时不展示某位老师，可在此隐藏。" />
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="搜索姓名或院系（英文）" className={cn(adminField, "pl-9")} /></label>
      <span className="flex items-center gap-2 text-sm"><Switch label="只看已隐藏" checked={hiddenOnly} onChange={(v) => { setHiddenOnly(v); setPage(0); }} />只看已隐藏</span>
    </div>
    {isLoading || !data ? <Loading /> : <>
      <p className="text-sm text-muted-foreground">共 {data.count} 位</p>
      <div className="overflow-x-auto rounded-md border border-border bg-paper shadow-sm"><table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-3">教师</th><th className="p-3">院系</th><th className="p-3">最近同步</th><th className="p-3 text-center">在小程序展示</th></tr></thead>
        <tbody className="divide-y divide-border">{data.rows.map((s) => <tr key={s.profile_url} className={cn(s.admin_hidden && "opacity-55")}>
          <td className="p-3"><div className="flex items-center gap-3">{s.image_url ? <img src={s.image_url} alt="" className="size-9 rounded-full object-cover" /> : <span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{s.display_name?.replace(/^(Professor|Dr|Mr|Mrs|Ms)\s+/, "")[0]}</span>}<div><p className="font-semibold">{s.display_name}</p><p className="text-xs text-muted-foreground">{s.role}</p></div><a href={s.profile_url} target="_blank" rel="noreferrer" aria-label="官网资料" className="text-muted-foreground hover:text-primary"><ExternalLink className="size-3.5" /></a></div></td>
          <td className="p-3 text-xs text-muted-foreground">{s.department_slug}</td>
          <td className="p-3 text-xs text-muted-foreground">{s.last_synced_at ? new Date(s.last_synced_at).toLocaleDateString("zh-CN") : "待同步"}</td>
          <td className="p-3 text-center"><Switch label="展示" checked={!s.admin_hidden} onChange={(v) => toggle(s.profile_url, !v)} /></td>
        </tr>)}</tbody></table></div>
      <div className="flex items-center justify-end gap-2"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>上一页</Button><span className="text-xs text-muted-foreground">{page + 1} / {Math.max(1, Math.ceil(data.count / PAGE))}</span><Button variant="outline" size="sm" disabled={(page + 1) * PAGE >= data.count} onClick={() => setPage(page + 1)}>下一页</Button></div>
    </>}
  </div>;
}
