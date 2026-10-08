import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Pin, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { FormField, ImageField, Loading, PageHeader, Panel, SaveButton, Switch, TextArea, TextInput, adminField, lines, useContentDraft } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import type { Project, ProjectType } from "@/components/overseas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/projects")({ component: ProjectsAdmin });

const types: ProjectType[] = ["国际本科", "硕士项目", "本科直博"];

function blank(id: number, logo: string, brochure: string): Project {
  return { id, type: "国际本科", name: "", partner: "Durham University 杜伦大学", partnerLogo: logo, country: "英国", mode: "", subject: "", highlight: "", image: "", pinned: false, status: "下架", overview: "", advantages: [], majors: [], shareTitle: "", shareCover: "", brochureUrl: brochure };
}

function ProjectsAdmin() {
  const { draft, update, save, saving, dirty, loading } = useContentDraft("projects");
  const [editing, setEditing] = useState<Project | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | ProjectType>("");
  const shown = useMemo(() => (draft ?? []).filter((p) => (!type || p.type === type) && `${p.name}${p.partner}`.toLowerCase().includes(q.toLowerCase())), [draft, q, type]);
  if (loading || !draft) return <Loading />;
  const patch = (id: number, p: Partial<Project>) => update((all) => all.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const commit = (p: Project) => {
    const filled = { ...p, shareTitle: p.shareTitle || `${p.name}｜杜伦大学招生`, shareCover: p.shareCover || p.image };
    update((all) => (all.some((x) => x.id === p.id) ? all.map((x) => (x.id === p.id ? filled : x)) : [filled, ...all]));
    setEditing(null);
  };
  return <div className="space-y-6">
    <PageHeader eyebrow="Overseas study" title="留学项目" description="新增、编辑、置顶或下架项目。下架的项目不会在小程序中显示；修改后点击「保存并发布」。" actions={<>
      <Button variant="outline" onClick={() => setEditing(blank(Math.max(0, ...draft.map((p) => p.id)) + 1, draft[0]?.partnerLogo ?? "", draft[0]?.brochureUrl ?? ""))}><Plus className="size-4" />新增项目</Button>
      <SaveButton saving={saving} dirty={dirty} onClick={() => save()} />
    </>} />
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索项目或合作院校" className={cn(adminField, "pl-9")} /></label>
      <select value={type} onChange={(e) => setType(e.target.value as ProjectType)} className={cn(adminField, "sm:w-44")}><option value="">全部分类</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
    </div>
    <div className="overflow-x-auto rounded-md border border-border bg-paper shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-3">项目</th><th className="p-3">分类</th><th className="p-3">学制</th><th className="p-3 text-center">置顶</th><th className="p-3 text-center">上架</th><th className="p-3 text-right">操作</th></tr></thead>
        <tbody className="divide-y divide-border">{shown.map((p) => <tr key={p.id} className={cn(p.status === "下架" && "opacity-60")}>
          <td className="p-3"><div className="flex items-center gap-3">{p.image ? <img src={p.image} alt="" className="h-12 w-9 rounded-sm object-cover" /> : <span className="h-12 w-9 rounded-sm bg-muted" />}<div className="min-w-0"><p className="font-semibold">{p.name || "（未命名）"}</p><p className="flex items-center gap-1.5 text-xs text-muted-foreground">{p.partnerLogo && <img src={p.partnerLogo} alt="" className="h-4 w-auto" />}{p.partner}</p></div></div></td>
          <td className="p-3 text-muted-foreground">{p.type}</td><td className="p-3 text-muted-foreground">{p.mode}</td>
          <td className="p-3 text-center"><button type="button" aria-label="置顶" onClick={() => patch(p.id, { pinned: !p.pinned })} className={cn("rounded-md p-1.5", p.pinned ? "text-primary" : "text-muted-foreground/40")}><Pin className={cn("size-4", p.pinned && "fill-current")} /></button></td>
          <td className="p-3 text-center"><Switch label="上架" checked={p.status === "上架"} onChange={(v) => patch(p.id, { status: v ? "上架" : "下架" })} /></td>
          <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => setEditing(structuredClone(p))}><Pencil className="size-4" />编辑</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm(`删除「${p.name}」？`)) update((all) => all.filter((x) => x.id !== p.id)); }}><Trash2 className="size-4" /></Button></td>
        </tr>)}</tbody>
      </table>
      {!shown.length && <p className="p-8 text-center text-sm text-muted-foreground">没有匹配的项目</p>}
    </div>
    {editing && <ProjectEditor project={editing} onClose={() => setEditing(null)} onSave={commit} />}
  </div>;
}

function ProjectEditor({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: (p: Project) => void }) {
  const [p, setP] = useState(project);
  const set = <K extends keyof Project>(k: K, v: Project[K]) => setP((o) => ({ ...o, [k]: v }));
  const valid = p.name.trim() && p.image && p.mode.trim();
  return <div className="fixed inset-0 z-50 flex justify-end bg-ink/60" onClick={onClose}>
    <div className="flex h-full w-full max-w-2xl flex-col bg-background shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="编辑项目">
      <div className="flex items-center justify-between border-b border-border bg-paper px-6 py-4"><h2 className="font-display text-xl font-bold">{project.name ? "编辑项目" : "新增项目"}</h2><Button size="icon" variant="ghost" onClick={onClose} aria-label="关闭"><X className="size-5" /></Button></div>
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <Panel title="基本信息"><div className="grid gap-4 sm:grid-cols-2">
          <FormField label="项目名称 *" className="sm:col-span-2"><TextInput value={p.name} onChange={(v) => set("name", v)} maxLength={60} /></FormField>
          <FormField label="分类"><select value={p.type} onChange={(e) => set("type", e.target.value as ProjectType)} className={adminField}>{types.map((t) => <option key={t}>{t}</option>)}</select></FormField>
          <FormField label="国家"><TextInput value={p.country} onChange={(v) => set("country", v)} maxLength={20} /></FormField>
          <FormField label="学制模式 *" hint="如 2+2、1年制"><TextInput value={p.mode} onChange={(v) => set("mode", v)} maxLength={20} /></FormField>
          <FormField label="专业方向" hint="用于筛选，如 商科"><TextInput value={p.subject} onChange={(v) => set("subject", v)} maxLength={20} /></FormField>
          <FormField label="一句话亮点" hint="卡片最多显示 20 字" className="sm:col-span-2"><TextInput value={p.highlight} onChange={(v) => set("highlight", v)} maxLength={40} /></FormField>
        </div></Panel>
        <Panel title="合作院校与图片"><div className="grid gap-4 sm:grid-cols-3">
          <FormField label="合作院校名称" className="sm:col-span-3"><TextInput value={p.partner} onChange={(v) => set("partner", v)} maxLength={40} /></FormField>
          <ImageField label="合作院校校徽" value={p.partnerLogo} onChange={(v) => set("partnerLogo", v)} aspect="aspect-square" contain />
          <ImageField label="封面图（3:4）*" value={p.image} onChange={(v) => set("image", v)} aspect="aspect-[3/4]" />
          <ImageField label="分享封面（5:4）" value={p.shareCover} onChange={(v) => set("shareCover", v)} aspect="aspect-[5/4]" />
        </div></Panel>
        <Panel title="详情内容"><div className="space-y-4">
          <FormField label="项目概览"><TextArea value={p.overview} onChange={(v) => set("overview", v)} maxLength={800} /></FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="培养优势" hint="每行一条"><TextArea value={p.advantages.join("\n")} onChange={(v) => set("advantages", lines(v))} rows={5} /></FormField>
            <FormField label="专业设置" hint="每行一个专业"><TextArea value={p.majors.join("\n")} onChange={(v) => set("majors", lines(v))} rows={5} /></FormField>
          </div>
          <FormField label="分享标题" hint="留空自动生成"><TextInput value={p.shareTitle} onChange={(v) => set("shareTitle", v)} maxLength={60} /></FormField>
          <FormField label="招生简章 PDF 链接"><TextInput value={p.brochureUrl} onChange={(v) => set("brochureUrl", v)} placeholder="https://" /></FormField>
          <div className="flex flex-wrap gap-6 text-sm"><span className="flex items-center gap-2"><Switch label="置顶" checked={!!p.pinned} onChange={(v) => set("pinned", v)} />置顶</span><span className="flex items-center gap-2"><Switch label="上架" checked={p.status === "上架"} onChange={(v) => set("status", v ? "上架" : "下架")} />上架</span></div>
        </div></Panel>
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-paper px-6 py-4"><Button variant="outline" onClick={onClose}>取消</Button><Button disabled={!valid} onClick={() => onSave(p)}>确定</Button></div>
    </div>
  </div>;
}
