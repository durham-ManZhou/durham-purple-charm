import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, BookOpen, Building2, CalendarDays, Check, ChevronRight,
  CircleUserRound, Clock3, ExternalLink, GraduationCap, Landmark, Mail, MapPin,
  MessageCircle, Phone, Search, ShieldCheck, University, UsersRound, X,
} from "lucide-react";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

import campusHero from "@/assets/campus-hero.jpg";
import crest from "@/assets/durham-university-crest.png.asset.json";
import studentPortrait from "@/assets/student-portrait.jpg";
import studentsStudy from "@/assets/students-study.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "杜伦大学｜中文招生信息" },
      { name: "description", content: "杜伦大学课程、申请、校园生活与到访信息。" },
      { property: "og:title", content: "杜伦大学｜中文招生信息" },
      { property: "og:description", content: "杜伦大学课程、申请、校园生活与到访信息。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DurhamApp,
});

type MainTab = "home" | "study" | "contact";
type StudyLevel = "本科课程" | "授课型硕士" | "研究型学位";

const courses = [
  { id: 1, level: "本科课程" as const, school: "Durham University Business School", title: "商科与管理", area: "Business & Management", note: "探索会计、金融、市场营销与管理方向", image: studentsStudy },
  { id: 2, level: "本科课程" as const, school: "Faculty of Science", title: "计算机科学", area: "Computer Science", note: "以严谨的理论基础连接技术实践", image: campusHero },
  { id: 3, level: "授课型硕士" as const, school: "Durham University Business School", title: "金融与经济", area: "Finance & Economics", note: "查看相关硕士课程与入学要求", image: studentPortrait },
  { id: 4, level: "授课型硕士" as const, school: "Faculty of Social Sciences and Health", title: "教育与社会科学", area: "Education & Social Sciences", note: "跨学科理解社会、政策与教育", image: studentsStudy },
  { id: 5, level: "研究型学位" as const, school: "Durham Doctoral College", title: "博士研究", area: "Postgraduate Research", note: "了解研究方向、导师与申请流程", image: campusHero },
];

const fieldClass = "min-h-12 w-full rounded-none border border-input bg-paper px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function DurhamApp() {
  const [tab, setTab] = useState<MainTab>("home");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [consultOpen, setConsultOpen] = useState(false);
  const changeTab = (next: MainTab) => { setTab(next); setDetailId(null); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto min-h-screen max-w-[1180px] bg-paper md:my-5 md:min-h-[calc(100vh-2.5rem)] md:border md:border-border">
        <TopBar onContact={() => changeTab("contact")} />
        <main className="pb-24">
          {tab === "home" && <Home onStudy={() => changeTab("study")} onVisit={() => changeTab("contact")} />}
          {tab === "study" && (detailId ? <CourseDetail id={detailId} onBack={() => setDetailId(null)} onContact={() => setConsultOpen(true)} /> : <Study onDetail={setDetailId} />)}
          {tab === "contact" && <Contact />}
        </main>
        <Button aria-label="招生咨询" title="招生咨询" size="icon" onClick={() => setConsultOpen(true)} className="fixed bottom-23 right-4 z-30 rounded-full shadow-lg md:right-[calc(50%-34.5rem)]"><MessageCircle className="size-5" /></Button>
        <BottomNav tab={tab} onChange={changeTab} />
      </div>
      {consultOpen && <ConsultModal onClose={() => setConsultOpen(false)} onForm={() => { setConsultOpen(false); changeTab("contact"); }} />}
      <Toaster position="top-center" richColors />
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex min-w-0 items-center gap-3">
    <img src={crest.url} alt="杜伦大学校徽" className={cn("shrink-0 object-contain", compact ? "h-10 w-9" : "h-14 w-12")} />
    <div className="min-w-0 border-l border-border pl-3"><p className={cn("font-display font-bold leading-none text-primary", compact ? "text-base" : "text-xl")}>Durham University</p><p className="mt-1 text-xs font-semibold text-foreground">杜伦大学</p></div>
  </div>;
}

function TopBar({ onContact }: { onContact: () => void }) {
  return <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border bg-paper/97 px-4 backdrop-blur sm:px-7"><Brand compact /><Button variant="ghost" size="sm" onClick={onContact}>招生联系 <ChevronRight className="size-4" /></Button></header>;
}

function Home({ onStudy, onVisit }: { onStudy: () => void; onVisit: () => void }) {
  return <div className="animate-rise">
    <section className="relative min-h-[530px] overflow-hidden sm:min-h-[610px]">
      <img src={campusHero} alt="杜伦大学校园" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary)_0%,color-mix(in_oklab,var(--primary)_76%,transparent)_34%,transparent_72%)]" />
      <div className="absolute inset-x-0 bottom-0 px-5 pb-9 text-primary-foreground sm:px-10 sm:pb-12">
        <div className="mb-5 flex items-center gap-3"><span className="h-px w-10 bg-accent" /><span className="text-xs font-semibold uppercase">A collegiate university since 1832</span></div>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.15] sm:text-6xl">在杜伦，开启你的下一段学术旅程</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/85 sm:text-base">探索课程、学院制生活、申请流程与校园到访信息。</p>
        <div className="mt-7 flex flex-wrap gap-3"><Button variant="gold" onClick={onStudy}>查找课程 <Search className="size-4" /></Button><Button variant="outline" className="border-primary-foreground/60 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" onClick={onVisit}>预约到访 <CalendarDays className="size-4" /></Button></div>
      </div>
    </section>

    <section className="border-b border-border px-5 py-9 sm:px-10"><div className="grid grid-cols-3 divide-x divide-border border-y border-border py-5 text-center"><Stat value="1832" label="创校年份" /><Stat value="17" label="学院" /><Stat value="世界级" label="教学与研究" /></div><p className="mt-3 text-center text-[11px] text-muted-foreground">信息请以杜伦大学官网最新公布为准</p></section>

    <section className="px-5 py-11 sm:px-10"><SectionHeading eyebrow="Explore Durham" title="了解杜伦" description="从学术选择到学院生活，获取你需要的关键信息。" /><div className="mt-7 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">{[
      [BookOpen, "课程与专业", "浏览本科与研究生课程", onStudy], [Landmark, "学院制体验", "了解独特的学院社区", () => toast("学院介绍内容待校方接入")], [UsersRound, "校园生活", "住宿、社团与学生支持", () => toast("校园生活内容待校方接入")], [CalendarDays, "开放日", "规划线上或线下到访", onVisit],
    ].map(([Icon,title,text,action]) => { const ItemIcon = Icon as typeof BookOpen; return <button key={title as string} onClick={action as () => void} className="group min-h-48 border-b border-r border-border bg-paper p-5 text-left transition hover:bg-muted"><ItemIcon className="size-6 text-primary" /><h3 className="mt-8 text-lg font-bold">{title as string}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{text as string}</p><ArrowRight className="mt-5 size-4 text-primary transition group-hover:translate-x-1" /></button>; })}</div></section>

    <section className="grid border-y border-border md:grid-cols-2"><div className="relative min-h-[390px]"><img src={studentsStudy} alt="杜伦大学学生学习场景" className="absolute inset-0 size-full object-cover" /></div><div className="bg-primary p-7 text-primary-foreground sm:p-11"><p className="text-xs font-bold uppercase text-accent">The Durham difference</p><h2 className="mt-3 text-3xl font-bold">学术卓越，亦有归属</h2><p className="mt-5 text-sm leading-7 text-primary-foreground/80">杜伦将世界级学术环境与学院社区相结合，让学习、生活和成长彼此连接。</p><div className="mt-8 space-y-5">{["广泛的本科、硕士与研究型课程", "由学院构成的多元学生社区", "历史名城中的独特校园体验"].map((item) => <div key={item} className="flex gap-3 border-t border-primary-foreground/20 pt-4"><Check className="mt-0.5 size-4 shrink-0 text-accent" /><span className="text-sm">{item}</span></div>)}</div><Button variant="gold" className="mt-8" onClick={onStudy}>探索课程 <ArrowRight className="size-4" /></Button></div></section>

    <section className="px-5 py-11 sm:px-10"><div className="grid gap-7 sm:grid-cols-[170px_1fr]"><img src={studentPortrait} alt="杜伦大学学生" className="h-56 w-full object-cover sm:h-60" /><div className="flex flex-col justify-center"><p className="text-xs font-bold uppercase text-primary">Student experience</p><h2 className="mt-3 text-3xl font-bold">属于你的杜伦体验</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">在学院社区中结识来自世界各地的同学，参与丰富的社团、体育与文化活动，并获得贯穿学业的支持。</p></div></div></section>
  </div>;
}

function Study({ onDetail }: { onDetail: (id: number) => void }) {
  const [level, setLevel] = useState<StudyLevel>("本科课程");
  const [query, setQuery] = useState("");
  const shown = useMemo(() => courses.filter((course) => course.level === level && `${course.title}${course.area}${course.school}`.toLowerCase().includes(query.toLowerCase())), [level, query]);
  return <div className="animate-rise"><PageIntro eyebrow="Study at Durham" title="查找你的课程" text="按学习阶段浏览学科方向。具体课程、学制与入学要求请以校方课程目录为准。" />
    <div className="sticky top-[72px] z-10 border-b border-border bg-paper px-4 pt-3"><div className="flex overflow-x-auto">{(["本科课程", "授课型硕士", "研究型学位"] as StudyLevel[]).map((item) => <Button key={item} variant="ghost" onClick={() => setLevel(item)} className={cn("min-w-max rounded-none border-b-2 px-4", item === level ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{item}</Button>)}</div></div>
    <section className="px-5 py-7 sm:px-10"><div className="relative mb-7"><Search className="absolute left-3 top-4 size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="搜索课程" className={cn(fieldClass, "pl-10")} placeholder="搜索学科或院系" /></div><div className="grid gap-5 sm:grid-cols-2">{shown.map((course) => <article key={course.id} className="group border border-border bg-paper"><div className="aspect-[16/9] overflow-hidden"><img src={course.image} alt={course.title} className="size-full object-cover transition duration-500 group-hover:scale-[1.02]" /></div><div className="p-5"><p className="text-[11px] font-semibold uppercase text-primary">{course.school}</p><h2 className="mt-2 text-2xl font-bold">{course.title}</h2><p className="mt-1 text-xs text-muted-foreground">{course.area}</p><p className="mt-4 text-sm leading-6 text-muted-foreground">{course.note}</p><Button variant="outline" className="mt-5 w-full" onClick={() => onDetail(course.id)}>查看课程方向 <ArrowRight className="size-4" /></Button></div></article>)}</div>{shown.length === 0 && <p className="py-14 text-center text-sm text-muted-foreground">没有找到匹配的课程方向</p>}</section>
  </div>;
}

function CourseDetail({ id, onBack, onContact }: { id: number; onBack: () => void; onContact: () => void }) {
  const course = courses.find((item) => item.id === id); if (!course) return null;
  return <div className="animate-rise pb-12"><div className="relative h-[370px]"><img src={course.image} alt={course.title} className="size-full object-cover" /><div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary),transparent)]" /><Button variant="secondary" size="icon" onClick={onBack} className="absolute left-4 top-4" aria-label="返回"><ArrowLeft className="size-5" /></Button><div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground"><p className="text-xs font-semibold uppercase text-accent">{course.area}</p><h1 className="mt-2 text-4xl font-bold">{course.title}</h1><p className="mt-2 text-sm text-primary-foreground/80">{course.school}</p></div></div><div className="px-5 py-9 sm:px-10"><DetailSection number="01" title="课程方向"><p>{course.note}。此页面为学科方向导览，具体课程名称、模块设置和申请开放情况以杜伦大学官网课程目录为准。</p></DetailSection><DetailSection number="02" title="申请前准备"><div className="grid gap-3 sm:grid-cols-3">{["确认学习阶段", "核对学术要求", "准备语言与申请材料"].map((item) => <div className="border border-border p-4 text-sm font-semibold" key={item}><Check className="mb-3 size-4 text-primary" />{item}</div>)}</div></DetailSection><DetailSection number="03" title="重要提示"><p>不同课程的截止日期、语言要求和材料可能不同。提交申请前，请查阅校方最新课程页面。</p></DetailSection><div className="grid gap-3 sm:grid-cols-2"><Button variant="outline" onClick={() => window.open("https://www.durham.ac.uk/study/courses/", "_blank", "noopener,noreferrer")}>访问官方课程目录 <ExternalLink className="size-4" /></Button><Button onClick={onContact}>联系招生团队 <MessageCircle className="size-4" /></Button></div></div></div>;
}

function Contact() {
  const [mode, setMode] = useState<"lead" | "booking">("lead");
  return <div className="animate-rise"><PageIntro eyebrow="Admissions & Visits" title="招生联系与校园到访" text="提交你的问题或预约到访意向。校方确认前，请勿据此安排不可更改的行程。" /><div className="grid lg:grid-cols-[1.35fr_.65fr]"><section className="px-5 py-8 sm:px-10"><div className="mb-7 grid grid-cols-2 border border-border p-1"><Button variant="ghost" className={cn("rounded-none", mode === "lead" && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")} onClick={() => setMode("lead")}>招生咨询</Button><Button variant="ghost" className={cn("rounded-none", mode === "booking" && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")} onClick={() => setMode("booking")}>预约到访</Button></div>{mode === "lead" ? <LeadForm /> : <BookingForm />}</section><aside className="border-t border-border bg-muted px-5 py-8 sm:px-8 lg:border-l lg:border-t-0"><img src={crest.url} alt="杜伦大学校徽" className="h-24 w-20 object-contain" /><h2 className="mt-5 text-2xl font-bold">Durham University</h2><p className="mt-1 text-sm font-semibold text-primary">杜伦大学</p><div className="mt-7 space-y-3"><ContactLine icon={<MapPin />} title="主校区" detail="Durham, United Kingdom" /><ContactLine icon={<University />} title="官方课程目录" detail="durham.ac.uk/study/courses" action="打开" onClick={() => window.open("https://www.durham.ac.uk/study/courses/", "_blank", "noopener,noreferrer")} /><ContactLine icon={<ShieldCheck />} title="信息说明" detail="申请要求与日期以校方官网为准" /></div></aside></div></div>;
}

function LeadForm() {
  const [sending, setSending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSending(true); const form = event.currentTarget; const data = new FormData(form); const { error } = await supabase.from("leads").insert({ name: String(data.get("name")), phone: String(data.get("phone")), education: String(data.get("education")), intended_program: String(data.get("program")), intended_countries: ["英国"], entry_year: String(data.get("year") || ""), budget: "", notes: String(data.get("notes") || "") }); setSending(false); if (error) { toast.error("提交失败，请稍后重试"); return; } toast.success("信息已提交"); form.reset(); };
  return <form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="姓名 *"><input name="name" required minLength={2} maxLength={20} className={fieldClass} /></Field><Field label="手机号 *"><input name="phone" required pattern="1[3-9][0-9]{9}" inputMode="tel" className={fieldClass} placeholder="11 位手机号" /></Field><Field label="当前学习阶段 *"><select name="education" required className={fieldClass} defaultValue=""><option value="" disabled>请选择</option>{["高中阶段", "本科阶段", "硕士阶段", "其他"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="咨询方向 *"><select name="program" required className={fieldClass} defaultValue=""><option value="" disabled>请选择</option>{["本科课程", "授课型硕士", "研究型学位", "暂不确定"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="计划入学年份"><select name="year" className={fieldClass}><option>2027</option><option>2028</option><option>暂不确定</option></select></Field></div><Field label="你的问题"><textarea name="notes" maxLength={300} rows={5} className={cn(fieldClass, "py-3")} placeholder="请简要说明希望了解的内容" /></Field><label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input required type="checkbox" className="mt-1 accent-primary" />我已阅读并同意隐私保护指引，同意将信息用于招生联系。</label><Button disabled={sending} className="w-full">{sending ? "正在提交…" : "提交咨询"}<ArrowRight className="size-4" /></Button></form>;
}

function BookingForm() {
  const [sending, setSending] = useState(false); const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSending(true); const form = event.currentTarget; const data = new FormData(form); const code = `DU-${Date.now().toString().slice(-6)}`; const { error } = await supabase.from("bookings").insert({ name: String(data.get("name")), phone: String(data.get("phone")), visit_date: String(data.get("date")), time_slot: String(data.get("slot")), party_size: Number(data.get("party")), notes: String(data.get("notes") || ""), visit_code: code }); setSending(false); if (error) { toast.error("提交失败，请检查信息后重试"); return; } toast.success(`到访意向已提交，编号：${code}`, { duration: 8000 }); form.reset(); };
  return <form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="姓名 *"><input name="name" required minLength={2} maxLength={20} className={fieldClass} /></Field><Field label="手机号 *"><input name="phone" required pattern="1[3-9][0-9]{9}" inputMode="tel" className={fieldClass} /></Field><Field label="期望日期 *"><input name="date" type="date" min={minDate} required className={fieldClass} /></Field><Field label="期望时段 *"><select name="slot" required className={fieldClass}><option value="上午">上午</option><option value="下午">下午</option></select></Field><Field label="到访人数 *"><input name="party" type="number" min={1} max={10} defaultValue={2} required className={fieldClass} /></Field></div><div className="border-l-2 border-primary bg-muted p-4 text-xs leading-5 text-muted-foreground"><Clock3 className="mb-2 size-4 text-primary" />此表仅收集到访意向，日期与安排须经校方确认。</div><Field label="备注"><textarea name="notes" maxLength={300} rows={4} className={cn(fieldClass, "py-3")} /></Field><Button disabled={sending} className="w-full">{sending ? "正在提交…" : "提交到访意向"}<CalendarDays className="size-4" /></Button></form>;
}

function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <section className="bg-primary px-5 py-10 text-primary-foreground sm:px-10 sm:py-12"><p className="text-xs font-bold uppercase text-accent">{eyebrow}</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/80">{text}</p></section>; }
function Stat({ value, label }: { value: string; label: string }) { return <div className="px-2"><strong className="font-display text-xl text-primary sm:text-3xl">{value}</strong><span className="mt-1 block text-[10px] text-muted-foreground sm:text-xs">{label}</span></div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) { return <div><p className="text-xs font-bold uppercase text-primary">{eyebrow}</p><h2 className="mt-2 text-3xl font-bold">{title}</h2>{description && <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>}</div>; }
function DetailSection({ number, title, children }: { number: string; title: string; children: ReactNode }) { return <section className="mb-9"><div className="mb-4 flex items-baseline gap-3 border-b border-border pb-3"><span className="font-display text-sm text-accent">{number}</span><h2 className="text-2xl font-bold">{title}</h2></div><div className="text-sm leading-7 text-muted-foreground">{children}</div></section>; }
function ContactLine({ icon, title, detail, action, onClick }: { icon: ReactNode; title: string; detail: string; action?: string; onClick?: () => void }) { return <button onClick={onClick} disabled={!onClick} className="flex w-full items-center gap-4 border border-border bg-paper p-4 text-left disabled:opacity-100"><span className="text-primary [&>svg]:size-5">{icon}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block break-words text-xs text-muted-foreground">{detail}</span></span>{action && <ExternalLink className="size-4 shrink-0 text-muted-foreground" />}</button>; }
function BottomNav({ tab, onChange }: { tab: MainTab; onChange: (tab: MainTab) => void }) { const items: [MainTab, typeof University, string][] = [["home", University, "杜伦首页"], ["study", GraduationCap, "课程学习"], ["contact", Phone, "招生联系"]]; return <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-17 max-w-[1180px] grid-cols-3 border-t border-border bg-paper pb-[env(safe-area-inset-bottom)]">{items.map(([value,Icon,label]) => <button key={value} onClick={() => onChange(value)} className={cn("relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold", tab === value ? "text-primary" : "text-muted-foreground")}>{tab === value && <span className="absolute top-0 h-0.5 w-9 bg-primary" />}<Icon className="size-5" />{label}</button>)}</nav>; }
function ConsultModal({ onClose, onForm }: { onClose: () => void; onForm: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-end bg-ink/65 sm:place-items-center" role="dialog" aria-modal="true" aria-label="招生咨询"><div className="w-full max-w-md bg-paper p-6 shadow-2xl"><div className="flex items-start justify-between"><Brand compact /><Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭"><X className="size-5" /></Button></div><div className="mt-6 border-l-2 border-primary bg-muted p-4"><p className="text-sm font-semibold">招生信息咨询</p><p className="mt-2 text-xs leading-6 text-muted-foreground">请留下你的学习阶段和咨询方向。课程要求、截止日期与录取决定以校方正式信息为准。</p></div><Button className="mt-5 w-full" onClick={onForm}>填写咨询信息 <ArrowRight className="size-4" /></Button></div></div>; }
