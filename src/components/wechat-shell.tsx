import {
  ArrowLeft,
  Ellipsis,
  LayoutGrid,
  RotateCcw,
  Share2,
  Shield,
  Smartphone,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function clockLabel() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function WeChatPhone({
  title,
  showBack,
  onBack,
  onOverview,
  onShare,
  onRelaunch,
  onPrivacy,
  onDeploy,
  tabBar,
  children,
  framed,
}: {
  title: string;
  showBack: boolean;
  onBack: () => void;
  onOverview: () => void;
  onShare: () => void;
  onRelaunch: () => void;
  onPrivacy: () => void;
  onDeploy: () => void;
  tabBar?: ReactNode;
  children: ReactNode;
  framed: boolean;
}) {
  const [time, setTime] = useState(clockLabel);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setTime(clockLabel()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={cn("wx-phone", framed ? "wx-phone-framed" : "wx-phone-flush")}>
      <div className="wx-screen">
        <div className="wx-status" aria-hidden="true">
          <span className="font-semibold tracking-tight">{time}</span>
          <span className="wx-island" />
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-4 rounded-[1px] border border-current opacity-80" />
            <span className="inline-block h-2 w-1.5 rounded-[1px] bg-current opacity-80" />
            <span className="inline-block h-3 w-[22px] rounded-sm border border-current p-px">
              <span className="block h-full w-[70%] rounded-[1px] bg-current" />
            </span>
          </span>
        </div>
        <header className="wx-nav">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {showBack ? (
              <button
                type="button"
                aria-label="返回"
                onClick={onBack}
                className="grid size-9 place-items-center rounded-full text-foreground"
              >
                <ArrowLeft className="size-5" />
              </button>
            ) : (
              <span className="w-9" />
            )}
            <h1 className="truncate pr-16 text-center text-[17px] font-semibold leading-none">
              {title}
            </h1>
          </div>
          <div className="wx-capsule" role="group" aria-label="微信小程序胶囊">
            <button
              type="button"
              aria-label="更多"
              onClick={() => setMenuOpen(true)}
              className="grid h-full w-11 place-items-center"
            >
              <Ellipsis className="size-4" />
            </button>
            <span className="h-4 w-px bg-black/20" />
            <button
              type="button"
              aria-label="关闭小程序"
              className="grid h-full w-11 place-items-center text-lg leading-none"
              title="网页预览中关闭无效"
            >
              ●
            </button>
          </div>
        </header>
        <div className="wx-body">{children}</div>
        {tabBar}
        <div className="wx-home-indicator" aria-hidden="true" />
        {menuOpen && (
          <div
            className="absolute inset-0 z-50 bg-ink/50"
            role="dialog"
            aria-modal="true"
            aria-label="小程序菜单"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="absolute inset-x-0 top-[84px] mx-3 overflow-hidden rounded-2xl bg-paper shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="border-b border-border px-4 py-3 text-xs text-muted-foreground">
                杜伦大学招生小程序
              </p>
              <MenuRow
                icon={<LayoutGrid className="size-4" />}
                label="页面总览 / 可视化 Demo"
                onClick={() => {
                  setMenuOpen(false);
                  onOverview();
                }}
              />
              <MenuRow
                icon={<Share2 className="size-4" />}
                label="分享给好友"
                onClick={() => {
                  setMenuOpen(false);
                  onShare();
                }}
              />
              <MenuRow
                icon={<RotateCcw className="size-4" />}
                label="重新进入小程序"
                onClick={() => {
                  setMenuOpen(false);
                  onRelaunch();
                }}
              />
              <MenuRow
                icon={<Shield className="size-4" />}
                label="用户隐私保护指引"
                onClick={() => {
                  setMenuOpen(false);
                  onPrivacy();
                }}
              />
              <MenuRow
                icon={<Smartphone className="size-4" />}
                label="微信部署清单"
                onClick={() => {
                  setMenuOpen(false);
                  onDeploy();
                }}
              />
              <Button
                variant="ghost"
                className="h-12 w-full rounded-none text-muted-foreground"
                onClick={() => setMenuOpen(false)}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center gap-3 border-b border-border px-4 text-left text-sm"
    >
      <span className="text-primary">{icon}</span>
      {label}
    </button>
  );
}
