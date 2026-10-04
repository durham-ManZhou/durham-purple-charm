import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, BookOpen, Building2, CalendarDays, Check, ChevronRight,
  Clock3, Download, ExternalLink, FileText, GraduationCap, Headphones, Mail, MapPin,
  MessageCircle, Phone, Play, Search, Share2, Sparkles, University, UsersRound, X,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

import campusHero from "@/assets/campus-hero.jpg";
import logoDark from "@/assets/durham-logo-dark.svg.asset.json";
import logoWhite from "@/assets/durham-logo-white.svg.asset.json";
import studentPortrait from "@/assets/student-portrait.jpg";
import studentsStudy from "@/assets/students-study.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "杜伦大学招生小程序" },
    { name: "description", content: "杜伦大学学校介绍、海外留学项目、招生咨询与到校预约。" },
    { property: "og:title", content: "杜伦大学招生小程序" },
    { property: "og:description", content: "杜伦大学学校介绍、海外留学项目、招生咨询与到校预约。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdmissionsApp,
});

type MainTab = "school" | "overseas" | "contact";
type SchoolView = "index" | "about" | "faculty" | "campus" | "interviews";
type ProjectType = "国际本科" | "硕士项目" | "本科直博";
type Project = { id: number; type: ProjectType; name: string; partner: string; country: string; mode: string; subject: string; highlight: string; image: string };

const projects: Project[] = [
  { id: 1, type: "国际本科", name: "杜伦大学国际本科衔接项目", partner: "Durham University", country: "英国", mode: "衔接课程", subject: "商科方向", highlight: "英伦名校 · 商科方向", image: studentsStudy },
  { id: 2, type: "国际本科", name: "英国本科升学规划项目", partner: "Durham University", country: "英国", mode: "本科申请", subject: "综合方向", highlight: "个性规划 · 多元专业", image: campusHero },
  { id: 3, type: "硕士项目", name: "杜伦大学硕士升学项目", partner: "Durham University", country: "英国", mode: "1 年制", subject: "金融与管理", highlight: "聚焦专业 · 学术进阶", image: studentPortrait },
  { id: 4, type: "本科直博", name: "杜伦大学研究型学位项目", partner: "Durham University", country: "英国", mode: "研究型", subject: "跨学科研究", highlight: "导师指导 · 前沿研究", image: campusHero },
];

const fieldClass = "min-h-12 w-full rounded-md border border-input bg-paper px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function AdmissionsApp() {
  const [tab, setTab] = useState<MainTab>("school");
  const [schoolView, setSchoolView] = useState<SchoolView>("index");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [consultOpen, setConsultOpen] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  useEffect(() => {
    const key = `durham-ad-${new Date().toISOString().slice(0, 10)}`;
    if (!localStorage.getItem(key)) setAdOpen(true);
  }, []);
  const closeAd = () => { localStorage.setItem(`durham-ad-${new Date().toISOString().slice(0, 10)}`, "seen"); setAdOpen(false); };
  const changeTab = (next: MainTab) => { setTab(next); setSchoolView("index"); setDetailId(null); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openProject = (id: number) => { setTab("overseas"); setDetailId(id); setAdOpen(false); window.scrollTo({ top: 0 }); };
  return <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto min-h-screen max-w-[520px] bg-paper shadow-xl">
      <TopBar />
      <main className="pb-24">
        {tab === "school" && <School view={schoolView} onView={setSchoolView} onOverseas={() => changeTab("overseas")} onContact={() => changeTab("contact")} />}
        {tab === "overseas" && (detailId ? <ProjectDetail project={projects.find((item) => item.id === detailId)} onBack={() => setDetailId(null)} onConsult={() => setConsultOpen(true)} /> : <Overseas onDetail={setDetailId} onConsult={() => setConsultOpen(true)} />)}
        {tab === "contact" && <Contact />}
      </main>
      <Button aria-label="微信客服" title="微信客服" size="icon" onClick={() => setConsultOpen(true)} className="fixed bottom-22 right-[max(1rem,calc(50%-244px))] z-30 rounded-full shadow-lg"><Headphones className="size-5" /></Button>
      <BottomNav tab={tab} onChange={changeTab} />
    </div>
    {consultOpen && <ConsultModal onClose={() => setConsultOpen(false)} onForm={() => { setConsultOpen(false); changeTab("contact"); }} />}
    {adOpen && <LaunchAd onClose={closeAd} onOpen={() => openProject(1)} />}
    <Toaster position="top-center" richColors />
  </div>;
}

function TopBar() { return <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border bg-paper/95 px-4 backdrop-blur"><img src={logoDark.url} alt="Durham University 官方标志" className="h-10 w-auto max-w-[210px] object-contain object-left" /><span className="text-xs font-semibold text-muted-foreground">招生小程序</span></header>; }

function School({ view, onView, onOverseas, onContact }: { view: SchoolView; onView: (view: SchoolView) => void; onOverseas: () => void; onContact: () => void }) {
  if (view !== "index") return <SchoolDetail view={view} onBack={() => onView("index")} />;
  const entries: { icon: typeof BookOpen; title: string; text: string; view: SchoolView }[] = [
    { icon: University, title: "学校介绍", text: "简介、历史与荣誉资质", view: "about" },
    { icon: UsersRound, title: "师资力量", text: "了解教学与研究团队", view: "faculty" },
    { icon: Building2, title: "校园环境", text: "探索杜伦校园与城市", view: "campus" },
    { icon: Play, title: "学生访谈", text: "聆听真实的学习体验", view: "interviews" },
  ];
  return <div className="animate-rise">
    <section className="relative h-[430px] overflow-hidden"><img src={campusHero} alt="杜伦大学校园" className="size-full object-cover" /><div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary)_0%,color-mix(in_oklab,var(--primary)_58%,transparent)_42%,transparent_78%)]" /><div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground"><p className="mb-3 text-xs font-bold uppercase text-accent">Welcome to Durham</p><h1 className="text-4xl font-bold leading-tight">认识杜伦大学</h1><p className="mt-3 text-sm leading-6 text-primary-foreground/85">深厚传统、卓越学术与独特学院社区。</p></div></section>
    <section className="px-4 py-8"><SectionHeading eyebrow="Explore our university" title="学校相关" /><div className="mt-5 grid grid-cols-2 gap-3">{entries.map(({ icon: Icon, title, text, view: next }) => <button key={title} onClick={() => onView(next)} className="min-h-40 rounded-md border border-border bg-paper p-4 text-left shadow-sm transition hover:border-primary"><Icon className="size-6 text-primary" /><h2 className="mt-6 text-lg font-bold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p><ChevronRight className="mt-3 size-4 text-primary" /></button>)}</div></section>
    <section className="border-y border-border bg-muted px-4 py-7"><div className="flex items-center gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><ExternalLink className="size-5" /></div><div className="min-w-0 flex-1"><h2 className="font-bold">学校官网</h2><p className="mt-1 text-xs text-muted-foreground">直达杜伦大学官方网站</p></div><Button variant="outline" size="sm" onClick={() => window.open("https://www.durham.ac.uk/", "_blank", "noopener,noreferrer")}>打开</Button></div></section>
    <section className="px-4 py-8"><div className="overflow-hidden rounded-md bg-primary text-primary-foreground"><img src={studentsStudy} alt="学生在杜伦大学学习" className="aspect-[16/9] w-full object-cover" /><div className="p-5"><p className="text-xs font-bold uppercase text-accent">Study with us</p><h2 className="mt-2 text-2xl font-bold">探索海外留学项目</h2><p className="mt-3 text-sm leading-6 text-primary-foreground/80">按国际本科、硕士项目与本科直博查看项目。</p><div className="mt-5 flex gap-3"><Button variant="gold" onClick={onOverseas}>查看项目 <ArrowRight className="size-4" /></Button><Button variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" onClick={onContact}>联系我们</Button></div></div></div></section>
  </div>;
}

function SchoolDetail({ view, onBack }: { view: Exclude<SchoolView, "index">; onBack: () => void }) {
  const data = {
    about: { title: "学校介绍", image: campusHero, body: "杜伦大学创立于 1832 年，是一所位于英国历史名城杜伦的学院制大学。学校将研究与教学融入紧密的学院社区。办学历史、荣誉与资质请以学校官网最新信息为准。" },
    faculty: { title: "师资力量", image: studentsStudy, body: "杜伦大学的教学与研究由不同院系的学者共同推动。正式师资头像、姓名、职称、主讲方向与个人简介待校方资料接入。" },
    campus: { title: "校园环境", image: campusHero, body: "历史建筑、河畔景观与现代学习空间共同构成杜伦独特的学习环境。更多校园图集与图片说明待校方素材接入。" },
    interviews: { title: "学生访谈", image: studentPortrait, body: "学生访谈将展示学生姓名、录取院校与真实感言，并支持文章和视频内容。正式访谈素材待校方提供。" },
  }[view];
  return <article className="animate-rise"><div className="relative h-72"><img src={data.image} alt={data.title} className="size-full object-cover" /><Button size="icon" variant="secondary" onClick={onBack} aria-label="返回" className="absolute left-4 top-4"><ArrowLeft className="size-5" /></Button></div><div className="px-5 py-8"><p className="text-xs font-bold uppercase text-primary">About Durham</p><h1 className="mt-2 text-3xl font-bold">{data.title}</h1><p className="mt-5 text-sm leading-8 text-muted-foreground">{data.body}</p>{view === "faculty" && <div className="mt-7 space-y-3">{["人文与艺术学部", "科学学部", "社会科学与健康学部"].map((item) => <div key={item} className="flex items-center gap-3 rounded-md border border-border p-4"><UsersRound className="size-5 text-primary" /><span className="font-semibold">{item}</span></div>)}</div>}{view === "interviews" && <div className="mt-7 rounded-md border border-border p-5"><p className="text-xs text-primary">学生故事</p><h2 className="mt-2 text-xl font-bold">在学院社区中找到归属</h2><p className="mt-2 text-sm text-muted-foreground">正式姓名、录取信息与视频待发布。</p></div>}</div></article>;
}

function Overseas({ onDetail, onConsult }: { onDetail: (id: number) => void; onConsult: () => void }) {
  const [type, setType] = useState<ProjectType>("国际本科"); const [query, setQuery] = useState(""); const [country, setCountry] = useState("全部国家");
  const shown = useMemo(() => projects.filter((item) => item.type === type && (country === "全部国家" || item.country === country) && `${item.name}${item.partner}${item.subject}`.includes(query)), [type, query, country]);
  return <div className="animate-rise"><PageIntro eyebrow="Overseas study" title="海外留学" text="浏览国际本科、硕士项目与本科直博项目。" /><div className="sticky top-[68px] z-10 border-b border-border bg-paper"><div className="grid grid-cols-3">{(["国际本科", "硕士项目", "本科直博"] as ProjectType[]).map((item) => <Button key={item} variant="ghost" onClick={() => setType(item)} className={cn("rounded-none border-b-2 px-2 text-xs", item === type ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{item}</Button>)}</div></div><section className="px-4 py-6"><div className="grid grid-cols-[1fr_120px] gap-2"><label className="relative"><Search className="absolute left-3 top-4 size-4 text-muted-foreground" /><input aria-label="搜索项目" value={query} onChange={(event) => setQuery(event.target.value)} className={cn(fieldClass, "pl-9")} placeholder="搜索项目" /></label><select aria-label="筛选国家" value={country} onChange={(event) => setCountry(event.target.value)} className={fieldClass}><option>全部国家</option><option>英国</option></select></div><div className="mt-5 space-y-5">{shown.map((project) => <ProjectCard key={project.id} project={project} onDetail={() => onDetail(project.id)} onConsult={onConsult} />)}</div>{shown.length === 0 && <p className="py-14 text-center text-sm text-muted-foreground">没有找到匹配项目</p>}</section></div>;
}

function ProjectCard({ project, onDetail, onConsult }: { project: Project; onDetail: () => void; onConsult: () => void }) { return <article className="grid grid-cols-[128px_1fr] overflow-hidden rounded-md border border-border bg-paper shadow-sm"><img src={project.image} alt={project.name} className="h-full min-h-52 w-full object-cover" /><div className="min-w-0 p-4"><p className="text-[10px] font-semibold text-primary">{project.partner}</p><h2 className="mt-1 text-lg font-bold leading-snug">{project.name}</h2><div className="mt-3 flex flex-wrap gap-1.5"><Tag>{project.country}</Tag><Tag>{project.mode}</Tag><Tag>{project.subject}</Tag></div><p className="mt-3 text-xs font-semibold text-muted-foreground">{project.highlight}</p><div className="mt-4 grid grid-cols-2 gap-2"><Button size="sm" variant="outline" onClick={onDetail}>项目详情</Button><Button size="sm" onClick={onConsult}>直接咨询</Button></div></div></article>; }

function ProjectDetail({ project, onBack, onConsult }: { project?: Project; onBack: () => void; onConsult: () => void }) {
  if (!project) return null;
  return <div className="animate-rise pb-20"><div className="relative h-[390px]"><img src={project.image} alt={project.name} className="size-full object-cover" /><div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary),transparent_70%)]" /><div className="absolute left-4 right-4 top-4 flex justify-between"><Button variant="secondary" size="icon" onClick={onBack} aria-label="返回"><ArrowLeft className="size-5" /></Button><Button variant="secondary" size="icon" onClick={() => toast("请使用微信右上角分享给好友")} aria-label="分享"><Share2 className="size-5" /></Button></div><div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground"><div className="flex gap-2"><Tag inverse>{project.country}</Tag><Tag inverse>{project.mode}</Tag></div><h1 className="mt-3 text-3xl font-bold leading-tight">{project.name}</h1><p className="mt-2 text-sm text-primary-foreground/80">{project.partner}</p></div></div><div className="space-y-8 px-5 py-8"><DetailSection number="01" title="项目概览"><p>面向有意赴英深造的学生，提供清晰的课程与申请信息。具体项目安排以正式招生简章为准。</p></DetailSection><DetailSection number="02" title="培养优势"><div className="grid grid-cols-2 gap-3">{["学术衔接", "升学规划", "学习支持", "校园体验"].map((item) => <div key={item} className="rounded-md border border-border p-4 text-center text-sm font-semibold"><Sparkles className="mx-auto mb-2 size-4 text-primary" />{item}</div>)}</div></DetailSection><DetailSection number="03" title="专业设置"><p>{project.subject}。完整专业方向、课程模块及开设情况待正式项目资料确认。</p></DetailSection><DetailSection number="04" title="招生信息"><div className="divide-y divide-border rounded-md border border-border">{[["报名时间", "待校方公布"], ["录取要求", "以正式简章为准"], ["项目学费", "待校方公布"], ["招生名额", "待校方公布"]].map(([key,value]) => <div className="flex justify-between p-4 text-sm" key={key}><span className="text-muted-foreground">{key}</span><strong>{value}</strong></div>)}</div></DetailSection><DetailSection number="05" title="报名流程"><div className="space-y-3">{["提交意向信息", "招生顾问联系", "准备申请材料", "完成学校审核"].map((item, index) => <div key={item} className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{index + 1}</span><span className="text-sm font-semibold">{item}</span></div>)}</div></DetailSection></div><div className="fixed inset-x-0 bottom-17 z-20 mx-auto grid max-w-[520px] grid-cols-2 gap-2 border-t border-border bg-paper p-3"><Button variant="outline" onClick={() => toast("招生简章 PDF 待校方上传")}><Download className="size-4" />招生简章 PDF</Button><Button onClick={onConsult}><MessageCircle className="size-4" />立即咨询</Button></div></div>;
}

function Contact() {
  const [mode, setMode] = useState<"lead" | "info" | "studio" | "booking" | "event">("lead");
  const options = [{ id: "lead" as const, label: "意向填写", icon: FileText }, { id: "info" as const, label: "联系我们", icon: Phone }, { id: "studio" as const, label: "AI Hub", icon: Sparkles }, { id: "booking" as const, label: "预约到校", icon: CalendarDays }, { id: "event" as const, label: "开放日", icon: UsersRound }];
  return <div className="animate-rise"><PageIntro eyebrow="Contact us" title="联系我们" text="提交升学意向、联系学校或预约到校。" /><div className="overflow-x-auto border-b border-border bg-paper px-2"><div className="flex min-w-max">{options.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => setMode(id)} className={cn("h-16 min-h-16 flex-col rounded-none border-b-2 px-4 text-[11px]", mode === id ? "border-primary text-primary" : "border-transparent text-muted-foreground")}><Icon className="size-4" />{label}</Button>)}</div></div><section className="px-4 py-7">{mode === "lead" && <LeadForm />}{mode === "info" && <ContactInfo />}{mode === "studio" && <AiHub />}{mode === "booking" && <BookingForm />}{mode === "event" && <OpenDay />}</section></div>;
}

function LeadForm() {
  const [sending, setSending] = useState(false); const [countries, setCountries] = useState<string[]>([]);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSending(true); const form = event.currentTarget; const data = new FormData(form); const { error } = await supabase.from("leads").insert({ name: String(data.get("name")), phone: String(data.get("phone")), education: String(data.get("education")), intended_program: String(data.get("program")), intended_countries: countries, entry_year: String(data.get("year") || ""), budget: String(data.get("budget") || ""), notes: String(data.get("notes") || "") }); setSending(false); if (error) return toast.error("提交失败，请稍后重试"); toast.success("提交成功，我们会尽快联系你"); form.reset(); setCountries([]); };
  return <form onSubmit={submit} className="space-y-5"><SectionHeading eyebrow="Enquiry form" title="意向信息填写表" /><Field label="姓名 *"><input name="name" required minLength={2} maxLength={20} className={fieldClass} /></Field><Field label="手机号 *"><input name="phone" required pattern="1[3-9][0-9]{9}" inputMode="tel" className={fieldClass} placeholder="11 位手机号" /></Field><Field label="当前学历 *"><select name="education" required defaultValue="" className={fieldClass}><option value="" disabled>请选择</option>{["高中", "高二", "大专", "本科", "其他"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="意向项目 *"><select name="program" required defaultValue="" className={fieldClass}><option value="" disabled>请选择</option>{["国际本科", "硕士", "本科直博", "暂不确定"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="意向国家（可多选）"><div className="flex flex-wrap gap-2">{["英国", "澳大利亚", "美国", "加拿大", "新加坡", "其他"].map((item) => <label key={item} className={cn("rounded-full border px-3 py-2 text-xs", countries.includes(item) ? "border-primary bg-secondary text-primary" : "border-border")}><input type="checkbox" className="sr-only" checked={countries.includes(item)} onChange={() => setCountries((old) => old.includes(item) ? old.filter((value) => value !== item) : [...old, item])} />{item}</label>)}</div></Field><div className="grid grid-cols-2 gap-3"><Field label="预计入学年份"><select name="year" className={fieldClass}><option>2026</option><option>2027</option><option>暂不确定</option></select></Field><Field label="预算区间"><select name="budget" className={fieldClass}><option>20 万内</option><option>20-30 万</option><option>30 万以上</option><option>暂不确定</option></select></Field></div><Field label="备注"><textarea name="notes" maxLength={200} rows={4} className={cn(fieldClass, "py-3")} placeholder="最多 200 字" /></Field><label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input required type="checkbox" className="mt-1 accent-primary" />我已阅读并同意隐私保护指引。</label><Button disabled={sending} className="w-full">{sending ? "正在提交…" : "提交信息"}<ArrowRight className="size-4" /></Button></form>;
}

function ContactInfo() { return <div><SectionHeading eyebrow="School contact" title="联系学校" /><div className="mt-6 space-y-3"><ContactLine icon={<MapPin />} title="学校地址" detail="The Palatine Centre, Stockton Road, Durham, UK" action="导航" onClick={() => window.open("https://maps.google.com/?q=Durham+University", "_blank")} /><ContactLine icon={<Phone />} title="咨询电话" detail="待校方补充" /><ContactLine icon={<MessageCircle />} title="微信客服" detail="客服会话待微信主体接入" action="咨询" onClick={() => toast("微信客服待正式小程序接入")} /><ContactLine icon={<Clock3 />} title="工作时间" detail="待校方补充" /></div></div>; }
function AiHub() { return <div><SectionHeading eyebrow="Technical support" title="AI Hub 工作室" description="技术支持 · 商务合作" /><div className="mt-6 rounded-md border border-border bg-muted p-5"><Sparkles className="size-7 text-primary" /><h2 className="mt-4 text-xl font-bold">合作联系方式</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">联系电话与联系邮箱待甲方提供。正式信息接入后可一键拨号或唤起邮件。</p><div className="mt-5 grid gap-2"><Button variant="outline" disabled><Phone className="size-4" />电话待补充</Button><Button variant="outline" disabled><Mail className="size-4" />邮箱待补充</Button></div></div></div>; }

function BookingForm() {
  const [sending, setSending] = useState(false); const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSending(true); const form = event.currentTarget; const data = new FormData(form); const code = `DU-${Date.now().toString().slice(-6)}`; const { error } = await supabase.from("bookings").insert({ name: String(data.get("name")), phone: String(data.get("phone")), visit_date: String(data.get("date")), time_slot: String(data.get("slot")), party_size: Number(data.get("party")), notes: String(data.get("notes") || ""), visit_code: code }); setSending(false); if (error) return toast.error("提交失败，请稍后重试"); toast.success(`预约意向已提交，到访凭证：${code}`, { duration: 8000 }); form.reset(); };
  return <form onSubmit={submit} className="space-y-5"><SectionHeading eyebrow="Campus visit" title="预约到校" description="上午、下午各一档；具体名额与安排以校方确认为准。" /><Field label="姓名 *"><input name="name" required minLength={2} maxLength={20} className={fieldClass} /></Field><Field label="手机号 *"><input name="phone" required pattern="1[3-9][0-9]{9}" inputMode="tel" className={fieldClass} /></Field><div className="grid grid-cols-2 gap-3"><Field label="到访日期 *"><input name="date" type="date" min={minDate} required className={fieldClass} /></Field><Field label="时段 *"><select name="slot" className={fieldClass}><option>上午</option><option>下午</option></select></Field></div><Field label="陪同人数 *"><input name="party" type="number" min={1} max={10} defaultValue={1} required className={fieldClass} /></Field><Field label="备注"><textarea name="notes" maxLength={200} rows={4} className={cn(fieldClass, "py-3")} /></Field><div className="rounded-md border-l-2 border-primary bg-muted p-4 text-xs leading-5 text-muted-foreground">预约提交后将生成到访凭证；正式提醒功能待微信订阅消息接入。</div><Button disabled={sending} className="w-full">{sending ? "正在提交…" : "提交预约"}<CalendarDays className="size-4" /></Button></form>;
}
function OpenDay() { return <div><SectionHeading eyebrow="Coming next" title="校园开放日" description="活动报名为二期功能。" /><div className="mt-6 overflow-hidden rounded-md border border-border"><img src={campusHero} alt="杜伦大学校园开放日" className="aspect-[16/9] w-full object-cover" /><div className="p-5"><p className="text-xs font-semibold text-primary">活动信息待发布</p><h2 className="mt-2 text-xl font-bold">校园开放日与招生说明会</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">活动名称、时间、地点与亮点将在校方确认后展示。</p><Button className="mt-5 w-full" disabled>报名暂未开放</Button></div></div></div>; }

function LaunchAd({ onClose, onOpen }: { onClose: () => void; onOpen: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/75 p-6" role="dialog" aria-modal="true" aria-label="主推项目"><div className="relative w-full max-w-[340px] overflow-hidden rounded-md bg-primary shadow-2xl"><img src={campusHero} alt="主推项目" className="aspect-[3/4] w-full object-cover" /><div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary)_2%,transparent_70%)]" /><Button size="icon" variant="secondary" onClick={onClose} aria-label="关闭广告" className="absolute right-3 top-3 rounded-full"><X className="size-5" /></Button><div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground"><img src={logoWhite.url} alt="Durham University 官方反白标志" className="h-10 w-auto max-w-[220px] object-contain object-left" /><p className="mt-6 text-xs font-bold text-accent">主推项目</p><h2 className="mt-2 text-3xl font-bold">国际本科衔接项目</h2><p className="mt-2 text-sm text-primary-foreground/80">探索项目内容与申请流程</p><Button variant="gold" className="mt-5 w-full" onClick={onOpen}>查看项目详情 <ArrowRight className="size-4" /></Button></div></div></div>; }
function ConsultModal({ onClose, onForm }: { onClose: () => void; onForm: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-end bg-ink/70 sm:place-items-center" role="dialog" aria-modal="true" aria-label="微信客服"><div className="w-full max-w-[520px] rounded-t-md bg-paper p-6 sm:rounded-md"><div className="flex items-center justify-between"><img src={logoDark.url} alt="Durham University 官方标志" className="h-10 w-auto max-w-[210px]" /><Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭"><X className="size-5" /></Button></div><div className="mt-6 rounded-md bg-muted p-5"><h2 className="font-bold">直接咨询</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">正式微信客服会话待小程序主体接入；你可以先填写意向信息。</p></div><Button className="mt-4 w-full" onClick={onForm}>填写意向信息 <ArrowRight className="size-4" /></Button></div></div>; }

function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <section className="bg-primary px-5 py-9 text-primary-foreground"><p className="text-xs font-bold uppercase text-accent">{eyebrow}</p><h1 className="mt-2 text-4xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-primary-foreground/80">{text}</p></section>; }
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) { return <div><p className="text-xs font-bold uppercase text-primary">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2>{description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}</div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }
function Tag({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) { return <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", inverse ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary text-primary")}>{children}</span>; }
function DetailSection({ number, title, children }: { number: string; title: string; children: ReactNode }) { return <section><div className="mb-4 flex items-center gap-3 border-b border-border pb-3"><span className="text-xs font-bold text-primary">{number}</span><h2 className="text-xl font-bold">{title}</h2></div><div className="text-sm leading-7 text-muted-foreground">{children}</div></section>; }
function ContactLine({ icon, title, detail, action, onClick }: { icon: ReactNode; title: string; detail: string; action?: string; onClick?: () => void }) { return <Button variant="outline" onClick={onClick} disabled={!onClick} className="h-auto min-h-18 w-full justify-start gap-4 p-4 text-left disabled:opacity-100"><span className="text-primary [&>svg]:size-5">{icon}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">{detail}</span></span>{action && <span className="text-xs text-primary">{action}</span>}</Button>; }
function BottomNav({ tab, onChange }: { tab: MainTab; onChange: (tab: MainTab) => void }) { const items: [MainTab, typeof University, string][] = [["school", University, "学校相关"], ["overseas", GraduationCap, "海外留学"], ["contact", Phone, "联系我们"]]; return <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-17 max-w-[520px] grid-cols-3 border-t border-border bg-paper pb-[env(safe-area-inset-bottom)]">{items.map(([value, Icon, label]) => <Button key={value} variant="ghost" onClick={() => onChange(value)} className={cn("relative h-17 min-h-17 flex-col gap-1 rounded-none text-[11px]", tab === value ? "text-primary" : "text-muted-foreground")}>{tab === value && <span className="absolute top-0 h-0.5 w-9 bg-primary" />}<Icon className="size-5" />{label}</Button>)}</nav>; }
