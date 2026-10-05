import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SCREEN_CATALOG, SCREEN_GROUPS, type ScreenId } from "@/lib/miniprogram-screens";
import { cn } from "@/lib/utils";

export function MiniProgramStudio({
  active,
  onSelect,
  showCatalog,
  phone,
}: {
  active: ScreenId;
  onSelect: (id: ScreenId) => void;
  showCatalog: boolean;
  phone: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,oklch(0.45_0.12_324)_0%,oklch(0.18_0.05_260)_42%,oklch(0.12_0.03_260)_100%)] text-primary-foreground">
      <div
        className={cn(
          "mx-auto flex max-w-[1240px] gap-8 px-4 py-6",
          showCatalog ? "lg:flex-row lg:items-start" : "justify-center",
        )}
      >
        {showCatalog && (
          <aside className="hidden min-h-[min(844px,calc(100dvh-48px))] w-[min(100%,420px)] shrink-0 overflow-y-auto rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-md lg:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              WeChat mini program demo
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">可视化全部页面</h2>
            <p className="mt-3 text-sm leading-6 text-primary-foreground/75">
              按 PRD 技术流：H5 仿真微信小程序交互，正式发布时用原生 web-view
              壳接入业务域名并上传审核。
            </p>
            <ScreenCatalog active={active} onSelect={onSelect} tone="dark" />
          </aside>
        )}
        <div className="flex flex-1 justify-center">{phone}</div>
      </div>
    </div>
  );
}

export function ScreenCatalog({
  active,
  onSelect,
  tone,
}: {
  active: ScreenId;
  onSelect: (id: ScreenId) => void;
  tone: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <div className="mt-6 space-y-6">
      {SCREEN_GROUPS.map((group) => (
        <section key={group}>
          <h3 className={cn("mb-2 text-xs font-bold", dark ? "text-accent" : "text-primary")}>
            {group}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {SCREEN_CATALOG.filter((item) => item.group === group).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition",
                  active === item.id
                    ? dark
                      ? "border-accent bg-white text-ink"
                      : "border-primary bg-primary text-primary-foreground"
                    : dark
                      ? "border-white/15 bg-white/5 hover:bg-white/10"
                      : "border-border bg-paper hover:border-primary",
                )}
              >
                <strong className="block text-sm">{item.title}</strong>
                <span
                  className={cn(
                    "mt-1 block text-[11px] leading-5",
                    active === item.id && !dark
                      ? "text-primary-foreground/80"
                      : dark && active !== item.id
                        ? "text-primary-foreground/65"
                        : "text-muted-foreground",
                  )}
                >
                  {item.blurb}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function OverviewSheet({
  active,
  onSelect,
  onClose,
}: {
  active: ScreenId;
  onSelect: (id: ScreenId) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto bg-paper px-4 pb-24 pt-4"
      role="dialog"
      aria-modal="true"
      aria-label="页面总览"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Demo map</p>
          <h2 className="mt-1 text-2xl font-bold">小程序页面总览</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          进入页面
        </Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        点选任意卡片，右侧（或本机）将打开对应的微信小程序页面。
      </p>
      <ScreenCatalog
        active={active}
        onSelect={(id) => {
          onSelect(id);
          onClose();
        }}
        tone="light"
      />
    </div>
  );
}

export function PrivacyPage() {
  return (
    <article className="space-y-5 px-5 py-6 text-sm leading-7 text-muted-foreground">
      <p className="text-xs font-bold uppercase text-primary">Required for WeChat review</p>
      <h2 className="text-2xl font-bold text-foreground">用户隐私保护指引</h2>
      <p>
        本小程序用于杜伦大学中文招生信息服务。我们仅在你主动提交时收集必要信息，并按最小必要原则处理。
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>意向表：姓名、手机号、学历与升学意向，用于招生顾问回访。</li>
        <li>预约到校：姓名、手机号、到访日期、时段与人数，用于安排接待并控制名额。</li>
        <li>不申请通讯录、相册、位置的持续后台访问；拨号、邮件、地图仅在你点击后由系统完成。</li>
        <li>线索与预约通过服务端写入，公开端仅允许提交、不可读取他人记录。</li>
        <li>教师名录仅展示杜伦大学官网已公开的在职学术信息。</li>
      </ul>
      <p>
        你可拒绝授权并继续浏览公开内容。正式上线前请将本页替换为微信公众平台《用户隐私保护指引》模板终稿。
      </p>
    </article>
  );
}

export const DEPLOY_STEPS = [
  { title: "注册微信小程序", detail: "用学校或授权主体完成微信公众平台认证，获取 AppID。" },
  { title: "配置业务域名", detail: "将本 H5 部署域名加入 web-view 业务域名，并放置校验文件。" },
  { title: "打开原生壳工程", detail: "用微信开发者工具导入仓库中的 miniprogram/ 目录。" },
  { title: "写入 H5 地址", detail: "在 pages/index/index.js 将 h5Url 改为已备案的 https 域名。" },
  { title: "类目与隐私", detail: "选择教育类目，上传隐私指引，配置客服、订阅消息与电话能力。" },
  { title: "上传审核发布", detail: "预览真机通过后上传代码，提交审核并发布。" },
] as const;

export function DeployPage() {
  return (
    <article className="space-y-5 px-5 py-6">
      <p className="text-xs font-bold uppercase text-primary">Release flow</p>
      <h2 className="text-2xl font-bold">微信小程序部署</h2>
      <p className="text-sm leading-7 text-muted-foreground">
        当前页面是可交互 H5 Demo，视觉与信息架构对齐微信小程序。正式发布按下列技术流接入原生壳。
      </p>
      <ol className="space-y-3">
        {DEPLOY_STEPS.map((step, index) => (
          <li key={step.title} className="rounded-md border border-border bg-muted/50 p-4">
            <p className="text-xs font-bold text-primary">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 font-bold">{step.title}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
          </li>
        ))}
      </ol>
      <p className="text-[11px] leading-5 text-muted-foreground">
        仓库路径：miniprogram/。网页预览中的客服会话、订阅消息、手机号授权为等价模拟，待主体与资质接入后替换为
        wx.* 接口。
      </p>
    </article>
  );
}
