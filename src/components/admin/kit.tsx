import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { defaultContent, imageFileToDataUrl, saveSiteContent, siteContentQuery, type ContentKey, type SiteContent } from "@/lib/site-content";

export const adminField = "min-h-10 w-full rounded-md border border-input bg-paper px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p><h1 className="mt-2 font-display text-3xl font-bold">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </header>;
}

export function Panel({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return <section className={cn("rounded-md border border-border bg-paper p-5 shadow-sm", className)}>
    {(title || actions) && <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">{title && <h2 className="font-display text-lg font-bold">{title}</h2>}{actions}</div>}
    {children}
  </section>;
}

export function FormField({ label, hint, children, className }: { label: string; hint?: string | undefined; children: ReactNode; className?: string | undefined }) {
  return <label className={cn("block", className)}><span className="mb-1.5 block text-xs font-semibold text-foreground">{label}</span>{children}{hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}</label>;
}

export function TextInput({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={cn(adminField, rest.className)} />;
}

export function TextArea({ value, onChange, rows = 4, ...rest }: { value: string; onChange: (v: string) => void; rows?: number } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  return <textarea {...rest} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={cn(adminField, "leading-6", rest.className)} />;
}

export function ImageField({ label, value, onChange, aspect = "aspect-[4/3]", contain }: { label: string; value: string; onChange: (v: string) => void; aspect?: string; contain?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try { onChange(await imageFileToDataUrl(file, contain ? 600 : 1200)); } catch (e) { toast.error(e instanceof Error ? e.message : "图片上传失败"); }
    setBusy(false);
  };
  return <div>
    <span className="mb-1.5 block text-xs font-semibold">{label}</span>
    <button type="button" onClick={() => ref.current?.click()} className={cn("group relative w-full overflow-hidden rounded-md border border-dashed border-input bg-muted", aspect)}>
      {value ? <img src={value} alt={label} className={cn("size-full", contain ? "object-contain p-3" : "object-cover")} /> : <span className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">点击上传图片</span>}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-ink/70 py-1.5 text-[11px] font-semibold text-paper opacity-0 transition group-hover:opacity-100">{busy ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}更换图片</span>
    </button>
    <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
  </div>;
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition", checked ? "bg-primary" : "bg-input")}>
    <span className={cn("inline-block size-5 rounded-full bg-paper shadow transition", checked ? "translate-x-5" : "translate-x-0.5")} />
  </button>;
}

/** Load a content block for editing; returns a local draft plus save. */
export function useContentDraft<K extends ContentKey>(key: K) {
  const qc = useQueryClient();
  const q = useQuery(siteContentQuery(key));
  const [draft, setDraft] = useState<SiteContent[K] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (q.isSuccess && draft === null) setDraft(structuredClone(q.data ?? defaultContent[key]));
  }, [q.isSuccess, q.data, draft, key]);
  const update = (next: SiteContent[K] | ((old: SiteContent[K]) => SiteContent[K])) => {
    setDraft((old) => (old === null ? old : typeof next === "function" ? (next as (o: SiteContent[K]) => SiteContent[K])(old) : next));
    setDirty(true);
  };
  const save = async (validate?: (v: SiteContent[K]) => string | null) => {
    if (!draft) return;
    const problem = validate?.(draft);
    if (problem) { toast.error(problem); return; }
    setSaving(true);
    try {
      await saveSiteContent(key, draft);
      await qc.invalidateQueries({ queryKey: ["site_content", key] });
      setDirty(false);
      toast.success("已保存，小程序内容已更新");
    } catch { toast.error("保存失败，请确认账号权限后重试"); }
    setSaving(false);
  };
  return { draft, update, save, saving, dirty, loading: q.isLoading, savedOnce: q.data != null };
}

export function SaveButton({ onClick, saving, dirty }: { onClick: () => void; saving: boolean; dirty: boolean }) {
  return <Button onClick={onClick} disabled={saving || !dirty}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{dirty ? "保存并发布" : "已是最新"}</Button>;
}

export function Loading() {
  return <div className="grid min-h-60 place-items-center text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
}

export const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export function downloadCsv(name: string, rows: (string | number | null)[][]) {
  const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

