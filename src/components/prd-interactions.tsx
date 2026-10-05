import { useState } from "react";

import { Button } from "@/components/ui/button";
import { trackDemo } from "@/lib/demo-events";

export function PhoneField({ name, className }: { name: string; className: string }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <input
        name={name}
        required
        pattern="1[3-9][0-9]{9}"
        inputMode="tel"
        className={className}
        placeholder="11 位手机号，或使用下方授权"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)}>
        微信授权手机号
      </Button>
      {open && (
        <div
          className="absolute inset-0 z-50 grid place-items-end bg-ink/70"
          role="dialog"
          aria-modal="true"
          aria-label="手机号授权"
        >
          <div className="w-full rounded-t-md bg-paper p-5">
            <h3 className="text-lg font-bold">申请使用你的手机号</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              用于招生回访。授权前请阅读隐私保护指引。网页 Demo 会填入演示号码，正式环境改为微信
              getPhoneNumber。
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                拒绝
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setValue("13800138000");
                  trackDemo("phone_auth", "demo");
                  setOpen(false);
                }}
              >
                同意授权
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SubscribeSheet({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-50 grid place-items-end bg-ink/70"
      role="dialog"
      aria-modal="true"
      aria-label="订阅消息"
    >
      <div className="w-full rounded-t-md bg-paper p-5">
        <p className="text-xs font-bold uppercase text-primary">Subscribe message</p>
        <h3 className="mt-2 text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          正式小程序将调用微信订阅消息，用于提交反馈、到访前一天提醒和活动通知。当前为可点击的授权演示。
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              trackDemo("subscribe_prompt", "deny");
              onClose();
            }}
          >
            暂不
          </Button>
          <Button
            type="button"
            onClick={() => {
              trackDemo("subscribe_prompt", "allow");
              onClose();
            }}
          >
            允许提醒
          </Button>
        </div>
      </div>
    </div>
  );
}
