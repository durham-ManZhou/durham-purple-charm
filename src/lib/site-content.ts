import { useQuery } from "@tanstack/react-query";
import campusCourtyard from "@/assets/campus-courtyard.jpg";
import campusHero from "@/assets/campus-hero.jpg";
import campusLibrary from "@/assets/campus-library.jpg";
import campusRiverside from "@/assets/campus-riverside.jpg";
import interviewVideo from "@/assets/student-interview-demo.mp4.asset.json";
import studentPortrait from "@/assets/student-portrait.jpg";
import studentsStudy from "@/assets/students-study.jpg";
import { projects as defaultProjects, type Project } from "@/components/overseas";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type StoryContent = { id: string; type: "图文" | "视频"; title: string; image: string; video?: string; body?: string };
export type StudentStory = { id: number; name: string; offer: string; quote: string; image: string; contents: StoryContent[] };
export type CampusScene = { image: string; title: string; caption: string };
export type LaunchAdContent = { enabled: boolean; label: string; title: string; subtitle: string; image: string; projectId: number };
export type ContactContent = {
  address: string; mapUrl: string; phone: string; phoneTel: string; email: string; hours: string; wechat: string;
  aihubPhone: string; aihubPhoneTel: string; aihubEmail: string;
};

export type SiteContent = {
  projects: Project[];
  launch_ad: LaunchAdContent;
  campus_scenes: CampusScene[];
  student_stories: StudentStory[];
  contact: ContactContent;
};
export type ContentKey = keyof SiteContent;

const article = "这是一篇用于打通学生访谈阅读流程的演示图文。页面已支持访谈图片、学生信息、录取院校、感言与正文内容展示。\n\n正式上线时，可将这里替换为经过学生授权和校方审核的真实访谈，包括申请准备、课程体验、学院生活与升学建议。";

export const defaultContent: SiteContent = {
  projects: defaultProjects,
  launch_ad: { enabled: true, label: "主推项目", title: "国际本科衔接项目", subtitle: "探索项目内容与申请流程", image: campusHero, projectId: 1 },
  campus_scenes: [
    { image: campusCourtyard, title: "学院庭院", caption: "古老石墙与开阔草坪，构成日常往返课堂的学院景致。" },
    { image: campusLibrary, title: "图书馆", caption: "安静的阅览空间，为个人学习与资料查阅提供专注环境。" },
    { image: campusRiverside, title: "河畔步道", caption: "沿威尔河漫步，可以从城市绿意中远望杜伦的历史天际线。" },
    { image: campusHero, title: "校园建筑", caption: "历史建筑与现代大学生活在杜伦城中自然交融。" },
  ],
  student_stories: [
    { id: 1, name: "学生 A", offer: "杜伦大学 · 商科方向", quote: "学院社区让我很快找到学习节奏。", image: studentPortrait, contents: [
      { id: "1-article", type: "图文", title: "从申请准备到融入学院生活", image: studentPortrait, body: article },
      { id: "1-video", type: "视频", title: "我的杜伦学习日常", image: campusRiverside, video: interviewVideo.url },
    ] },
    { id: 2, name: "学生 B", offer: "杜伦大学 · 人文方向", quote: "小班讨论让我更敢表达自己的观点。", image: studentsStudy, contents: [
      { id: "2-article", type: "图文", title: "在杜伦学习人文是一种怎样的体验", image: studentsStudy, body: article },
    ] },
    { id: 3, name: "学生 C", offer: "杜伦大学 · 理工方向", quote: "校园、课堂和研究机会都超出预期。", image: campusCourtyard, contents: [
      { id: "3-video", type: "视频", title: "一分钟走进我的杜伦学习日常", image: campusRiverside, video: interviewVideo.url },
    ] },
  ],
  contact: {
    address: "The Palatine Centre, Stockton Road, Durham, UK",
    mapUrl: "https://maps.google.com/?q=Durham+University",
    phone: "+44 (0)191 334 2000（杜伦大学总机）", phoneTel: "+441913342000",
    email: "admissions@durham.ac.uk", hours: "待校方补充", wechat: "客服会话待微信主体接入",
    aihubPhone: "+44 191 334 2000（示例）", aihubPhoneTel: "+441913342000", aihubEmail: "aihub@example.com",
  },
};

export const contentLabels: Record<ContentKey, string> = {
  projects: "留学项目", launch_ad: "启动弹窗", campus_scenes: "校园环境", student_stories: "学生访谈", contact: "联系方式",
};

export const siteContentQuery = <K extends ContentKey>(key: K) => ({
  queryKey: ["site_content", key] as const,
  queryFn: async (): Promise<SiteContent[K] | null> => {
    const { data, error } = await supabase.from("site_content").select("data").eq("key", key).maybeSingle();
    if (error) throw error;
    return (data?.data as unknown as SiteContent[K]) ?? null;
  },
  staleTime: 60_000,
});

/** Content saved in the admin console, falling back to the built-in defaults. */
export function useSiteContent<K extends ContentKey>(key: K): SiteContent[K] {
  const { data } = useQuery(siteContentQuery(key));
  return data ?? defaultContent[key];
}

export async function saveSiteContent<K extends ContentKey>(key: K, value: SiteContent[K]) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("site_content").upsert({ key, data: value as unknown as Json, updated_by: user?.id ?? null });
  if (error) throw error;
}

/** Resize an image in the browser and return it as a data URL so it can be stored with the content. */
export function imageFileToDataUrl(file: File, maxSize = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) { reject(new Error("请选择图片文件")); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const png = file.type === "image/png" || file.type === "image/svg+xml";
      resolve(canvas.toDataURL(png ? "image/png" : "image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("图片读取失败")); };
    img.src = url;
  });
}
