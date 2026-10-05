import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { loadDemoEvents, type DemoEvent } from "@/lib/demo-events";
import { SCREEN_CATALOG, SCREEN_GROUPS, type ScreenId } from "@/lib/miniprogram-screens";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "杜伦招生小程序 Demo 平台" },
      { name: "description", content: "点选即可查看招生小程序的全部可视化页面与交互。" },
    ],
  }),
  component: DemoPlatform,
});

const AUDIT = [
  {
    item: "三个底部 Tab 与启动广告",
    state: "已实现",
    note: "当日关闭后不再弹出；点击进入项目详情。",
  },
  {
    item: "学校介绍 / 师资 / 校园 / 访谈",
    state: "已实现",
    note: "师资为官网公开名录；访谈为标注过的演示内容。",
  },
  {
    item: "官网 web-view",
    state: "演示",
    note: "页内浏览器壳已可点。正式发布需配置业务域名后用微信 web-view 打开。",
  },
  {
    item: "留学三类项目、筛选、详情、PDF、分享",
    state: "已实现",
    note: "项目超过 10 个时显示筛选。学费与名额仍标为待校方公布。",
  },
  {
    item: "直接咨询 / 悬浮客服",
    state: "演示",
    note: "统一进入客服面板。正式环境替换为 wx.openCustomerServiceChat。",
  },
  {
    item: "意向表全字段与手机号授权",
    state: "已实现",
    note: "授权在 Demo 中填入演示号码，并写入线索库。",
  },
  {
    item: "地址、电话、AI Hub",
    state: "已实现",
    note: "地址打开腾讯地图；电话与邮箱为系统唤起。AI Hub 联系方式仍待甲方补充。",
  },
  {
    item: "预约到校与开放日报名",
    state: "已实现",
    note: "预约按时段控名额。开放日报名为可提交的演示，不写入正式活动库。",
  },
  { item: "订阅消息", state: "演示", note: "提交成功后弹出授权。真正下发需微信模板与主体。" },
  {
    item: "埋点",
    state: "已实现",
    note: "曝光、点击、咨询、留资、预约记在本机，右侧可看最近记录。",
  },
  {
    item: "内容后台与数据导出",
    state: "未做",
    note: "PRD 要求登录后的可视化后台。公开端按规则不能读取他人线索。",
  },
  {
    item: "三期：测评、裂变、个人中心、Offer 墙、FAQ",
    state: "未做",
    note: "不在 V1.0 一期范围。",
  },
] as const;

function DemoPlatform() {
  const [active, setActive] = useState<ScreenId>("school-home");
  const [tour, setTour] = useState(false);
  const [events, setEvents] = useState<DemoEvent[]>([]);

  useEffect(() => {
    const sync = () => setEvents(loadDemoEvents());
    sync();
    const timer = window.setInterval(sync, 1000);
    window.addEventListener("durham-demo-events", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("durham-demo-events", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!tour) return;
    const ids = SCREEN_CATALOG.map((item) => item.id);
    const timer = window.setInterval(() => {
      setActive((current) => ids[(ids.indexOf(current) + 1) % ids.length] ?? "school-home");
    }, 4500);
    return () => window.clearInterval(timer);
  }, [tour]);

  return (
    <div className="min-h-dvh bg-[oklch(0.16_0.04_280)] text-primary-foreground">
      <header className="border-b border-white/10 px-5 py-5">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              PRD V1.0 demo
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold">招生小程序 Demo 平台</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/75">
              点左侧任意卡片，右侧会打开对应的可视化页面，并可直接点击、填写和切换。需要全屏操作时进入小程序。
            </p>
          </div>
          <Button asChild variant="gold">
            <a href={`/?screen=${active}`}>进入当前页面</a>
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-bold">对照需求文档</h2>
            <ul className="mt-3 divide-y divide-white/10">
              {AUDIT.map((row) => (
                <li key={row.item} className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr] sm:gap-3">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      row.state === "未做" ? "text-accent" : "text-primary-foreground",
                    )}
                  >
                    {row.state}
                  </span>
                  <span>
                    <strong className="block text-sm">{row.item}</strong>
                    <span className="mt-1 block text-xs leading-5 text-primary-foreground/70">
                      {row.note}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          {SCREEN_GROUPS.map((group) => (
            <section key={group}>
              <h2 className="mb-3 text-sm font-bold text-accent">{group}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {SCREEN_CATALOG.filter((item) => item.group === group).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTour(false);
                      setActive(item.id);
                    }}
                    className={cn(
                      "rounded-2xl border p-4 text-left",
                      active === item.id
                        ? "border-accent bg-white text-ink"
                        : "border-white/15 bg-white/5 hover:bg-white/10",
                    )}
                  >
                    <strong className="block text-sm">{item.title}</strong>
                    <span
                      className={cn(
                        "mt-1 block text-xs leading-5",
                        active === item.id ? "text-muted-foreground" : "text-primary-foreground/70",
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
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold">
              {SCREEN_CATALOG.find((item) => item.id === active)?.title}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10"
              onClick={() => setTour((value) => !value)}
            >
              {tour ? "停止浏览" : "自动浏览"}
            </Button>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-white/15 bg-black shadow-2xl">
            <iframe
              title="小程序预览"
              src={`/?screen=${active}&embed=1`}
              className="h-[740px] w-full bg-paper"
            />
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-bold">最近埋点</h2>
            {events.length === 0 ? (
              <p className="mt-2 text-xs text-primary-foreground/70">
                在右侧页面里点击广告、咨询或提交表单后，记录会出现在这里。
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {events.slice(0, 8).map((event) => (
                  <li
                    key={`${event.at}-${event.name}`}
                    className="text-xs leading-5 text-primary-foreground/80"
                  >
                    <span className="font-bold text-accent">{event.name}</span>
                    {event.detail ? ` · ${event.detail}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
