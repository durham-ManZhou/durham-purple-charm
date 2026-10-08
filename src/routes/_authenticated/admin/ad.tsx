import { createFileRoute } from "@tanstack/react-router";
import { FormField, ImageField, Loading, PageHeader, Panel, SaveButton, Switch, TextInput, adminField, useContentDraft } from "@/components/admin/kit";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/ad")({ component: AdAdmin });

function AdAdmin() {
  const { draft, update, save, saving, dirty, loading } = useContentDraft("launch_ad");
  const projects = useSiteContent("projects").filter((p) => p.status === "上架");
  if (loading || !draft) return <Loading />;
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => update((o) => ({ ...o, [k]: v }));
  return <div className="space-y-6">
    <PageHeader eyebrow="Launch advert" title="启动弹窗" description="每位用户每天首次打开小程序时展示一次，点击跳转到所选项目详情。" actions={<SaveButton saving={saving} dirty={dirty} onClick={() => save((v) => (v.title.trim() ? null : "请填写标题"))} />} />
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <Panel title="弹窗设置"><div className="space-y-4">
        <div className="flex items-center gap-3 text-sm"><Switch label="启用弹窗" checked={draft.enabled} onChange={(v) => set("enabled", v)} />{draft.enabled ? "已启用" : "已关闭"}</div>
        <FormField label="角标文字"><TextInput value={draft.label} onChange={(v) => set("label", v)} maxLength={10} /></FormField>
        <FormField label="标题 *"><TextInput value={draft.title} onChange={(v) => set("title", v)} maxLength={20} /></FormField>
        <FormField label="副标题"><TextInput value={draft.subtitle} onChange={(v) => set("subtitle", v)} maxLength={30} /></FormField>
        <FormField label="跳转项目"><select value={draft.projectId} onChange={(e) => set("projectId", Number(e.target.value))} className={adminField}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></FormField>
        <div className="max-w-[220px]"><ImageField label="弹窗图片（3:4）" value={draft.image} onChange={(v) => set("image", v)} aspect="aspect-[3/4]" /></div>
      </div></Panel>
      <div><p className="mb-2 text-xs font-semibold text-muted-foreground">预览</p><div className="relative overflow-hidden rounded-md bg-primary shadow-lg"><img src={draft.image} alt="" className="aspect-[3/4] w-full object-cover" /><div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary)_2%,transparent_70%)]" /><div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground"><p className="text-xs font-bold text-accent">{draft.label}</p><h3 className="mt-1 font-display text-2xl font-bold">{draft.title}</h3><p className="mt-1 text-xs text-primary-foreground/80">{draft.subtitle}</p></div></div></div>
    </div>
  </div>;
}
