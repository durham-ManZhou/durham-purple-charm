import { ArrowLeft, Download, MessageCircle, Pin, Search, Share2, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import campusCourtyard from "@/assets/campus-courtyard.jpg";
import campusHero from "@/assets/campus-hero.jpg";
import campusLibrary from "@/assets/campus-library.jpg";
import campusRiverside from "@/assets/campus-riverside.jpg";
import brochure from "@/assets/durham-brochure-sample.pdf.asset.json";
import logoDark from "@/assets/durham-logo-dark.svg.asset.json";
import partnerLogo1 from "@/assets/partner-logo-1.png";
import partnerLogo2 from "@/assets/partner-logo-2.png";
import partnerLogo3 from "@/assets/partner-logo-3.png";
import studentPortrait from "@/assets/student-portrait.jpg";
import studentsStudy from "@/assets/students-study.jpg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProjectType = "国际本科" | "硕士项目" | "本科直博";
export type Project = {
  id: number; type: ProjectType; name: string; partner: string; partnerLogo: string; country: string; mode: string; subject: string;
  highlight: string; image: string; pinned?: boolean; status: "上架" | "下架"; overview: string; advantages: string[]; majors: string[];
  shareTitle: string; shareCover: string; brochureUrl: string;
};

const base = { partner: "Durham University 杜伦大学", partnerLogo: logoDark.url, country: "英国", status: "上架" as const, brochureUrl: brochure.url };
const mk = (p: Omit<Project, keyof typeof base | "shareTitle" | "shareCover" | "overview" | "advantages"> & Partial<Project>): Project => ({
  ...base,
  overview: `${p.name}面向有意赴英深造的学生，课程设置、申请条件与学习安排以校方正式招生简章为准。`,
  advantages: ["世界百强 · 学院制传统", "小班导师辅导", "英国本土学位", "完善留学生支持"],
  shareTitle: `${p.name}｜杜伦大学招生`, shareCover: p.image, ...p,
});

// 演示项目：后台可添加、下架（status）、置顶（pinned）
export const projects: Project[] = [
  mk({ id: 1, type: "国际本科", name: "杜伦大学国际本科 2+2 商科项目", mode: "2+2", subject: "商科", highlight: "QS 前百名校 · 商科方向", image: studentsStudy, pinned: true, majors: ["会计与金融", "经济学", "管理学"] }),
  mk({ id: 2, type: "国际本科", name: "杜伦大学国际本科 3+1 理工项目", mode: "3+1", subject: "理工", highlight: "理工强校 · 科研氛围浓", image: campusLibrary, majors: ["计算机科学", "数学", "工程学"] }),
  mk({ id: 3, type: "国际本科", name: "杜伦大学国际本科 4+0 人文项目", mode: "4+0", subject: "人文社科", highlight: "人文传统 · 小班研讨", image: campusCourtyard, majors: ["英语文学", "历史学", "哲学"] }),
  mk({ id: 4, type: "国际本科", name: "杜伦大学本科预科衔接项目", mode: "1+3", subject: "综合", highlight: "预科衔接 · 平稳过渡", image: campusHero, majors: ["商科", "社会科学", "理工科"] }),
  mk({ id: 5, type: "国际本科", name: "杜伦大学国际本科 2+2 社科项目", mode: "2+2", subject: "人文社科", highlight: "政治国际 · 视野开阔", image: campusRiverside, majors: ["政治学", "国际关系", "社会学"] }),
  mk({ id: 6, type: "硕士项目", name: "杜伦大学金融学硕士项目", mode: "1年制", subject: "商科", highlight: "商学院三重认证 · 金融", image: studentPortrait, pinned: true, majors: ["金融学", "投资管理", "金融科技"] }),
  mk({ id: 7, type: "硕士项目", name: "杜伦大学管理学硕士项目", mode: "1年制", subject: "商科", highlight: "管理进阶 · 职业导向", image: studentsStudy, majors: ["管理学", "市场营销", "国际商务"] }),
  mk({ id: 8, type: "硕士项目", name: "杜伦大学数据科学硕士项目", mode: "1年制", subject: "理工", highlight: "数据科学 · 就业热门", image: campusLibrary, majors: ["数据科学", "人工智能", "计算机科学"] }),
  mk({ id: 9, type: "硕士项目", name: "杜伦大学教育学硕士项目", mode: "1年制", subject: "人文社科", highlight: "教育强系 · 理论实践", image: campusCourtyard, majors: ["教育学", "TESOL", "教育研究"] }),
  mk({ id: 10, type: "硕士项目", name: "杜伦大学中外合作硕士 1+1", mode: "1+1", subject: "综合", highlight: "国内加英国 · 双段培养", image: campusRiverside, majors: ["工商管理", "国际关系"] }),
  mk({ id: 11, type: "本科直博", name: "杜伦大学理学本硕博连读项目", mode: "4+4", subject: "理工", highlight: "导师制 · 前沿研究", image: campusHero, pinned: true, majors: ["物理学", "化学", "地球科学"] }),
  mk({ id: 12, type: "本科直博", name: "杜伦大学人文研究型学位项目", mode: "3+4", subject: "人文社科", highlight: "研究导向 · 学术深造", image: campusCourtyard, majors: ["历史学", "考古学", "神学与宗教"] }),
  mk({ id: 13, type: "本科直博", name: "杜伦大学工程博士衔接项目", mode: "4+3", subject: "理工", highlight: "工程研究 · 产学结合", image: campusLibrary, majors: ["工程学", "能源", "计算机科学"] }),
  // 中外合作办学项目（示例院校与校徽均为演示内容）
  mk({ id: 14, type: "国际本科", name: "杜伦大学 × 华澜大学 2+2 金融合作项目", mode: "2+2", subject: "商科", highlight: "双校联合培养 · 金融方向", image: studentsStudy, partner: "华澜大学（示例院校）", partnerLogo: partnerLogo1, majors: ["金融学", "会计学", "国际经济与贸易"] }),
  mk({ id: 15, type: "国际本科", name: "杜伦大学 × 宁州理工大学 3+1 计算机项目", mode: "3+1", subject: "理工", highlight: "中外双学位 · 计算机科学", image: campusLibrary, partner: "宁州理工大学（示例院校）", partnerLogo: partnerLogo2, majors: ["计算机科学", "软件工程", "人工智能"] }),
  mk({ id: 16, type: "国际本科", name: "杜伦大学 × 江南文理学院 4+0 传媒项目", mode: "4+0", subject: "人文社科", highlight: "国内就读 · 英式课程", image: campusCourtyard, partner: "江南文理学院（示例院校）", partnerLogo: partnerLogo3, majors: ["媒体与传播", "英语文学", "文化创意产业"] }),
  mk({ id: 17, type: "硕士项目", name: "杜伦大学 × 华澜大学 1+1 商科双硕士", mode: "1+1", subject: "商科", highlight: "一年国内 · 一年英国", image: studentPortrait, partner: "华澜大学（示例院校）", partnerLogo: partnerLogo1, majors: ["工商管理", "金融学", "商业分析"] }),
  mk({ id: 18, type: "硕士项目", name: "杜伦大学 × 宁州理工大学 1+1 工程硕士", mode: "1+1", subject: "理工", highlight: "联合导师 · 双校学位", image: campusRiverside, partner: "宁州理工大学（示例院校）", partnerLogo: partnerLogo2, majors: ["电子工程", "能源工程", "数据科学"] }),
  mk({ id: 19, type: "本科直博", name: "杜伦大学 × 江南文理学院 3+4 联培博士", mode: "3+4", subject: "理工", highlight: "本博贯通 · 联合科研", image: campusHero, partner: "江南文理学院（示例院校）", partnerLogo: partnerLogo3, majors: ["环境科学", "地球科学", "化学"] }),
];

const types: ProjectType[] = ["国际本科", "硕士项目", "本科直博"];
const fieldClass = "min-h-11 w-full rounded-md border border-input bg-paper px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

function Tag({ children, inverse }: { children: string; inverse?: boolean }) {
  return <span className={cn("rounded-sm border px-2 py-0.5 text-[11px] font-semibold", inverse ? "border-primary-foreground/40 text-primary-foreground" : "border-primary/25 bg-primary/5 text-primary")}>{children}</span>;
}

export function Overseas({ projects: all, onDetail, onConsult, scrollTop }: { projects: Project[]; onDetail: (id: number) => void; onConsult: () => void; scrollTop: () => void }) {
  const live = useMemo(() => all.filter((p) => p.status === "上架"), [all]);
  const uniq = (key: keyof Project) => Array.from(new Set(live.map((p) => String(p[key])).filter(Boolean)));
  const [type, setType] = useState<ProjectType>("国际本科");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [mode, setMode] = useState("");
  const [subject, setSubject] = useState("");
  const showFilters = live.length > 10;
  const shown = useMemo(() => live
    .filter((p) => p.type === type && (!country || p.country === country) && (!mode || p.mode === mode) && (!subject || p.subject === subject))
    .filter((p) => `${p.name}${p.partner}${p.subject}${p.majors.join("")}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)), [live, type, query, country, mode, subject]);
  const pick = (t: ProjectType) => { setType(t); scrollTop(); };
  const reset = () => { setCountry(""); setMode(""); setSubject(""); setQuery(""); };

  return <div className="animate-rise">
    <section className="bg-primary px-5 py-9 text-primary-foreground"><p className="text-xs font-bold uppercase text-accent">Overseas study</p><h1 className="mt-2 text-4xl font-bold">海外留学</h1><p className="mt-3 text-sm leading-6 text-primary-foreground/80">国际本科、硕士项目与本科直博，三类项目统一展示。</p></section>
    <div className="sticky top-[68px] z-10 border-b border-border bg-paper"><div className="grid grid-cols-3">{types.map((t) => <Button key={t} variant="ghost" onClick={() => pick(t)} className={cn("rounded-none border-b-2 px-2 text-xs", t === type ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{t}</Button>)}</div></div>
    <section className="px-4 py-5">
      {showFilters && <div className="rounded-md border border-border bg-muted/40 p-3" aria-label="项目筛选">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary"><SlidersHorizontal className="size-3.5" />项目筛选</p>
        <label className="relative block"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><input aria-label="搜索项目" value={query} maxLength={40} onChange={(e) => setQuery(e.target.value)} className={cn(fieldClass, "pl-9")} placeholder="搜索项目名称或专业" /></label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select aria-label="学历层次" value={type} onChange={(e) => pick(e.target.value as ProjectType)} className={fieldClass}>{types.map((t) => <option key={t}>{t}</option>)}</select>
          <select aria-label="国家" value={country} onChange={(e) => setCountry(e.target.value)} className={fieldClass}><option value="">全部国家</option>{uniq("country").map((v) => <option key={v}>{v}</option>)}</select>
          <select aria-label="学制模式" value={mode} onChange={(e) => setMode(e.target.value)} className={fieldClass}><option value="">全部学制</option>{uniq("mode").map((v) => <option key={v}>{v}</option>)}</select>
          <select aria-label="专业方向" value={subject} onChange={(e) => setSubject(e.target.value)} className={fieldClass}><option value="">全部方向</option>{uniq("subject").map((v) => <option key={v}>{v}</option>)}</select>
        </div>
      </div>}
      <p className="mt-4 text-xs text-muted-foreground">共 {shown.length} 个项目 · 项目信息为演示内容，以校方正式简章为准</p>
      <div className="mt-3 space-y-4">{shown.map((p) => <ProjectCard key={p.id} project={p} onDetail={() => onDetail(p.id)} onConsult={onConsult} />)}</div>
      {shown.length === 0 && <div className="py-14 text-center"><p className="text-sm text-muted-foreground">没有找到匹配项目</p><Button size="sm" variant="outline" className="mt-3" onClick={reset}>清除筛选</Button></div>}
    </section>
  </div>;
}

export function ProjectCard({ project: p, onDetail, onConsult }: { project: Project; onDetail: () => void; onConsult: () => void }) {
  return <article className="overflow-hidden rounded-md border border-border bg-paper shadow-sm">
    <div className="grid grid-cols-[minmax(116px,36%)_1fr]">
      <button type="button" onClick={onDetail} className="relative" aria-label={`查看${p.name}详情`}><img src={p.image} alt={`${p.name}封面`} width={750} height={1000} loading="lazy" className="aspect-[3/4] h-full w-full object-cover" />{p.pinned && <span className="absolute left-2 top-2 flex items-center gap-1 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground"><Pin className="size-3" />置顶</span>}</button>
      <div className="min-w-0 p-3.5">
        <h2 className="text-base font-bold leading-snug">{p.name}</h2>
        <div className="mt-2 flex items-center gap-2"><img src={p.partnerLogo} alt={`${p.partner}校徽`} className="h-6 w-auto max-w-24 object-contain object-left" /></div>
        <p className="mt-1 text-[11px] text-muted-foreground">合作院校：{p.partner}</p>
        <div className="mt-2 flex flex-wrap gap-1.5"><Tag>{p.country}</Tag><Tag>{p.mode}</Tag></div>
        <p className="mt-2 text-xs font-semibold text-primary">{p.highlight.slice(0, 20)}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 border-t border-border p-3"><Button size="sm" variant="outline" onClick={onDetail}>项目详情</Button><Button size="sm" onClick={onConsult}><MessageCircle className="size-4" />直接咨询</Button></div>
  </article>;
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return <section><div className="flex items-baseline gap-3 border-b border-border pb-2"><span className="text-xs font-bold text-primary">{n}</span><h2 className="text-xl font-bold">{title}</h2></div><div className="mt-4 text-sm leading-7 text-muted-foreground">{children}</div></section>;
}

export function ProjectDetail({ project: p, onBack, onConsult }: { project: Project | undefined; onBack: () => void; onConsult: () => void }) {
  const [shareOpen, setShareOpen] = useState(false);
  if (!p) return null;
  const share = async () => {
    const url = `${window.location.origin}/?project=${p.id}`;
    if (navigator.share) { try { await navigator.share({ title: p.shareTitle, url }); return; } catch { /* cancelled */ } }
    setShareOpen(true);
  };
  return <div className="animate-rise pb-44">
    <div className="relative h-[400px]"><img src={p.image} alt={p.name} className="size-full object-cover" /><div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary),transparent_70%)]" />
      <div className="absolute left-4 right-4 top-4 flex justify-between"><Button variant="secondary" size="icon" onClick={onBack} aria-label="返回"><ArrowLeft className="size-5" /></Button><Button variant="secondary" size="icon" onClick={share} aria-label="分享给好友"><Share2 className="size-5" /></Button></div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground"><div className="flex gap-2"><Tag inverse>{p.type}</Tag><Tag inverse>{p.country}</Tag><Tag inverse>{p.mode}</Tag></div><h1 className="mt-3 text-3xl font-bold leading-tight">{p.name}</h1><p className="mt-2 text-sm text-primary-foreground/80">{p.partner} · {p.highlight}</p></div></div>
    <div className="space-y-8 px-5 py-8">
      <Section n="01" title="项目概览"><p>{p.overview}</p></Section>
      <Section n="02" title="培养优势"><div className="grid grid-cols-2 gap-3">{p.advantages.map((a) => <div key={a} className="rounded-md border border-border p-4 text-center text-sm font-semibold text-foreground"><Sparkles className="mx-auto mb-2 size-4 text-primary" />{a}</div>)}</div></Section>
      <Section n="03" title="专业设置"><ul className="divide-y divide-border rounded-md border border-border">{p.majors.map((m) => <li key={m} className="flex justify-between p-3.5 text-foreground"><span className="font-semibold">{m}</span><span className="text-xs text-muted-foreground">{p.subject}</span></li>)}</ul></Section>
      <Section n="04" title="招生信息"><div className="divide-y divide-border rounded-md border border-border">{[["报名时间", "待校方公布"], ["录取要求", "以正式简章为准"], ["学费", "待校方公布"], ["名额", "待校方公布"]].map(([k, v]) => <div className="flex justify-between p-4" key={k}><span>{k}</span><strong className="text-foreground">{v}</strong></div>)}</div></Section>
      <Section n="05" title="报名流程"><ol className="space-y-3">{["提交意向信息", "招生顾问联系", "准备申请材料", "提交申请并完成学校审核", "获得录取与入学准备"].map((s, i) => <li key={s} className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span><span className="font-semibold text-foreground">{s}</span></li>)}</ol></Section>
    </div>
    <div className="fixed inset-x-0 bottom-17 z-20 mx-auto grid max-w-[520px] grid-cols-2 gap-2 border-t border-border bg-paper p-3">
      <Button variant="outline" asChild><a href={p.brochureUrl} download={`${p.name}-招生简章.pdf`} target="_blank" rel="noreferrer"><Download className="size-4" />招生简章 PDF 下载</a></Button>
      <Button onClick={onConsult}><MessageCircle className="size-4" />立即咨询</Button>
    </div>
    {shareOpen && <div className="fixed inset-0 z-50 grid place-items-end bg-ink/70" role="dialog" aria-modal="true" aria-label="分享给好友" onClick={() => setShareOpen(false)}>
      <div className="w-full max-w-[520px] justify-self-center rounded-t-md bg-paper p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">分享给好友</h2><Button size="icon" variant="ghost" onClick={() => setShareOpen(false)} aria-label="关闭"><X className="size-5" /></Button></div>
        <div className="mt-4 flex gap-3 rounded-md border border-border p-3"><img src={p.shareCover} alt="分享封面" className="aspect-[5/4] w-24 rounded-sm object-cover" /><div><p className="text-sm font-bold">{p.shareTitle}</p><p className="mt-1 text-xs text-muted-foreground">分享标题与封面可在后台配置</p></div></div>
        <Button className="mt-4 w-full" onClick={async () => { await navigator.clipboard?.writeText(`${p.shareTitle} ${window.location.origin}/?project=${p.id}`).catch(() => undefined); toast.success("分享链接已复制，在微信中可直接发送给好友"); setShareOpen(false); }}>复制分享链接</Button>
      </div>
    </div>}
  </div>;
}
