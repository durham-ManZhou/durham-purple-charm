import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Loading, PageHeader, adminField } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { downloadCsv } from "./leads";

export const Route = createFileRoute("/_authenticated/admin/bookings")({ component: BookingsAdmin });

const statuses = ["待到访", "已到访", "已取消"];

function BookingsAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("待到访");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => { const { data, error } = await supabase.from("bookings").select("*").order("visit_date", { ascending: true }).limit(2000); if (error) throw error; return data; },
  });
  if (isLoading || !data) return <Loading />;
  const shown = data.filter((b) => (!status || b.status === status) && (!date || b.visit_date === date) && `${b.name}${b.phone}${b.visit_code}`.toUpperCase().includes(q.trim().toUpperCase()));
  const people = shown.filter((b) => b.status !== "已取消").reduce((n, b) => n + b.party_size, 0);
  const setS = async (id: string, s: string) => { const { error } = await supabase.from("bookings").update({ status: s }).eq("id", id); if (error) toast.error("更新失败"); else { toast.success(s === "已取消" ? "已取消，名额已释放" : "状态已更新"); void qc.invalidateQueries({ queryKey: ["admin-bookings"] }); } };
  return <div className="space-y-6">
    <PageHeader eyebrow="Campus visits" title="到校预约" description="每个时段上限 100 人；取消的预约会自动释放名额。" actions={<Button variant="outline" onClick={() => downloadCsv("到校预约.csv", [["到访日期", "时段", "姓名", "手机号", "人数", "凭证", "备注", "状态"], ...shown.map((b) => [b.visit_date, b.time_slot, b.name, b.phone, b.party_size, b.visit_code, b.notes, b.status])])}><Download className="size-4" />导出 CSV</Button>} />
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索姓名、手机号、凭证号" className={cn(adminField, "pl-9")} /></label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(adminField, "sm:w-44")} aria-label="到访日期" />
      <select value={status} onChange={(e) => setStatus(e.target.value)} className={cn(adminField, "sm:w-36")}><option value="">全部状态</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
    </div>
    <p className="text-sm text-muted-foreground">共 <strong className="text-foreground">{shown.length}</strong> 条预约，合计 <strong className="text-foreground">{people}</strong> 人</p>
    <div className="overflow-x-auto rounded-md border border-border bg-paper shadow-sm"><table className="w-full min-w-[820px] text-sm">
      <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-3">到访日期</th><th className="p-3">时段</th><th className="p-3">姓名</th><th className="p-3">手机号</th><th className="p-3">人数</th><th className="p-3">凭证</th><th className="p-3">备注</th><th className="p-3">状态</th></tr></thead>
      <tbody className="divide-y divide-border">{shown.map((b) => <tr key={b.id} className={cn(b.status === "已取消" && "opacity-55")}>
        <td className="p-3 font-semibold">{b.visit_date}</td><td className="p-3">{b.time_slot}</td><td className="p-3">{b.name}</td><td className="p-3"><a href={`tel:${b.phone}`} className="text-primary">{b.phone}</a></td><td className="p-3">{b.party_size}</td><td className="p-3 font-mono text-xs">{b.visit_code}</td><td className="max-w-[180px] p-3 text-xs text-muted-foreground">{b.notes}</td>
        <td className="p-3"><select value={b.status} onChange={(e) => setS(b.id, e.target.value)} className={cn(adminField, "min-h-8 w-24 py-1 text-xs")}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></td>
      </tr>)}</tbody></table>{!shown.length && <p className="p-8 text-center text-sm text-muted-foreground">暂无预约</p>}</div>
  </div>;
}
