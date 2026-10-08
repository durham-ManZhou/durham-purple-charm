import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { FormField, ImageField, Loading, PageHeader, Panel, SaveButton, TextInput, useContentDraft } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/campus")({ component: CampusAdmin });

function CampusAdmin() {
  const { draft, update, save, saving, dirty, loading } = useContentDraft("campus_scenes");
  if (loading || !draft) return <Loading />;
  const move = (i: number, d: number) => update((a) => { const b = [...a]; const [x] = b.splice(i, 1); if (x) b.splice(i + d, 0, x); return b; });
  return <div className="space-y-6">
    <PageHeader eyebrow="Campus gallery" title="校园环境" description="轮播图集，每张图配一句说明，按顺序自动播放。" actions={<>
      <Button variant="outline" onClick={() => update((a) => [...a, { image: "", title: "", caption: "" }])}><Plus className="size-4" />添加图片</Button>
      <SaveButton saving={saving} dirty={dirty} onClick={() => save((v) => (!v.length ? "至少保留一张图片" : v.some((s) => !s.image || !s.title.trim()) ? "每张图片都需要上传图片并填写标题" : null))} />
    </>} />
    <div className="grid gap-4 md:grid-cols-2">{draft.map((s, i) => <Panel key={i} title={`第 ${i + 1} 张`} actions={<div className="flex gap-1">
      <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="上移"><ArrowUp className="size-4" /></Button>
      <Button size="icon" variant="ghost" disabled={i === draft.length - 1} onClick={() => move(i, 1)} aria-label="下移"><ArrowDown className="size-4" /></Button>
      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => update((a) => a.filter((_, j) => j !== i))} aria-label="删除"><Trash2 className="size-4" /></Button>
    </div>}><div className="space-y-3">
      <ImageField label="图片" value={s.image} onChange={(v) => update((a) => a.map((x, j) => (j === i ? { ...x, image: v } : x)))} />
      <FormField label="标题"><TextInput value={s.title} maxLength={20} onChange={(v) => update((a) => a.map((x, j) => (j === i ? { ...x, title: v } : x)))} /></FormField>
      <FormField label="说明"><TextInput value={s.caption} maxLength={60} onChange={(v) => update((a) => a.map((x, j) => (j === i ? { ...x, caption: v } : x)))} /></FormField>
    </div></Panel>)}</div>
  </div>;
}
