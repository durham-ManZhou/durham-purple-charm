import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Download,
  GraduationCap,
  Headphones,
  Landmark,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  School,
  Search,
  Send,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

import campusHero from "@/assets/campus-hero.jpg";
import studentPortrait from "@/assets/student-portrait.jpg";
import studentsStudy from "@/assets/students-study.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "英才国际教育｜国际学校与海外升学" },
      { name: "description", content: "探索国际本科、硕士与本科直博项目，预约到校并获取专属升学建议。" },
      { property: "og:title", content: "英才国际教育｜国际学校与海外升学" },
      { property: "og:description", content: "探索国际本科、硕士与本科直博项目，预约到校并获取专属升学建议。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdmissionsApp,
});

type MainTab = "school" | "programs" | "contact";
type ProgramCategory = "国际本科" | "硕士项目" | "本科直博";

const programs = [
  { id: 1, category: "国际本科" as const, name: "英国名校国际本科 2+2", partner: "英国高校联盟", country: "英国", mode: "2+2", major: "商科", highlight: "衔接英国名校 · 双校园体验", image: campusHero, fee: "国内阶段 ¥98,000 / 年", places: "40 人", requirement: "应往届高中毕业生，英语基础良好" },
  { id: 2, category: "国际本科" as const, name: "全球商务国际本科 3+1", partner: "英澳合作院校", country: "英 / 澳", mode: "3+1", major: "商科", highlight: "国内三年稳步过渡", image: studentsStudy, fee: "国内阶段 ¥86,000 / 年", places: "35 人", requirement: "高中毕业，参加入学测试" },
  { id: 3, category: "硕士项目" as const, name: "英国硕士预科菁英计划", partner: "英国北部大学联盟", country: "英国", mode: "1+1", major: "综合", highlight: "一年衔接 · 多专业可选", image: studentPortrait, fee: "预科阶段 ¥108,000", places: "30 人", requirement: "本科或大专学历，综合评估录取" },
  { id: 4, category: "本科直博" as const, name: "理工科本科直博计划", partner: "英国研究型大学", country: "英国", mode: "4+3", major: "理工", highlight: "科研导师制 · 本博贯通", image: studentsStudy, fee: "请咨询招生顾问", places: "15 人", requirement: "优秀高中毕业生，数理基础突出" },
];

const fieldClass = "min-h-12 w-full rounded-md border border-input bg-paper px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function AdmissionsApp() {
  const [tab, setTab] = useState<MainTab>("school");
  const [promoOpen, setPromoOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [consultOpen, setConsultOpen] = useState(false);

  useEffect(() => {
    const key = `ad-seen-${new Date().toISOString().slice(0, 10)}`;
    if (!window.localStorage.getItem(key)) setPromoOpen(true);
  }, []);

  const closePromo = () => {
    window.localStorage.setItem(`ad-seen-${new Date().toISOString().slice(0, 10)}`, "1");
    setPromoOpen(false);
  };

  const openProgram = (id: number) => {
    setDetailId(id);
    setTab("programs");
    setPromoOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto min-h-screen max-w-6xl bg-paper shadow-2xl shadow-primary/10 md:my-6 md:min-h-[calc(100vh-3rem)] md:border md:border-border">
        <TopBar tab={tab} onMenu={() => toast("内容后台将在管理端开放")} />
        <main className="pb-28">
          {tab === "school" && <SchoolHome onExplore={() => setTab("programs")} />}
          {tab === "programs" && (detailId ? <ProgramDetail id={detailId} onBack={() => setDetailId(null)} onConsult={() => setConsultOpen(true)} /> : <Programs onDetail={setDetailId} onConsult={() => setConsultOpen(true)} />)}
          {tab === "contact" && <Contact />}
        </main>
        <Button aria-label="在线咨询" title="在线咨询" size="icon" onClick={() => setConsultOpen(true)} className="fixed bottom-24 right-4 z-30 rounded-full shadow-xl md:right-[calc(50%-34rem)]">
          <MessageCircle className="size-5" />
        </Button>
        <BottomNav tab={tab} onChange={(next) => { setTab(next); setDetailId(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      </div>
      {promoOpen && <PromoModal onClose={closePromo} onOpen={() => openProgram(1)} />}
      {consultOpen && <ConsultModal onClose={() => setConsultOpen(false)} />}
      <Toaster position="top-center" richColors />
    </div>
  );
}

function TopBar({ tab, onMenu }: { tab: MainTab; onMenu: () => void }) {
  const names = { school: "学校相关", programs: "海外留学", contact: "联系我们" };
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-paper/95 px-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center border border-primary bg-primary text-primary-foreground"><Landmark className="size-5" /></div>
        <div><p className="font-display text-base font-bold text-primary">英才国际教育</p><p className="text-[10px] uppercase text-muted-foreground">Global Education</p></div>
      </div>
      <div className="flex items-center gap-2"><span className="hidden text-xs text-muted-foreground sm:block">{names[tab]}</span><Button variant="ghost" size="icon" aria-label="菜单" onClick={onMenu}><Menu className="size-5" /></Button></div>
    </header>
  );
}

function SchoolHome({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="animate-rise">
      <section className="relative min-h-[500px] overflow-hidden">
        <img src={campusHero} alt="英伦大学校园" width={1200} height={800} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/10" />
        <div className="absolute inset-x-0 bottom-0 p-7 text-primary-foreground sm:p-12">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase"><span className="h-px w-8 bg-gold" /> Education without borders</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">从这里，走向更广阔的世界</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/85 sm:text-base">国际课程、个性化升学规划与全球院校资源，为每一位学生铺就清晰的成长路径。</p>
          <Button variant="gold" className="mt-7" onClick={onExplore}>探索海外项目 <ArrowRight className="size-4" /></Button>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-10">
        <SectionHeading eyebrow="Discover our school" title="认识我们的学校" description="以学术为根基，以国际视野连接未来。" />
        <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
          {[
            [School, "学校介绍", "办学历史与荣誉"], [UsersRound, "师资力量", "专业导师团队"], [Building2, "校园环境", "沉浸式学习空间"], [CircleUserRound, "学生访谈", "听见真实成长"],
          ].map(([Icon, title, desc]) => {
            const ItemIcon = Icon as typeof School;
            return <button key={title as string} onClick={() => toast(`${title}详情素材待校方补充`)} className="group min-h-40 bg-paper p-5 text-left transition hover:bg-royal-soft"><ItemIcon className="size-6 text-primary" /><h3 className="mt-6 text-lg font-bold">{title as string}</h3><p className="mt-1 text-xs text-muted-foreground">{desc as string}</p><ChevronRight className="mt-4 size-4 text-primary transition group-hover:translate-x-1" /></button>;
          })}
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        <img src={studentsStudy} alt="国际学生在图书馆学习" width={912} height={1200} loading="lazy" className="h-[420px] w-full object-cover md:h-full" />
        <div className="bg-primary p-8 text-primary-foreground sm:p-12">
          <p className="text-xs font-semibold text-gold">WHY US</p><h2 className="mt-3 text-3xl font-bold">一所真正面向未来的学校</h2>
          <div className="mt-8 space-y-7">
            {["融合中西课程体系，建立扎实学术基础", "导师全程陪伴，尊重每位学生的成长节奏", "链接全球院校资源，拓宽升学选择"].map((item, index) => <div key={item} className="flex gap-4 border-t border-primary-foreground/20 pt-5"><span className="font-display text-gold">0{index + 1}</span><p className="text-sm leading-6">{item}</p></div>)}
          </div>
          <Button variant="outline" className="mt-9 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" onClick={() => toast("学校官网地址待补充")}>访问学校官网 <ArrowRight className="size-4" /></Button>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-10"><SectionHeading eyebrow="Student voice" title="他们的留学故事" /><div className="mt-7 grid gap-6 sm:grid-cols-[180px_1fr]"><img src={studentPortrait} alt="国际学生访谈" width={912} height={1200} loading="lazy" className="h-60 w-full object-cover sm:h-64" /><div className="flex flex-col justify-center"><span className="text-5xl font-display text-gold">“</span><blockquote className="font-display text-xl leading-9">老师帮助我找到的不只是一所大学，更是适合自己的方向。</blockquote><p className="mt-5 text-sm font-semibold text-primary">林同学 · 英国高校录取</p><p className="mt-1 text-xs text-muted-foreground">学生访谈示例内容</p></div></div></section>
    </div>
  );
}

function Programs({ onDetail, onConsult }: { onDetail: (id: number) => void; onConsult: () => void }) {
  const [category, setCategory] = useState<ProgramCategory>("国际本科");
  const [country, setCountry] = useState("全部国家");
  const shown = useMemo(() => programs.filter((p) => p.category === category && (country === "全部国家" || p.country.includes(country))), [category, country]);
  return <div className="animate-rise">
    <section className="bg-primary px-5 py-10 text-primary-foreground sm:px-10"><p className="text-xs font-semibold text-gold">GLOBAL PATHWAYS</p><h1 className="mt-2 text-4xl font-bold">海外升学项目</h1><p className="mt-3 max-w-xl text-sm leading-7 text-primary-foreground/80">从国际本科到研究型深造，找到适合你的全球教育路径。</p></section>
    <div className="sticky top-16 z-10 border-b border-border bg-paper px-4 pt-4"><div className="flex gap-1 overflow-x-auto">{(["国际本科", "硕士项目", "本科直博"] as ProgramCategory[]).map((item) => <button key={item} onClick={() => setCategory(item)} className={cn("min-w-max border-b-2 px-4 pb-3 text-sm font-semibold", item === category ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{item}</button>)}</div></div>
    <section className="px-5 py-7 sm:px-10"><div className="mb-6 flex items-center gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><input aria-label="搜索项目" className={cn(fieldClass, "pl-9")} placeholder="搜索项目名称" /></div><select value={country} onChange={(e) => setCountry(e.target.value)} className={cn(fieldClass, "w-32")} aria-label="筛选国家"><option>全部国家</option><option>英国</option><option>澳</option></select></div>
      <div className="grid gap-7 sm:grid-cols-2">{shown.map((p) => <article key={p.id} className="overflow-hidden border border-border bg-paper"><div className="relative aspect-[4/3] overflow-hidden"><img src={p.image} alt={p.name} width={p.id === 1 ? 1200 : 912} height={p.id === 1 ? 800 : 1200} loading="lazy" className="size-full object-cover transition duration-500 hover:scale-[1.03]" /><span className="absolute left-3 top-3 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{p.country}</span></div><div className="p-5"><div className="flex gap-2 text-xs text-muted-foreground"><span>{p.partner}</span><span>·</span><span>{p.mode}</span><span>·</span><span>{p.major}</span></div><h2 className="mt-3 text-xl font-bold">{p.name}</h2><p className="mt-2 text-sm text-primary">{p.highlight}</p><div className="mt-5 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => onDetail(p.id)}>项目详情</Button><Button onClick={onConsult}>直接咨询</Button></div></div></article>)}</div>
      {shown.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">暂无匹配项目</p>}
    </section>
  </div>;
}

function ProgramDetail({ id, onBack, onConsult }: { id: number; onBack: () => void; onConsult: () => void }) {
  const program = programs.find((item) => item.id === id);
  if (!program) return null;
  return <div className="animate-rise pb-16"><div className="relative h-80"><img src={program.image} alt={program.name} width={program.id === 1 ? 1200 : 912} height={program.id === 1 ? 800 : 1200} className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent" /><Button aria-label="返回项目列表" title="返回" variant="secondary" size="icon" onClick={onBack} className="absolute left-4 top-4"><ArrowLeft className="size-5" /></Button><div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground"><div className="mb-3 flex gap-2 text-xs"><span className="bg-gold px-2 py-1 text-accent-foreground">{program.country}</span><span className="border border-primary-foreground/40 px-2 py-1">{program.mode}</span></div><h1 className="text-3xl font-bold">{program.name}</h1><p className="mt-2 text-sm text-primary-foreground/80">{program.partner}</p></div></div>
    <div className="px-5 py-8 sm:px-10"><DetailSection number="01" title="项目概览"><p>为希望进入英国优质高校的学生提供系统化学术衔接、语言提升与升学规划，兼顾国际化体验与稳健过渡。</p></DetailSection><DetailSection number="02" title="培养优势"><div className="grid gap-3 sm:grid-cols-3">{["小班双语教学", "海外导师支持", "全程升学规划"].map((x) => <div key={x} className="border border-border bg-muted p-4 text-sm font-semibold"><Check className="mb-3 size-4 text-primary" />{x}</div>)}</div></DetailSection><DetailSection number="03" title="专业设置"><p>商务管理、金融与会计、市场营销、计算机科学等。实际专业以合作院校当年招生简章为准。</p></DetailSection><DetailSection number="04" title="招生信息"><dl className="divide-y divide-border border-y border-border">{[["报名时间", "即日起至名额满止"], ["录取要求", program.requirement], ["学费", program.fee], ["计划名额", program.places]].map(([a,b]) => <div key={a} className="grid grid-cols-[90px_1fr] py-3 text-sm"><dt className="text-muted-foreground">{a}</dt><dd className="font-medium">{b}</dd></div>)}</dl></DetailSection><DetailSection number="05" title="报名流程"><div className="flex flex-wrap items-center gap-2 text-sm">{["提交意向", "顾问联系", "材料评估", "确认录取"].map((x,i) => <div key={x} className="flex items-center gap-2"><span className="border border-primary px-3 py-2 font-semibold text-primary">{x}</span>{i < 3 && <ArrowRight className="size-4 text-muted-foreground" />}</div>)}</div></DetailSection></div>
    <div className="fixed inset-x-0 bottom-16 z-20 mx-auto flex max-w-6xl border-t border-border bg-paper p-3"><Button variant="outline" className="flex-1" onClick={() => toast("招生简章 PDF 待校方上传")}><Download className="size-4" />招生简章</Button><Button className="ml-2 flex-1" onClick={onConsult}><MessageCircle className="size-4" />立即咨询</Button></div>
  </div>;
}

function Contact() {
  const [mode, setMode] = useState<"lead" | "booking">("lead");
  return <div className="animate-rise"><section className="bg-primary px-5 py-10 text-primary-foreground sm:px-10"><p className="text-xs font-semibold text-gold">GET IN TOUCH</p><h1 className="mt-2 text-4xl font-bold">让我们聊聊你的未来</h1><p className="mt-3 text-sm text-primary-foreground/80">留下信息，招生顾问将为你提供一对一建议。</p></section><div className="grid lg:grid-cols-[1.35fr_.65fr]"><section className="px-5 py-8 sm:px-10"><div className="mb-7 grid grid-cols-2 border border-border p-1">{[["lead", "意向咨询"], ["booking", "预约到校"]].map(([value,label]) => <button key={value} className={cn("min-h-11 text-sm font-semibold", mode === value ? "bg-primary text-primary-foreground" : "text-muted-foreground")} onClick={() => setMode(value as typeof mode)}>{label}</button>)}</div>{mode === "lead" ? <LeadForm /> : <BookingForm />}</section><aside className="border-t border-border bg-muted px-5 py-8 sm:px-10 lg:border-l lg:border-t-0"><h2 className="text-2xl font-bold">联系信息</h2><div className="mt-6 space-y-3"><ContactLine icon={<MapPin />} title="学校地址" detail="待校方补充" action="地图导航" /><ContactLine icon={<Phone />} title="咨询电话" detail="待校方补充" action="一键拨号" /><ContactLine icon={<Clock3 />} title="工作时间" detail="待校方补充" /><ContactLine icon={<MessageCircle />} title="微信客服" detail="在线招生咨询" action="立即咨询" /></div><div className="mt-8 border-t border-border pt-7"><p className="text-xs font-semibold text-primary">TECHNICAL PARTNER</p><h3 className="mt-2 text-xl font-bold">AI Hub 工作室</h3><p className="mt-2 text-sm text-muted-foreground">技术支持 · 商务合作</p><div className="mt-4 flex gap-3"><Button size="icon" variant="outline" aria-label="联系 AI Hub" title="电话待补充" onClick={() => toast("AI Hub 联系电话待补充")}><Phone className="size-4" /></Button><Button size="icon" variant="outline" aria-label="邮件联系 AI Hub" title="邮箱待补充" onClick={() => toast("AI Hub 邮箱待补充")}><Mail className="size-4" /></Button></div></div></aside></div></div>;
}

function LeadForm() {
  const [sending, setSending] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSending(true); const data = new FormData(event.currentTarget);
    const { error } = await supabase.from("leads").insert({ name: String(data.get("name")), phone: String(data.get("phone")), education: String(data.get("education")), intended_program: String(data.get("program")), intended_countries: countries, entry_year: String(data.get("year") || ""), budget: String(data.get("budget") || ""), notes: String(data.get("notes") || "") });
    setSending(false); if (error) { toast.error("提交失败，请检查信息后重试"); return; } toast.success("提交成功，招生顾问将尽快联系你"); event.currentTarget.reset(); setCountries([]);
  };
  return <form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="姓名 *"><input name="name" required minLength={2} maxLength={20} className={fieldClass} placeholder="请输入姓名" /></Field><Field label="手机号 *"><input name="phone" required pattern="1[3-9][0-9]{9}" inputMode="tel" className={fieldClass} placeholder="11 位手机号" /></Field><Field label="当前学历 *"><select name="education" required className={fieldClass} defaultValue=""><option value="" disabled>请选择</option>{["高中","高二","大专","本科","其他"].map(x => <option key={x}>{x}</option>)}</select></Field><Field label="意向项目 *"><select name="program" required className={fieldClass} defaultValue=""><option value="" disabled>请选择</option>{["国际本科","硕士","本科直博","暂不确定"].map(x => <option key={x}>{x}</option>)}</select></Field><Field label="预计入学年份"><select name="year" className={fieldClass}><option>2026</option><option>2027</option><option>暂不确定</option></select></Field><Field label="预算区间"><select name="budget" className={fieldClass}><option>20 万内</option><option>20-30 万</option><option>30万以上</option><option>暂不确定</option></select></Field></div><Field label="意向国家（可多选）"><div className="flex flex-wrap gap-2">{["英国","澳大利亚","美国","加拿大","新加坡","其他"].map(x => <button type="button" key={x} onClick={() => setCountries((current) => current.includes(x) ? current.filter(i => i !== x) : [...current, x])} className={cn("rounded-md border px-3 py-2 text-xs", countries.includes(x) ? "border-primary bg-royal-soft text-primary" : "border-border bg-paper")}>{x}</button>)}</div></Field><Field label="备注"><textarea name="notes" maxLength={200} rows={4} className={cn(fieldClass, "py-3")} placeholder="还有什么想告诉我们？" /></Field><label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input required type="checkbox" className="mt-1 accent-primary" />我已阅读并同意隐私保护指引，同意将信息用于招生咨询。</label><Button disabled={sending} className="w-full"><Send className="size-4" />{sending ? "正在提交…" : "提交意向信息"}</Button></form>;
}

function BookingForm() {
  const [sending, setSending] = useState(false);
  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSending(true); const data = new FormData(event.currentTarget); const code = `VIS-${Date.now().toString().slice(-6)}`; const { error } = await supabase.from("bookings").insert({ name: String(data.get("name")), phone: String(data.get("phone")), visit_date: String(data.get("date")), time_slot: String(data.get("slot")), party_size: Number(data.get("party")), notes: String(data.get("notes") || ""), visit_code: code }); setSending(false); if (error) { toast.error("预约失败，请检查日期与信息"); return; } toast.success(`预约成功，到访凭证：${code}`, { duration: 8000 }); event.currentTarget.reset(); };
  return <form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="姓名 *"><input name="name" required minLength={2} maxLength={20} className={fieldClass} /></Field><Field label="手机号 *"><input name="phone" required pattern="1[3-9][0-9]{9}" inputMode="tel" className={fieldClass} /></Field><Field label="到校日期 *"><input name="date" type="date" min={minDate} required className={fieldClass} /></Field><Field label="到校时段 *"><select name="slot" required className={fieldClass}><option value="上午">上午 09:30–11:30</option><option value="下午">下午 14:00–16:00</option></select></Field><Field label="陪同人数 *"><input name="party" type="number" min={1} max={10} defaultValue={2} required className={fieldClass} /></Field></div><p className="flex items-center gap-2 bg-royal-soft p-3 text-xs text-primary"><CalendarDays className="size-4" />每时段限 10 组家庭，最终名额由顾问确认。</p><Field label="备注"><textarea name="notes" maxLength={200} rows={4} className={cn(fieldClass, "py-3")} placeholder="如有特殊到访需求，请在此说明" /></Field><Button disabled={sending} className="w-full"><CalendarDays className="size-4" />{sending ? "正在预约…" : "确认预约"}</Button></form>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) { return <div><p className="text-xs font-bold uppercase text-primary">{eyebrow}</p><div className="mt-2 flex items-end justify-between gap-4"><h2 className="text-3xl font-bold">{title}</h2><span className="mb-2 h-px flex-1 bg-border" /></div>{description && <p className="mt-3 text-sm text-muted-foreground">{description}</p>}</div>; }
function DetailSection({ number, title, children }: { number: string; title: string; children: ReactNode }) { return <section className="mb-9"><div className="mb-4 flex items-baseline gap-3 border-b border-border pb-3"><span className="font-display text-sm text-gold">{number}</span><h2 className="text-2xl font-bold">{title}</h2></div><div className="text-sm leading-7 text-muted-foreground">{children}</div></section>; }
function ContactLine({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action?: string }) { return <button onClick={() => action && toast(`${title}信息待补充`)} className="flex w-full items-center gap-4 border border-border bg-paper p-4 text-left"><span className="text-primary [&>svg]:size-5">{icon}</span><span className="flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-muted-foreground">{detail}</span></span>{action && <ChevronRight className="size-4 text-muted-foreground" />}</button>; }

function BottomNav({ tab, onChange }: { tab: MainTab; onChange: (tab: MainTab) => void }) { const items: [MainTab, typeof School, string][] = [["school", School, "学校相关"], ["programs", GraduationCap, "海外留学"], ["contact", Phone, "联系我们"]]; return <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-16 max-w-6xl grid-cols-3 border-t border-border bg-paper pb-[env(safe-area-inset-bottom)]">{items.map(([value,Icon,label]) => <button key={value} onClick={() => onChange(value)} className={cn("flex flex-col items-center justify-center gap-1 text-[11px] font-semibold", tab === value ? "text-primary" : "text-muted-foreground")}><Icon className="size-5" />{label}</button>)}</nav>; }

function PromoModal({ onClose, onOpen }: { onClose: () => void; onOpen: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="主推项目"><div className="relative w-full max-w-sm overflow-hidden border border-primary-foreground/20 bg-primary text-primary-foreground shadow-2xl"><button aria-label="关闭广告" className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-ink/50" onClick={onClose}><X className="size-5" /></button><img src={campusHero} alt="英国名校国际本科项目" width={1200} height={800} className="h-72 w-full object-cover" /><div className="p-6"><p className="flex items-center gap-2 text-xs font-semibold text-gold"><Sparkles className="size-4" /> 2027 招生计划</p><h2 className="mt-3 text-3xl font-bold">英国名校<br />国际本科 2+2</h2><p className="mt-3 text-sm text-primary-foreground/75">双校园体验 · 多专业选择 · 全程升学支持</p><Button variant="gold" className="mt-6 w-full" onClick={onOpen}>查看项目详情 <ArrowRight className="size-4" /></Button><button className="mt-4 w-full text-xs text-primary-foreground/60" onClick={onClose}>今日不再显示</button></div></div></div>; }
function ConsultModal({ onClose }: { onClose: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-end bg-ink/60 sm:place-items-center" role="dialog" aria-modal="true" aria-label="在线咨询"><div className="w-full max-w-md bg-paper p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-primary">ADMISSIONS TEAM</p><h2 className="mt-1 text-2xl font-bold">在线招生咨询</h2></div><Button variant="ghost" size="icon" aria-label="关闭咨询" onClick={onClose}><X className="size-5" /></Button></div><div className="mt-6 flex gap-4 bg-muted p-4"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Headphones className="size-5" /></span><div><p className="text-sm font-semibold">招生顾问</p><p className="mt-1 text-xs leading-5 text-muted-foreground">正式小程序将接入微信客服会话。当前可先提交意向信息，我们会尽快回复。</p></div></div><Button className="mt-5 w-full" onClick={() => { onClose(); toast("请前往“联系我们”提交意向信息"); }}>开始咨询</Button></div></div>; }