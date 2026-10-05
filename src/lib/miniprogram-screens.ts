export type MainTab = "school" | "overseas" | "contact";
export type SchoolView = "index" | "about" | "faculty" | "campus" | "interviews" | "website";
export type ContactMode = "lead" | "info" | "studio" | "booking" | "event";
export type ProjectType = "国际本科" | "硕士项目" | "本科直博";

export type ScreenId =
  | "ad"
  | "school-home"
  | "website"
  | "school-about"
  | "school-faculty"
  | "school-staff"
  | "school-campus"
  | "school-interviews"
  | "school-story"
  | "overseas-undergrad"
  | "overseas-master"
  | "overseas-phd"
  | "project-detail"
  | "contact-lead"
  | "contact-info"
  | "contact-studio"
  | "contact-booking"
  | "contact-event"
  | "consult"
  | "privacy"
  | "deploy";

export type ScreenCard = {
  id: ScreenId;
  group: string;
  title: string;
  blurb: string;
};

export const SCREEN_CATALOG: ScreenCard[] = [
  { id: "ad", group: "启动", title: "每日主推弹窗", blurb: "每日首次进入展示，关闭后当日不再出现" },
  { id: "school-home", group: "学校相关", title: "学校首页", blurb: "Banner 与四个入口、官网直达" },
  { id: "website", group: "学校相关", title: "学校官网", blurb: "小程序内 web-view 打开官网" },
  { id: "school-about", group: "学校相关", title: "学校介绍", blurb: "简介、历史与荣誉资质" },
  { id: "school-faculty", group: "学校相关", title: "师资力量", blurb: "学部筛选与在校教师检索" },
  { id: "school-staff", group: "学校相关", title: "教师详情", blurb: "公开资料摘要与官网 Profile" },
  { id: "school-campus", group: "学校相关", title: "校园环境", blurb: "自动轮播与手势滑动图集" },
  { id: "school-interviews", group: "学校相关", title: "学生访谈", blurb: "按学生聚合图文 / 视频" },
  { id: "school-story", group: "学校相关", title: "访谈详情", blurb: "学生感言与可播放演示视频" },
  {
    id: "overseas-undergrad",
    group: "海外留学",
    title: "国际本科",
    blurb: "项目卡、筛选、置顶与咨询",
  },
  { id: "overseas-master", group: "海外留学", title: "硕士项目", blurb: "统一卡片字段与 3:4 封面" },
  { id: "overseas-phd", group: "海外留学", title: "本科直博", blurb: "研究型项目列表" },
  {
    id: "project-detail",
    group: "海外留学",
    title: "项目详情",
    blurb: "五模块详情、PDF、分享、咨询栏",
  },
  { id: "contact-lead", group: "联系我们", title: "意向填写", blurb: "完整意向表并写入线索库" },
  { id: "contact-info", group: "联系我们", title: "联系学校", blurb: "地址、电话、邮箱、客服" },
  { id: "contact-studio", group: "联系我们", title: "AI Hub", blurb: "技术支持与商务合作" },
  { id: "contact-booking", group: "联系我们", title: "预约到校", blurb: "分时段名额与取消预约" },
  { id: "contact-event", group: "联系我们", title: "校园开放日", blurb: "活动信息与报名表" },
  { id: "consult", group: "全局", title: "微信客服", blurb: "悬浮咨询入口与会话占位" },
  { id: "privacy", group: "部署", title: "隐私保护指引", blurb: "微信小程序上架所需用户协议" },
  { id: "deploy", group: "部署", title: "微信部署清单", blurb: "业务域名、AppID、审核与上传" },
];

export const SCREEN_GROUPS = [...new Set(SCREEN_CATALOG.map((item) => item.group))];

export type NavSnapshot = {
  screen: ScreenId;
  tab: MainTab;
  schoolView: SchoolView;
  overseasType: ProjectType;
  detailId: number | null;
  contactMode: ContactMode;
  adOpen: boolean;
  consultOpen: boolean;
  privacyOpen: boolean;
  deployOpen: boolean;
  showStaffDetail: boolean;
  showStoryDetail: boolean;
};

const closedOverlays = {
  adOpen: false,
  consultOpen: false,
  privacyOpen: false,
  deployOpen: false,
  showStaffDetail: false,
  showStoryDetail: false,
  detailId: null as number | null,
};

export function navForScreen(id: ScreenId): NavSnapshot {
  switch (id) {
    case "ad":
      return {
        screen: id,
        tab: "school",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
        adOpen: true,
      };
    case "school-home":
      return {
        screen: id,
        tab: "school",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "website":
      return {
        screen: id,
        tab: "school",
        schoolView: "website",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "school-about":
      return {
        screen: id,
        tab: "school",
        schoolView: "about",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "school-faculty":
      return {
        screen: id,
        tab: "school",
        schoolView: "faculty",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "school-staff":
      return {
        screen: id,
        tab: "school",
        schoolView: "faculty",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
        showStaffDetail: true,
      };
    case "school-campus":
      return {
        screen: id,
        tab: "school",
        schoolView: "campus",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "school-interviews":
      return {
        screen: id,
        tab: "school",
        schoolView: "interviews",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "school-story":
      return {
        screen: id,
        tab: "school",
        schoolView: "interviews",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
        showStoryDetail: true,
      };
    case "overseas-undergrad":
      return {
        screen: id,
        tab: "overseas",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "overseas-master":
      return {
        screen: id,
        tab: "overseas",
        schoolView: "index",
        overseasType: "硕士项目",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "overseas-phd":
      return {
        screen: id,
        tab: "overseas",
        schoolView: "index",
        overseasType: "本科直博",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "project-detail":
      return {
        screen: id,
        tab: "overseas",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
        detailId: 1,
      };
    case "contact-lead":
      return {
        screen: id,
        tab: "contact",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
      };
    case "contact-info":
      return {
        screen: id,
        tab: "contact",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "info",
        ...closedOverlays,
      };
    case "contact-studio":
      return {
        screen: id,
        tab: "contact",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "studio",
        ...closedOverlays,
      };
    case "contact-event":
      return {
        screen: id,
        tab: "contact",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "event",
        ...closedOverlays,
      };
    case "contact-booking":
      return {
        screen: id,
        tab: "contact",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "booking",
        ...closedOverlays,
      };
    case "consult":
      return {
        screen: id,
        tab: "school",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
        consultOpen: true,
      };
    case "privacy":
      return {
        screen: id,
        tab: "school",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
        privacyOpen: true,
      };
    case "deploy":
      return {
        screen: id,
        tab: "school",
        schoolView: "index",
        overseasType: "国际本科",
        contactMode: "lead",
        ...closedOverlays,
        deployOpen: true,
      };
  }
}

export function navTitle(state: NavSnapshot): string {
  if (state.privacyOpen) return "隐私保护指引";
  if (state.deployOpen) return "微信部署";
  if (state.consultOpen) return "微信客服";
  if (state.adOpen) return "杜伦大学";
  if (state.showStaffDetail) return "教师详情";
  if (state.showStoryDetail) return "学生访谈";
  if (state.detailId) return "项目详情";
  if (state.tab === "overseas") return "海外留学";
  if (state.tab === "contact") {
    const labels: Record<ContactMode, string> = {
      lead: "意向填写",
      info: "联系学校",
      studio: "AI Hub",
      booking: "预约到校",
      event: "开放日",
    };
    return labels[state.contactMode];
  }
  const school: Record<SchoolView, string> = {
    index: "学校相关",
    about: "学校介绍",
    faculty: "师资力量",
    campus: "校园环境",
    interviews: "学生访谈",
    website: "学校官网",
  };
  return school[state.schoolView];
}

export function navShowsBack(state: NavSnapshot): boolean {
  if (
    state.privacyOpen ||
    state.deployOpen ||
    state.showStaffDetail ||
    state.showStoryDetail ||
    state.detailId
  )
    return true;
  if (state.tab === "school" && state.schoolView !== "index") return true;
  return false;
}

export function parseScreenParam(value: string | null): ScreenId | null {
  return SCREEN_CATALOG.some((item) => item.id === value) ? (value as ScreenId) : null;
}
