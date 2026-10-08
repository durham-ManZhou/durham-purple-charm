import { createFileRoute } from "@tanstack/react-router";
import { FileText, Play, Plus, Trash2 } from "lucide-react";
import { FormField, ImageField, Loading, PageHeader, Panel, SaveButton, TextArea, TextInput, adminField, useContentDraft } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import type { StoryContent, StudentStory } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/stories")({ component: StoriesAdmin });

function StoriesAdmin() {
  const { draft, update, save, saving, dirty, loading } = useContentDraft("student_stories");
  if (loading || !draft) return <Loading />;
  const setStory = (id: number, p: Partial<StudentStory>) => update((a) => a.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const setContent = (s: StudentStory, cid: string, p: Partial<StoryContent>) => setStory(s.id, { contents: s.contents.map((c) => (c.id === cid ? { ...c, ...p } : c)) });
  const addContent = (s: StudentStory, type: StoryContent["type"]) => setStory(s.id, { contents: [...s.contents, { id: `${s.id}-${Date.now()}`, type, title: "", image: s.image, body: "", video: "" }] });
  return <div className="space-y-6">
    <PageHeader eyebrow="Student stories" title="学生访谈" description="按学生维护图文和视频。同一学生的内容在小程序中连续展示，没有的类型不显示。" actions={<>
      <Button variant="outline" onClick={() => update((a) => [{ id: Math.max(0, ...a.map((s) => s.id)) + 1, name: "", offer: "", quote: "", image: "", contents: [] }, ...a])}><Plus className="size-4" />添加学生</Button>
      <SaveButton saving={saving} dirty={dirty} onClick={() => save((v) => (v.some((s) => !s.name.trim() || !s.image) ? "每位学生都需要姓名和头像" : v.some((s) => !s.contents.length) ? "每位学生至少需要一条图文或视频" : null))} />
    </>} />
    {draft.map((s) => <Panel key={s.id} title={s.name || "新学生"} actions={<Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm("删除这位学生及其全部内容？")) update((a) => a.filter((x) => x.id !== s.id)); }}><Trash2 className="size-4" />删除</Button>}>
      <div className="grid gap-5 md:grid-cols-[160px_1fr]">
        <ImageField label="头像/封面" value={s.image} onChange={(v) => setStory(s.id, { image: v })} aspect="aspect-[3/4]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="学生姓名"><TextInput value={s.name} maxLength={20} onChange={(v) => setStory(s.id, { name: v })} /></FormField>
          <FormField label="录取院校"><TextInput value={s.offer} maxLength={40} onChange={(v) => setStory(s.id, { offer: v })} /></FormField>
          <FormField label="一句话感言" className="sm:col-span-2"><TextInput value={s.quote} maxLength={60} onChange={(v) => setStory(s.id, { quote: v })} /></FormField>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {s.contents.map((c) => <div key={c.id} className="rounded-md border border-border bg-muted/40 p-4">
          <div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-primary">{c.type === "图文" ? <FileText className="size-3.5" /> : <Play className="size-3.5" />}{c.type}</span><Button size="sm" variant="ghost" className="text-destructive" onClick={() => setStory(s.id, { contents: s.contents.filter((x) => x.id !== c.id) })}><Trash2 className="size-4" /></Button></div>
          <div className="grid gap-4 md:grid-cols-[140px_1fr]">
            <ImageField label={c.type === "视频" ? "视频封面" : "配图"} value={c.image} onChange={(v) => setContent(s, c.id, { image: v })} />
            <div className="space-y-3">
              <FormField label="标题"><TextInput value={c.title} maxLength={50} onChange={(v) => setContent(s, c.id, { title: v })} /></FormField>
              {c.type === "视频" ? <FormField label="视频链接" hint="填写可直接播放的 mp4 地址"><input value={c.video ?? ""} onChange={(e) => setContent(s, c.id, { video: e.target.value })} placeholder="https://…/video.mp4" className={adminField} /></FormField>
                : <FormField label="正文" hint="空行分段"><TextArea value={c.body ?? ""} rows={6} maxLength={5000} onChange={(v) => setContent(s, c.id, { body: v })} /></FormField>}
            </div>
          </div>
        </div>)}
        <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => addContent(s, "图文")}><FileText className="size-4" />添加图文</Button><Button size="sm" variant="outline" onClick={() => addContent(s, "视频")}><Play className="size-4" />添加视频</Button></div>
      </div>
    </Panel>)}
  </div>;
}
