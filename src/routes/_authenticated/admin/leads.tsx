import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Loading, PageHeader, adminField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/leads")({ component: LeadsAdmin });

const statuses = ["待跟进", "跟进中", "已转化", "无效"];

export function downloadCsv(name: string, rows: (string | number | null)[][]) {
  const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

function LeadsAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => { const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(1000); if (error) throw error; return data; },
  });
  if (isLoading || !data) return <Loading />;
  const shown = data.filter((l) => (!status || l.follow_up_status === status) && `${l.name}${l.phone}${l.intended_program}`.includes(q.trim()));
  const setS = async (id: string, s: string) => { const { error } = await supabase.from("leads").update({ follow_up_status: s }).eq("id", id); if (error) toast.error("更新失败"); else { toast.success("状态已更新"); void qc.invalidateQueries({ queryKey: ["admin-leads"] }); } };
  const del = async (id: string) => { if (!confirm("删除这条线索？")) return; const { error } = await supabase.from("leads").delete().eq("id", id); if (error) toast.error("删除失败"); else void qc.invalidateQueries({ queryKey: ["admin-leads"] }); };
  return <div className="space-y-6">
    <PageHeader eyebrow="Enquiries" title="意向线索" description="小程序「意向填写」提交的信息。" actions={<Button variant="outline" onClick={() => downloadCsv("意向线索.csv", [["提交时间", "姓名", "手机号", "学历", "意向项目", "意向国家", "入学年份", "预算", "备注", "状态"], ...shown.map((l) => [new Date(l.created_at).toLocaleString("zh-CN"), l.name, l.phone, l.education, l.intended_program, l.intended_countries.join("/"), l.entry_year, l.budget, l.notes, l.follow_up_status])])}><Download className="size-4" />导出 CSV</Button>} />
    <div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索姓名、手机号" className={cn(adminField, "pl-9")} /></label><select value={status} onChange={(e) => setStatus(e.target.value)} className={cn(adminField, "sm:w-40")}><option value="">全部状态</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select></div>
    <div className="overflow-x-auto rounded-md border border-border bg-paper shadow-sm"><table className="w-full min-w-[900px] text-sm">
      <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-3">提交时间</th><th className="p-3">姓名</th><th className="p-3">手机号</th><th className="p-3">学历</th><th className="p-3">意向</th><th className="p-3">备注</th><th className="p-3">状态</th><th className="p-3" /></tr></thead>
      <tbody className="divide-y divide-border">{shown.map((l) => <tr key={l.id}>
        <td className="whitespace-nowrap p-3 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("zh-CN")}</td>
        <td className="p-3 font-semibold">{l.name}</td><td className="p-3"><a href={`tel:${l.phone}`} className="text-primary">{l.phone}</a></td><td className="p-3">{l.education}</td>
        <td className="p-3"><p>{l.intended_program}</p><p className="text-xs text-muted-foreground">{[l.intended_countries.join("/"), l.entry_year, l.budget].filter(Boolean).join(" · ")}</p></td>
        <td className="max-w-[200px] p-3 text-xs text-muted-foreground">{l.notes}</td>
        <td className="p-3"><select value={l.follow_up_status} onChange={(e) => setS(l.id, e.target.value)} className={cn(adminField, "min-h-8 w-24 py-1 text-xs")}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></td>
        <td className="p-3"><Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(l.id)} aria-label="删除"><Trash2 className="size-4" /></Button></td>
      </tr>)}</tbody></table>{!shown.length && <p className="p-8 text-center text-sm text-muted-foreground">暂无线索</p>}</div>
  </div>;
}
