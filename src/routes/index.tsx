import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, BookOpen, Building2, CalendarDays, Check, ChevronRight,
  Clock3, Download, ExternalLink, FileText, GraduationCap, Headphones, Mail, MapPin,
  MessageCircle, Phone, Play, Search, Share2, Sparkles, University, UsersRound, X,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";

import campusHero from "@/assets/campus-hero.jpg";
import campusCourtyard from "@/assets/campus-courtyard.jpg";
import campusLibrary from "@/assets/campus-library.jpg";
import campusRiverside from "@/assets/campus-riverside.jpg";
import logoDark from "@/assets/durham-logo-dark.svg.asset.json";
import logoWhite from "@/assets/durham-logo-white.svg.asset.json";
import interviewVideo from "@/assets/student-interview-demo.mp4.asset.json";
import studentPortrait from "@/assets/student-portrait.jpg";
import studentsStudy from "@/assets/students-study.jpg";
import { Button } from "@/components/ui/button";
import type { StaffProfile } from "@/data/durham-staff";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Overseas, ProjectDetail, projects } from "@/components/overseas";
import { LiveProfileSections, useStaffDetail, useStaffSearch, type StaffCard } from "@/components/staff-live";

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
type StoryContent = { id: string; type: "图文" | "视频"; title: string; image: string; video?: string };
type StudentStory = { id: number; name: string; offer: string; quote: string; image: string; contents: StoryContent[] };
type FacultyGroup = { id: string; name: string; english: string; description: string; departments: { name: string; english: string }[] };

const facultyGroups: FacultyGroup[] = [
  {
    id: "arts-humanities",
    name: "人文与艺术学部",
    english: "Faculty of Arts and Humanities",
    description: "由六个系与一个学院组成，涵盖人文思想、语言、历史与创意实践。",
    departments: [
      { name: "古典学与古代史系", english: "Classics and Ancient History" },
      { name: "英语研究系", english: "English Studies" },
      { name: "历史系", english: "History" },
      { name: "音乐系", english: "Music" },
      { name: "现代语言与文化学院", english: "School of Modern Languages and Cultures" },
      { name: "哲学系", english: "Philosophy" },
      { name: "神学与宗教系", english: "Theology and Religion" },
    ],
  },
  {
    id: "science",
    name: "科学学部",
    english: "Faculty of Science",
    description: "八个学术系共同开展基础科学、工程技术与心理学教学研究。",
    departments: [
      { name: "生物科学系", english: "Biosciences" },
      { name: "化学系", english: "Chemistry" },
      { name: "计算机科学系", english: "Computer Science" },
      { name: "地球科学系", english: "Earth Sciences" },
      { name: "工程系", english: "Engineering" },
      { name: "数学科学系", english: "Mathematical Sciences" },
      { name: "物理系", english: "Physics" },
      { name: "心理学系", english: "Psychology" },
    ],
  },
  {
    id: "social-sciences-health",
    name: "社会科学与健康学部",
    english: "Faculty of Social Sciences and Health",
    description: "由社会科学领域的六个系与两个学院组成，重视公共议题与社会影响。",
    departments: [
      { name: "人类学系", english: "Anthropology" },
      { name: "考古学系", english: "Archaeology" },
      { name: "教育学院", english: "School of Education" },
      { name: "地理系", english: "Geography" },
      { name: "政府与国际事务学院", english: "School of Government and International Affairs" },
      { name: "杜伦法学院", english: "Durham Law School" },
      { name: "社会学系", english: "Sociology" },
      { name: "体育与运动科学系", english: "Sport and Exercise Sciences" },
    ],
  },
  {
    id: "business",
    name: "杜伦大学商学院",
    english: "Durham University Business School",
    description: "独立的学部级商学院，下设会计、经济、金融与管理及市场营销四个系。",
    departments: [
      { name: "会计系", english: "Accounting" },
      { name: "经济系", english: "Economics" },
      { name: "金融系", english: "Finance" },
      { name: "管理与市场营销系", english: "Management and Marketing" },
    ],
  },
];


const studentStories: StudentStory[] = [
  { id: 1, name: "学生 A", offer: "杜伦大学 · 商科方向", quote: "学院社区让我很快找到学习节奏。", image: studentPortrait, contents: [
    { id: "1-article", type: "图文", title: "从申请准备到融入学院生活", image: studentPortrait },
    { id: "1-video", type: "视频", title: "我的杜伦学习日常", image: campusRiverside, video: interviewVideo.url },
  ] },
  { id: 2, name: "学生 B", offer: "杜伦大学 · 人文方向", quote: "小班讨论让我更敢表达自己的观点。", image: studentsStudy, contents: [
    { id: "2-article", type: "图文", title: "在杜伦学习人文是一种怎样的体验", image: studentsStudy },
  ] },
  { id: 3, name: "学生 C", offer: "杜伦大学 · 理工方向", quote: "校园、课堂和研究机会都超出预期。", image: campusCourtyard, contents: [
    { id: "3-video", type: "视频", title: "一分钟走进我的杜伦学习日常", image: campusRiverside, video: interviewVideo.url },
  ] },
];

const fieldClass = "min-h-12 w-full rounded-md border border-input bg-paper px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
const scrollToAppTop = () => window.scrollTo({ top: 0, behavior: "instant" });

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
  const changeTab = (next: MainTab) => { setTab(next); setSchoolView("index"); setDetailId(null); requestAnimationFrame(scrollToAppTop); };
  const changeSchoolView = (next: SchoolView) => { setSchoolView(next); requestAnimationFrame(scrollToAppTop); };
  const openProject = (id: number) => { setTab("overseas"); setDetailId(id); setAdOpen(false); requestAnimationFrame(scrollToAppTop); };
  return <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto min-h-screen max-w-[520px] bg-paper shadow-xl">
      <TopBar />
      <main className="pb-24">
        {tab === "school" && <School view={schoolView} onView={changeSchoolView} onOverseas={() => changeTab("overseas")} onContact={() => changeTab("contact")} />}
        {tab === "overseas" && (detailId ? <ProjectDetail project={projects.find((item) => item.id === detailId)} onBack={() => { setDetailId(null); requestAnimationFrame(scrollToAppTop); }} onConsult={() => setConsultOpen(true)} /> : <Overseas onDetail={openProject} onConsult={() => setConsultOpen(true)} scrollTop={scrollToAppTop} />)}
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
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [selectedStory, setSelectedStory] = useState<StudentStory | null>(null);
  if (view === "faculty" && selectedStaff) return <StaffProfilePage staff={selectedStaff} onBack={() => { setSelectedStaff(null); requestAnimationFrame(scrollToAppTop); }} />;
  if (view === "interviews" && selectedStory) return <StudentStoryDetail story={selectedStory} onBack={() => { setSelectedStory(null); requestAnimationFrame(scrollToAppTop); }} />;
  const data = {
    about: { title: "学校介绍", image: campusHero, body: "杜伦大学创立于 1832 年，是一所位于英国历史名城杜伦的学院制大学。学校将研究与教学融入紧密的学院社区。办学历史、荣誉与资质请以学校官网最新信息为准。" },
    faculty: { title: "师资力量", image: studentsStudy, body: "杜伦大学现有四个学部级学术分类、共 27 个院系。你可以在小程序内按学部浏览，并通过姓名、院系、职称或研究方向等关键词查询已核验的在校教师。" },
    campus: { title: "校园环境", image: campusHero, body: "历史建筑、河畔景观与现代学习空间共同构成杜伦独特的学习环境。当前图集使用演示图片，后续可直接替换为校方正式素材。" },
    interviews: { title: "学生访谈", image: studentPortrait, body: "学生访谈将展示学生姓名、录取院校与真实感言，并支持文章和视频内容。正式访谈素材待校方提供。" },
  }[view];
  return <article className="animate-rise"><div className="relative h-72"><img src={data.image} alt={data.title} className="size-full object-cover" /><Button size="icon" variant="secondary" onClick={onBack} aria-label="返回" className="absolute left-4 top-4 shadow-md"><ArrowLeft className="size-5" /></Button></div><div className="px-5 py-8"><p className="text-xs font-bold uppercase text-primary">About Durham</p><h1 className="mt-2 text-3xl font-bold">{data.title}</h1><p className="mt-5 text-sm leading-8 text-muted-foreground">{data.body}</p>{view === "faculty" && <FacultyDirectory onSelect={(staff) => { setSelectedStaff(staff); requestAnimationFrame(scrollToAppTop); }} />}{view === "campus" && <CampusGallery />}{view === "interviews" && <StudentStories onSelect={(story) => { setSelectedStory(story); requestAnimationFrame(scrollToAppTop); }} />}</div></article>;
}

function StudentStories({ onSelect }: { onSelect: (story: StudentStory) => void }) {
  return <section className="mt-8" aria-label="学生访谈列表"><div className="space-y-4">{studentStories.map((story) => <Button key={story.id} type="button" variant="ghost" onClick={() => onSelect(story)} className="h-auto w-full items-stretch justify-start overflow-hidden rounded-md border border-border p-0 text-left shadow-sm"><span className="relative w-28 shrink-0"><img src={story.image} alt={`${story.name}访谈封面`} className="absolute inset-0 size-full object-cover" /></span><span className="min-w-0 flex-1 p-4"><span className="flex flex-wrap gap-1.5">{story.contents.map((content) => <span key={content.id} className="inline-flex items-center gap-1 rounded-sm bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{content.type === "图文" ? <FileText className="size-3" /> : <Play className="size-3 fill-current" />}{content.type}</span>)}</span><strong className="mt-2 block text-base">{story.name}</strong><span className="mt-1 block whitespace-normal text-xs font-semibold text-foreground">录取院校：{story.offer}</span><span className="mt-2 line-clamp-2 block whitespace-normal text-xs font-normal leading-5 text-muted-foreground">“{story.quote}”</span></span><ChevronRight className="mr-3 mt-4 size-4 shrink-0 text-primary" /></Button>)}</div><p className="mt-5 text-[11px] leading-5 text-muted-foreground">以上为功能演示内容，并非真实学生访谈；正式上线前可替换为校方审核后的图文、视频和学生资料。</p></section>;
}

function StudentStoryDetail({ story, onBack }: { story: StudentStory; onBack: () => void }) {
  return <article className="animate-rise pb-24"><div className="relative"><img src={story.image} alt={`${story.name}学生访谈`} className="aspect-[4/3] w-full object-cover" /><Button type="button" size="icon" variant="secondary" onClick={onBack} aria-label="返回访谈列表" className="absolute left-4 top-4 z-10 shadow-md"><ArrowLeft className="size-5" /></Button></div><div className="px-5 py-8"><p className="text-xs font-bold text-primary">学生访谈 · 功能演示</p><h1 className="mt-2 text-3xl font-bold leading-tight">{story.name}</h1><div className="mt-5 border-l-2 border-primary pl-4"><p className="text-xs text-muted-foreground">录取院校：{story.offer}</p><p className="mt-3 text-sm leading-6 text-foreground">“{story.quote}”</p></div><div className="mt-9 space-y-10">{story.contents.map((content) => <section key={content.id} aria-label={`${content.type}：${content.title}`}><div className="mb-3 flex items-center gap-2 text-primary">{content.type === "图文" ? <FileText className="size-4" /> : <Play className="size-4 fill-current" />}<span className="text-xs font-bold">{content.type}</span></div><h2 className="text-xl font-bold leading-snug">{content.title}</h2>{content.type === "视频" && content.video ? <video src={content.video} poster={content.image} controls playsInline className="mt-4 aspect-video w-full rounded-md bg-ink object-cover" aria-label={`${story.name}访谈视频`} /> : <div className="mt-4"><img src={content.image} alt={content.title} className="aspect-[4/3] w-full rounded-md object-cover" /><div className="mt-5 space-y-4 text-sm leading-8 text-muted-foreground"><p>这是一篇用于打通学生访谈阅读流程的演示图文。页面已支持访谈图片、学生信息、录取院校、感言与正文内容展示。</p><p>正式上线时，可将这里替换为经过学生授权和校方审核的真实访谈，包括申请准备、课程体验、学院生活与升学建议。</p></div></div>}{content.type === "视频" && <p className="mt-3 text-sm leading-7 text-muted-foreground">当前为可播放的演示视频，用于验证小程序内播放、暂停与进度控制。</p>}</section>)}</div><p className="mt-10 border-t border-border pt-4 text-[11px] leading-5 text-muted-foreground">演示姓名、录取方向与感言均为占位内容，不代表真实学生信息。</p></div></article>;
}

const campusScenes = [
  { image: campusCourtyard, title: "学院庭院", caption: "古老石墙与开阔草坪，构成日常往返课堂的学院景致。" },
  { image: campusLibrary, title: "图书馆", caption: "安静的阅览空间，为个人学习与资料查阅提供专注环境。" },
  { image: campusRiverside, title: "河畔步道", caption: "沿威尔河漫步，可以从城市绿意中远望杜伦的历史天际线。" },
  { image: campusHero, title: "校园建筑", caption: "历史建筑与现代大学生活在杜伦城中自然交融。" },
] as const;

function CampusGallery() {
  const [active, setActive] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const scene = campusScenes[active] ?? campusScenes[0];
  const show = (next: number) => setActive((next + campusScenes.length) % campusScenes.length);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % campusScenes.length), 4000);
    return () => window.clearInterval(timer);
  }, [active]);
  return <section className="mt-8" aria-label="校园环境图集">
    <div className="relative touch-pan-y overflow-hidden rounded-md bg-muted" onPointerDown={(event) => { pointerStartX.current = event.clientX; }} onPointerUp={(event) => { const start = pointerStartX.current; pointerStartX.current = null; if (start === null) return; const distance = event.clientX - start; if (Math.abs(distance) < 45) return; show(active + (distance < 0 ? 1 : -1)); }} onPointerCancel={() => { pointerStartX.current = null; }}>
      <img key={scene.title} src={scene.image} alt={scene.title} loading="lazy" width={1200} height={900} className="aspect-[4/3] w-full animate-rise object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,var(--ink),transparent)] px-5 pb-5 pt-16 text-primary-foreground">
        <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold">{scene.title}</h2><p className="mt-1 text-xs leading-5 text-primary-foreground/80">{scene.caption}</p></div><span className="shrink-0 text-xs font-semibold">{String(active + 1).padStart(2, "0")} / {String(campusScenes.length).padStart(2, "0")}</span></div>
      </div>
      <Button type="button" size="icon" variant="secondary" onClick={() => show(active - 1)} aria-label="上一张" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full shadow-md"><ArrowLeft className="size-4" /></Button>
      <Button type="button" size="icon" variant="secondary" onClick={() => show(active + 1)} aria-label="下一张" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full shadow-md"><ArrowRight className="size-4" /></Button>
    </div>
    <div className="mt-3 grid grid-cols-4 gap-2" aria-label="选择校园图片">{campusScenes.map((item, index) => <Button key={item.title} type="button" variant="ghost" aria-label={`查看${item.title}`} aria-pressed={active === index} onClick={() => show(index)} className={cn("h-auto overflow-hidden rounded-md border p-0", active === index ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70")}><img src={item.image} alt="" loading="lazy" width={240} height={180} className="aspect-[4/3] w-full object-cover" /></Button>)}</div>
    <p className="mt-3 text-[11px] leading-5 text-muted-foreground">图片为功能演示素材，正式上线前请替换为校方授权图片。</p>
  </section>;
}

function FacultyDirectory({ onSelect }: { onSelect: (staff: StaffProfile) => void }) {
  const [facultyId, setFacultyId] = useState("all");
  const [staffQuery, setStaffQuery] = useState("");
  const { items: shownStaff, total, loading, loadMore, hasMore } = useStaffSearch(staffQuery, facultyId);
  const activeFaculty = facultyGroups.find((faculty) => faculty.id === facultyId);
  return <div className="mt-8">
    <div className="border-y border-border py-5"><div className="grid grid-cols-2 gap-3"><div><strong className="block text-2xl text-primary">4</strong><span className="text-xs text-muted-foreground">学部级分类</span></div><div><strong className="block text-2xl text-primary">27</strong><span className="text-xs text-muted-foreground">院系与学院</span></div></div></div>
    <section className="mt-7" aria-labelledby="staff-search-heading"><h2 id="staff-search-heading" className="text-xl font-bold">查询在校教师</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">支持姓名、职称、院系、学部和研究方向等任意关键词组合查询</p><label className="relative mt-4 block"><Search className="absolute left-3 top-4 size-4 text-muted-foreground" /><input aria-label="查询在校教师" value={staffQuery} maxLength={80} onChange={(event) => setStaffQuery(event.target.value)} className={cn(fieldClass, "pl-9 pr-10")} placeholder="例如：人工智能、法律、Professor" />{staffQuery && <Button type="button" variant="ghost" size="icon" aria-label="清空查询" onClick={() => setStaffQuery("")} className="absolute right-1 top-1 size-10"><X className="size-4" /></Button>}</label></section>
    <section className="mt-6" aria-labelledby="faculty-heading"><h2 id="faculty-heading" className="sr-only">按学部筛选</h2><div className="flex gap-2 overflow-x-auto pb-2"><Button size="sm" variant={facultyId === "all" ? "default" : "outline"} onClick={() => setFacultyId("all")} className="shrink-0">全部学部</Button>{facultyGroups.map((faculty) => <Button key={faculty.id} size="sm" variant={faculty.id === facultyId ? "default" : "outline"} onClick={() => setFacultyId(faculty.id)} className="shrink-0">{faculty.name}</Button>)}</div>{activeFaculty && <div className="mt-4 border-l-2 border-primary pl-4"><p className="text-xs font-bold uppercase text-primary">{activeFaculty.english}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{activeFaculty.description}</p></div>}</section>
    <section className="mt-7" aria-live="polite"><div className="flex items-baseline justify-between border-b border-border pb-3"><h2 className="text-xl font-bold">教师列表</h2><span className="text-xs text-muted-foreground">{loading && shownStaff.length === 0 ? "查询中…" : `找到 ${total} 位`}</span></div>{shownStaff.length > 0 ? <div className="divide-y divide-border">{shownStaff.map((staff) => <StaffResult key={staff.profileUrl} staff={staff} onSelect={() => onSelect(staff)} />)}{hasMore && <Button type="button" variant="outline" className="mt-4 w-full" disabled={loading} onClick={loadMore}>{loading ? "加载中…" : `加载更多（还有 ${total - shownStaff.length} 位）`}</Button>}</div> : loading ? <p className="py-12 text-center text-xs text-muted-foreground">查询中…</p> : <div className="py-12 text-center"><UsersRound className="mx-auto size-8 text-muted-foreground" /><h3 className="mt-4 text-base font-bold">未找到匹配的在校教师</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">请尝试姓名、院系、职称或研究方向等其他关键词。</p></div>}</section>
    <p className="mt-6 border-t border-border pt-4 text-[11px] leading-5 text-muted-foreground">当前收录 {facultyId === "all" && !staffQuery ? total : "全部"} 位杜伦大学官网各院系公开名单中的在职教师，每日自动更新，仅展示公开学术信息；资料以官网最新内容为准。</p>
  </div>;
}

function StaffResult({ staff, onSelect }: { staff: StaffCard; onSelect: () => void }) {
  const initials = staff.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  return <Button type="button" variant="ghost" onClick={onSelect} className="h-auto w-full items-start justify-start gap-3 rounded-none px-0 py-5 text-left">{staff.imageUrl ? <img src={staff.imageUrl} alt={`${staff.name}官方资料照片`} loading="lazy" width={160} height={200} className="aspect-[4/5] w-16 shrink-0 rounded-md bg-secondary object-cover object-top" /> : <span aria-label={`${staff.name}暂无官方照片`} className="grid aspect-[4/5] w-16 shrink-0 place-items-center rounded-md bg-secondary font-display text-lg font-bold text-primary">{initials}</span>}<span className="min-w-0 flex-1"><strong className="block text-base">{staff.name}</strong><span className="mt-1 block whitespace-normal text-xs font-semibold leading-5 text-primary">{staff.titleZh}</span><span className="mt-2 block whitespace-normal text-xs font-normal leading-5 text-foreground"><b>主讲方向：</b>{staff.interestsZh.slice(0, 3).join("、") || "详见个人资料"}</span><span className="mt-1 line-clamp-2 block whitespace-normal text-xs font-normal leading-5 text-muted-foreground">{staff.departmentZh}{staff.summary ? ` · ${staff.summary}` : ""}</span></span><ChevronRight className="mt-1 size-4 shrink-0 text-primary" /></Button>;
}

function StaffProfilePage({ staff, onBack }: { staff: StaffProfile; onBack: () => void }) {
  const live = useStaffDetail(staff.profileUrl);
  const initials = staff.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  return <article className="animate-rise pb-24"><div className="relative flex min-h-72 items-end overflow-hidden bg-primary px-6 pb-7 pt-20 text-primary-foreground">{staff.imageUrl && <img src={staff.imageUrl} alt={`${staff.name}官方资料照片`} width={800} height={1000} className="absolute inset-0 size-full object-cover object-top opacity-30" />}<div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary)_12%,color-mix(in_oklab,var(--primary)_72%,transparent)_65%,transparent)]" /><Button type="button" size="icon" variant="secondary" onClick={onBack} aria-label="返回教师列表" className="absolute left-4 top-4 z-10 shadow-md"><ArrowLeft className="size-5" /></Button><div className="relative flex items-end gap-5">{staff.imageUrl ? <img src={staff.imageUrl} alt={`${staff.name}官方资料照片`} width={240} height={300} className="aspect-[4/5] w-24 shrink-0 rounded-md bg-secondary object-cover object-top shadow-lg" /> : <span aria-label={`${staff.name}暂无官方照片`} className="grid aspect-[4/5] w-24 shrink-0 place-items-center rounded-md bg-secondary font-display text-2xl font-bold text-primary shadow-lg">{initials}</span>}<div className="min-w-0"><p className="text-[11px] font-bold uppercase text-accent">Durham staff profile</p><h1 className="mt-2 text-2xl font-bold leading-tight">{staff.name}</h1><p className="mt-2 text-sm font-semibold text-primary-foreground/90">{staff.titleZh}</p></div></div></div><div className="px-5 py-8"><section><p className="text-xs font-bold uppercase text-primary">个人简介</p><h2 className="mt-2 text-xl font-bold">教学与研究</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{staff.name} 现任{staff.departmentZh}{staff.titleZh}，主要教学与研究方向包括{staff.interestsZh.join("、")}。</p></section><dl className="mt-7 divide-y divide-border border-y border-border text-sm"><div className="py-4"><dt className="text-xs text-muted-foreground">所属学部</dt><dd className="mt-1 font-semibold">{facultyGroups.find((item) => item.id === staff.facultyId)?.name}</dd><dd className="mt-1 text-xs text-muted-foreground">{staff.faculty}</dd></div><div className="py-4"><dt className="text-xs text-muted-foreground">院系</dt><dd className="mt-1 font-semibold">{staff.departmentZh}</dd><dd className="mt-1 text-xs text-muted-foreground">{staff.department}</dd></div><div className="py-4"><dt className="text-xs text-muted-foreground">主讲方向</dt><dd className="mt-2 flex flex-wrap gap-2">{staff.interestsZh.map((item) => <Tag key={item}>{item}</Tag>)}</dd><dd className="mt-3 text-xs leading-6 text-muted-foreground">{staff.interests.join(" · ")}</dd></div></dl><LiveProfileSections live={live} /><Button type="button" variant="outline" className="mt-6 w-full" onClick={() => window.open(staff.profileUrl, "_blank", "noopener,noreferrer")}>查看官网完整 Profile <ExternalLink className="size-4" /></Button><p className="mt-3 text-[11px] leading-5 text-muted-foreground">照片与资料来自杜伦大学公开 Profile；完整履历与最新任职状态以官网为准。</p></div></article>;
}




function Contact() {
  const [mode, setMode] = useState<"lead" | "info" | "studio" | "booking" | "event">("lead");
  const options = [{ id: "lead" as const, label: "意向填写", icon: FileText }, { id: "info" as const, label: "联系我们", icon: Phone }, { id: "studio" as const, label: "AI Hub", icon: Sparkles }, { id: "booking" as const, label: "预约到校", icon: CalendarDays }, { id: "event" as const, label: "开放日", icon: UsersRound }];
  return <div className="animate-rise"><PageIntro eyebrow="Contact us" title="联系我们" text="提交升学意向、联系学校或预约到校。" /><div className="overflow-x-auto border-b border-border bg-paper px-2"><div className="flex min-w-max">{options.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => { setMode(id); requestAnimationFrame(scrollToAppTop); }} className={cn("h-16 min-h-16 flex-col rounded-none border-b-2 px-4 text-[11px]", mode === id ? "border-primary text-primary" : "border-transparent text-muted-foreground")}><Icon className="size-4" />{label}</Button>)}</div></div><section className="px-4 py-7">{mode === "lead" && <LeadForm />}{mode === "info" && <ContactInfo />}{mode === "studio" && <AiHub />}{mode === "booking" && <BookingForm />}{mode === "event" && <OpenDay />}</section></div>;
}

function LeadForm() {
  const [sending, setSending] = useState(false); const [countries, setCountries] = useState<string[]>([]);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSending(true); const form = event.currentTarget; const data = new FormData(form); const { error } = await supabase.from("leads").insert({ name: String(data.get("name")), phone: String(data.get("phone")), education: String(data.get("education")), intended_program: String(data.get("program")), intended_countries: countries, entry_year: String(data.get("year") || ""), budget: String(data.get("budget") || ""), notes: String(data.get("notes") || "") }); setSending(false); if (error) { toast.error("提交失败，请稍后重试"); return; } toast.success("提交成功，我们会尽快联系你"); form.reset(); setCountries([]); };
  return <form onSubmit={submit} className="space-y-5"><SectionHeading eyebrow="Enquiry form" title="意向信息填写表" /><Field label="姓名 *"><input name="name" required minLength={2} maxLength={20} className={fieldClass} /></Field><Field label="手机号 *"><input name="phone" required pattern="1[3-9][0-9]{9}" inputMode="tel" className={fieldClass} placeholder="11 位手机号" /></Field><Field label="当前学历 *"><select name="education" required defaultValue="" className={fieldClass}><option value="" disabled>请选择</option>{["高中", "高二", "大专", "本科", "其他"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="意向项目 *"><select name="program" required defaultValue="" className={fieldClass}><option value="" disabled>请选择</option>{["国际本科", "硕士", "本科直博", "暂不确定"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="意向国家（可多选）"><div className="flex flex-wrap gap-2">{["英国", "澳大利亚", "美国", "加拿大", "新加坡", "其他"].map((item) => <label key={item} className={cn("rounded-full border px-3 py-2 text-xs", countries.includes(item) ? "border-primary bg-secondary text-primary" : "border-border")}><input type="checkbox" className="sr-only" checked={countries.includes(item)} onChange={() => setCountries((old) => old.includes(item) ? old.filter((value) => value !== item) : [...old, item])} />{item}</label>)}</div></Field><div className="grid grid-cols-2 gap-3"><Field label="预计入学年份"><select name="year" className={fieldClass}><option>2026</option><option>2027</option><option>暂不确定</option></select></Field><Field label="预算区间"><select name="budget" className={fieldClass}><option>20 万内</option><option>20-30 万</option><option>30 万以上</option><option>暂不确定</option></select></Field></div><Field label="备注"><textarea name="notes" maxLength={200} rows={4} className={cn(fieldClass, "py-3")} placeholder="最多 200 字" /></Field><label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input required type="checkbox" className="mt-1 accent-primary" />我已阅读并同意隐私保护指引。</label><Button disabled={sending} className="w-full">{sending ? "正在提交…" : "提交信息"}<ArrowRight className="size-4" /></Button></form>;
}

function ContactInfo() { return <div><SectionHeading eyebrow="School contact" title="联系学校" /><div className="mt-6 space-y-3"><ContactLine icon={<MapPin />} title="学校地址" detail="The Palatine Centre, Stockton Road, Durham, UK" action="导航" onClick={() => window.open("https://maps.google.com/?q=Durham+University", "_blank")} /><ContactLine icon={<Phone />} title="咨询电话" detail="+44 (0)191 334 2000（杜伦大学总机）" action="拨打" href="tel:+441913342000" /><ContactLine icon={<Mail />} title="咨询邮箱" detail="admissions@durham.ac.uk（示例）" action="发邮件" href="mailto:admissions@durham.ac.uk?subject=%E6%8B%9B%E7%94%9F%E5%92%A8%E8%AF%A2" /><ContactLine icon={<MessageCircle />} title="微信客服" detail="客服会话待微信主体接入" action="咨询" onClick={() => toast("微信客服待正式小程序接入")} /><ContactLine icon={<Clock3 />} title="工作时间" detail="待校方补充" /></div></div>; }
function AiHub() { return <div><SectionHeading eyebrow="Technical support" title="AI Hub 工作室" description="技术支持 · 商务合作" /><div className="mt-6 rounded-md border border-border bg-muted p-5"><Sparkles className="size-7 text-primary" /><h2 className="mt-4 text-xl font-bold">合作联系方式</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">以下为演示联系方式，正式信息由甲方提供后替换。</p><div className="mt-5 grid gap-2"><Button variant="outline" asChild><a href="tel:+441913342000"><Phone className="size-4" />联系电话：+44 191 334 2000（示例）</a></Button><Button variant="outline" asChild><a href="mailto:aihub@example.com?subject=%E6%8A%80%E6%9C%AF%E6%94%AF%E6%8C%81%20%2F%20%E5%95%86%E5%8A%A1%E5%90%88%E4%BD%9C"><Mail className="size-4" />联系邮箱：aihub@example.com（待补充）</a></Button></div><p className="hidden"></p></div></div>; }

const SLOT_CAPACITY = 100;
const TIME_SLOTS = ["上午", "下午"] as const;

function BookingForm() {
  const [sending, setSending] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);
  const [party, setParty] = useState(1);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  useEffect(() => {
    if (!date) { setCounts({}); return; }
    let cancelled = false;
    setLoadingCounts(true);
    supabase.rpc("booking_slot_counts", { _date: date }).then(({ data, error }) => {
      if (cancelled) return;
      setLoadingCounts(false);
      if (error) { setCounts({}); return; }
      const map: Record<string, number> = {};
      for (const row of data ?? []) map[row.time_slot] = Number(row.booked);
      setCounts(map);
    });
    return () => { cancelled = true; };
  }, [date]);

  const remaining = (s: string) => Math.max(0, SLOT_CAPACITY - (counts[s] ?? 0));
  const slotFull = (s: string) => remaining(s) <= 0;
  const currentFull = slotFull(slot) || remaining(slot) < party;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date) { toast.error("请选择到访日期"); return; }
    if (slotFull(slot)) { toast.error(`该时段已约满，请选择其他时段`); return; }
    if (remaining(slot) < party) { toast.error(`该时段仅剩 ${remaining(slot)} 个名额，请减少陪同人数或更换时段`); return; }
    setSending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const code = `DU-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase.from("bookings").insert({ name: String(data.get("name")), phone: String(data.get("phone")), visit_date: date, time_slot: slot, party_size: party, notes: String(data.get("notes") || ""), visit_code: code });
    setSending(false);
    if (error) { toast.error("提交失败，请稍后重试"); return; }
    saveMyBooking({ code, date, slot, party });
    toast.success(`预约成功！到访凭证：${code}`, { duration: 8000 });
    form.reset(); setDate(""); setSlot(TIME_SLOTS[0]); setParty(1); setCounts({});
  };

  return <div className="space-y-10"><form onSubmit={submit} className="space-y-5"><SectionHeading eyebrow="Campus visit" title="预约到校" description="上午、下午各一档，每时段限 100 人，约满即止。" /><Field label="姓名 *"><input name="name" required minLength={2} maxLength={20} className={fieldClass} /></Field><Field label="手机号 *"><input name="phone" required pattern="1[3-9][0-9]{9}" inputMode="tel" className={fieldClass} /></Field><Field label="到访日期 *"><input name="date" type="date" min={minDate} required className={fieldClass} value={date} onChange={(e) => setDate(e.target.value)} /></Field><Field label="时段 *（每时段限 100 人）"><div className="grid grid-cols-2 gap-3">{TIME_SLOTS.map((s) => { const full = date ? slotFull(s) : false; return <button key={s} type="button" disabled={full} onClick={() => setSlot(s)} className={cn("rounded-md border px-3 py-3 text-sm transition-colors", full ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50" : slot === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-paper text-foreground hover:border-primary/50")}><span className="block font-semibold">{s}</span><span className="mt-1 block text-[11px]">{!date ? "请先选择日期" : loadingCounts ? "查询名额…" : full ? "已约满" : `剩余 ${remaining(s)} 个名额`}</span></button>; })}</div></Field><Field label="陪同人数 *"><input name="party" type="number" min={1} max={10} value={party} onChange={(e) => setParty(Math.max(1, Number(e.target.value) || 1))} required className={fieldClass} /></Field><Field label="备注"><textarea name="notes" maxLength={200} rows={4} className={cn(fieldClass, "py-3")} /></Field><div className="rounded-md border-l-2 border-primary bg-muted p-4 text-xs leading-5 text-muted-foreground">预约提交后将生成到访凭证；正式提醒功能待微信订阅消息接入。</div><Button disabled={sending || (date ? currentFull : false)} className="w-full">{sending ? "正在提交…" : date && slotFull(slot) ? "该时段已约满" : "提交预约"}<CalendarDays className="size-4" /></Button></form><CancelBooking onCancelled={() => { if (date) { const d = date; setDate(""); setTimeout(() => setDate(d), 0); } }} /></div>;
}
type MyBooking = { code: string; date: string; slot: string; party: number };
const MY_BOOKINGS_KEY = "durham-my-bookings";
function loadMyBookings(): MyBooking[] {
  try { return JSON.parse(localStorage.getItem(MY_BOOKINGS_KEY) || "[]") as MyBooking[]; } catch { return []; }
}
function saveMyBooking(b: MyBooking) {
  const list = loadMyBookings().filter((x) => x.code !== b.code);
  list.push(b);
  localStorage.setItem(MY_BOOKINGS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("my-bookings-changed"));
}
function removeMyBooking(code: string) {
  localStorage.setItem(MY_BOOKINGS_KEY, JSON.stringify(loadMyBookings().filter((x) => x.code !== code)));
  window.dispatchEvent(new Event("my-bookings-changed"));
}

function CancelBooking({ onCancelled }: { onCancelled: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<MyBooking | null>(null);
  const [mine, setMine] = useState<MyBooking[]>([]);
  useEffect(() => {
    const sync = () => setMine(loadMyBookings());
    sync();
    window.addEventListener("my-bookings-changed", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("my-bookings-changed", sync); window.removeEventListener("storage", sync); };
  }, []);
  const cancel = async (b: MyBooking) => {
    setBusy(b.code);
    const { data: ok, error } = await supabase.rpc("cancel_booking_by_code", { _code: b.code });
    setBusy(null);
    setConfirming(null);
    if (error) { toast.error("取消失败，请稍后重试"); return; }
    if (!ok) { toast.error("该预约已取消或不存在"); removeMyBooking(b.code); return; }
    removeMyBooking(b.code);
    toast.success("预约已取消，名额已释放");
    onCancelled();
  };
  return <div className="space-y-5 rounded-lg border-2 border-primary/30 bg-primary/5 p-5"><div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><CalendarX2 className="size-5" /></span><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">My bookings</p><h2 className="text-xl font-bold">我的预约</h2></div></div><p className="text-sm leading-6 text-muted-foreground">你在本机提交的预约会显示在这里，可一键取消，取消后名额自动释放。</p>{mine.length === 0 ? <p className="rounded-md border border-dashed border-border bg-paper p-5 text-center text-sm text-muted-foreground">暂无预约记录</p> : <div className="space-y-3">{mine.map((b) => <div key={b.code} className="rounded-md border border-border bg-paper p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-base font-bold">{b.date} · {b.slot} · {b.party} 人</p><p className="mt-1 text-xs text-muted-foreground">到访凭证 {b.code}</p></div><span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">待到访</span></div><Button variant="destructive" className="mt-3 w-full" disabled={busy === b.code} onClick={() => setConfirming(b)}>{busy === b.code ? "正在取消…" : "取消这次预约"}</Button></div>)}</div>}{confirming && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-6" role="dialog" aria-modal="true" aria-label="确认取消预约"><div className="w-full max-w-[340px] rounded-md bg-paper p-6"><h3 className="text-lg font-bold">确定取消这次预约吗？</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{confirming.date} · {confirming.slot} · {confirming.party} 人（凭证 {confirming.code}）。取消后名额将立即释放，此操作不可撤销。</p><div className="mt-6 grid grid-cols-2 gap-3"><Button variant="outline" onClick={() => setConfirming(null)}>再想想</Button><Button variant="destructive" disabled={busy === confirming.code} onClick={() => cancel(confirming)}>{busy === confirming.code ? "取消中…" : "确定取消"}</Button></div></div></div>}</div>;
}
function OpenDay() { return <div><SectionHeading eyebrow="Coming next" title="校园开放日" description="活动报名为二期功能。" /><div className="mt-6 overflow-hidden rounded-md border border-border"><img src={campusHero} alt="杜伦大学校园开放日" className="aspect-[16/9] w-full object-cover" /><div className="p-5"><p className="text-xs font-semibold text-primary">活动信息待发布</p><h2 className="mt-2 text-xl font-bold">校园开放日与招生说明会</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">活动名称、时间、地点与亮点将在校方确认后展示。</p><Button className="mt-5 w-full" disabled>报名暂未开放</Button></div></div></div>; }

function LaunchAd({ onClose, onOpen }: { onClose: () => void; onOpen: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/75 p-6" role="dialog" aria-modal="true" aria-label="主推项目"><div className="relative w-full max-w-[340px] overflow-hidden rounded-md bg-primary shadow-2xl"><img src={campusHero} alt="主推项目" className="aspect-[3/4] w-full object-cover" /><div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary)_2%,transparent_70%)]" /><Button size="icon" variant="secondary" onClick={onClose} aria-label="关闭广告" className="absolute right-3 top-3 rounded-full"><X className="size-5" /></Button><div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground"><img src={logoWhite.url} alt="Durham University 官方反白标志" className="h-10 w-auto max-w-[220px] object-contain object-left" /><p className="mt-6 text-xs font-bold text-accent">主推项目</p><h2 className="mt-2 text-3xl font-bold">国际本科衔接项目</h2><p className="mt-2 text-sm text-primary-foreground/80">探索项目内容与申请流程</p><Button variant="gold" className="mt-5 w-full" onClick={onOpen}>查看项目详情 <ArrowRight className="size-4" /></Button></div></div></div>; }
function ConsultModal({ onClose, onForm }: { onClose: () => void; onForm: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-end bg-ink/70 sm:place-items-center" role="dialog" aria-modal="true" aria-label="微信客服"><div className="w-full max-w-[520px] rounded-t-md bg-paper p-6 sm:rounded-md"><div className="flex items-center justify-between"><img src={logoDark.url} alt="Durham University 官方标志" className="h-10 w-auto max-w-[210px]" /><Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭"><X className="size-5" /></Button></div><div className="mt-6 rounded-md bg-muted p-5"><h2 className="font-bold">直接咨询</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">正式微信客服会话待小程序主体接入；你可以先填写意向信息。</p></div><Button className="mt-4 w-full" onClick={onForm}>填写意向信息 <ArrowRight className="size-4" /></Button></div></div>; }

function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <section className="bg-primary px-5 py-9 text-primary-foreground"><p className="text-xs font-bold uppercase text-accent">{eyebrow}</p><h1 className="mt-2 text-4xl font-bold">{title}</h1><p className="mt-3 text-sm leading-6 text-primary-foreground/80">{text}</p></section>; }
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) { return <div><p className="text-xs font-bold uppercase text-primary">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2>{description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}</div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }
function Tag({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) { return <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", inverse ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary text-primary")}>{children}</span>; }
function DetailSection({ number, title, children }: { number: string; title: string; children: ReactNode }) { return <section><div className="mb-4 flex items-center gap-3 border-b border-border pb-3"><span className="text-xs font-bold text-primary">{number}</span><h2 className="text-xl font-bold">{title}</h2></div><div className="text-sm leading-7 text-muted-foreground">{children}</div></section>; }
function ContactLine({ icon, title, detail, action, onClick, href }: { icon: ReactNode; title: string; detail: string; action?: string; onClick?: () => void; href?: string }) { if (href) return <Button variant="outline" asChild className="h-auto min-h-18 w-full justify-start gap-4 p-4 text-left disabled:opacity-100"><a href={href}><span className="text-primary [&>svg]:size-5">{icon}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">{detail}</span></span>{action && <span className="text-xs text-primary">{action}</span>}</a></Button>; return <Button variant="outline" onClick={onClick} disabled={!onClick} className="h-auto min-h-18 w-full justify-start gap-4 p-4 text-left disabled:opacity-100"><span className="text-primary [&>svg]:size-5">{icon}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">{detail}</span></span>{action && <span className="text-xs text-primary">{action}</span>}</Button>; }
function BottomNav({ tab, onChange }: { tab: MainTab; onChange: (tab: MainTab) => void }) { const items: [MainTab, typeof University, string][] = [["school", University, "学校相关"], ["overseas", GraduationCap, "海外留学"], ["contact", Phone, "联系我们"]]; return <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-17 max-w-[520px] grid-cols-3 border-t border-border bg-paper pb-[env(safe-area-inset-bottom)]">{items.map(([value, Icon, label]) => <Button key={value} variant="ghost" onClick={() => onChange(value)} className={cn("relative h-17 min-h-17 flex-col gap-1 rounded-none text-[11px]", tab === value ? "text-primary" : "text-muted-foreground")}>{tab === value && <span className="absolute top-0 h-0.5 w-9 bg-primary" />}<Icon className="size-5" />{label}</Button>)}</nav>; }
