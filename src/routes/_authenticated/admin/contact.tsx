import { createFileRoute } from "@tanstack/react-router";
import { FormField, Loading, PageHeader, Panel, SaveButton, TextInput, useContentDraft } from "@/components/admin/kit";
import type { ContactContent } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin/contact")({ component: ContactAdmin });

const telOk = (v: string) => /^\+?[0-9]{5,20}$/.test(v);
const mailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function ContactAdmin() {
  const { draft, update, save, saving, dirty, loading } = useContentDraft("contact");
  if (loading || !draft) return <Loading />;
  const f = (k: keyof ContactContent, label: string, hint?: string) => <FormField label={label} hint={hint}><TextInput value={draft[k]} maxLength={200} onChange={(v) => update((o) => ({ ...o, [k]: v }))} /></FormField>;
  return <div className="space-y-6">
    <PageHeader eyebrow="Contact" title="联系方式" description="小程序「联系我们」页与 AI Hub 页展示的信息，电话可一键拨打，邮箱可一键发邮件。" actions={<SaveButton saving={saving} dirty={dirty} onClick={() => save((v) => (!telOk(v.phoneTel) || !telOk(v.aihubPhoneTel) ? "拨号号码只能包含数字和开头的 +" : !mailOk(v.email) || !mailOk(v.aihubEmail) ? "邮箱格式不正确" : null))} />} />
    <Panel title="学校联系方式"><div className="grid gap-4 sm:grid-cols-2">
      {f("address", "学校地址")}{f("mapUrl", "导航链接", "点击「导航」时打开的地图地址")}
      {f("phone", "咨询电话（显示文字）")}{f("phoneTel", "咨询电话（拨号号码）", "如 +441913342000")}
      {f("email", "咨询邮箱")}{f("hours", "工作时间")}{f("wechat", "微信客服说明")}
    </div></Panel>
    <Panel title="AI Hub 工作室"><div className="grid gap-4 sm:grid-cols-2">
      {f("aihubPhone", "联系电话（显示文字）")}{f("aihubPhoneTel", "联系电话（拨号号码）")}{f("aihubEmail", "联系邮箱")}
    </div></Panel>
  </div>;
}
