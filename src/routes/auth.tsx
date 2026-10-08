import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast, Toaster } from "sonner";
import campusHero from "@/assets/campus-hero.jpg";
import logoDark from "@/assets/durham-logo-dark.svg.asset.json";
import logoWhite from "@/assets/durham-logo-white.svg.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "管理后台登录｜杜伦大学招生小程序" },
    { name: "description", content: "杜伦大学招生小程序内容管理后台的登录与注册入口。" },
    { property: "og:title", content: "管理后台登录｜杜伦大学招生小程序" },
    { property: "og:description", content: "杜伦大学招生小程序内容管理后台的登录与注册入口。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AuthPage,
});

const field = "h-12 w-full rounded-md border border-input bg-paper pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/admin", replace: true }); });
  }, [navigate]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(error.message.includes("confirm") ? "邮箱尚未验证，请先点击邮件中的确认链接" : "邮箱或密码不正确"); return; }
      navigate({ to: "/admin", replace: true });
      return;
    }
    const name = String(f.get("name")).trim();
    if (password !== String(f.get("confirm"))) { setBusy(false); toast.error("两次输入的密码不一致"); return; }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth`, data: { display_name: name } } });
    setBusy(false);
    if (error) { toast.error(error.message.includes("registered") ? "该邮箱已注册，请直接登录" : error.message.includes("Password") ? "密码强度不足，请换一个更复杂的密码" : "注册失败，请稍后重试"); return; }
    if (data.session) { navigate({ to: "/admin", replace: true }); return; }
    setSent(email);
  };

  return <div className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_1fr]">
    <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block">
      <img src={campusHero} alt="杜伦大学校园" className="absolute inset-0 size-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--primary)_10%,transparent_90%)]" />
      <div className="relative flex h-full flex-col justify-between p-12">
        <img src={logoWhite.url} alt="Durham University" className="h-12 w-auto max-w-[240px] object-contain object-left" />
        <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Admissions console</p><h1 className="mt-4 font-display text-5xl font-bold leading-tight">招生小程序<br />内容管理后台</h1><p className="mt-5 max-w-md text-sm leading-7 text-primary-foreground/80">维护留学项目、校园图集、学生访谈与联系方式，查看意向线索与到校预约。</p></div>
        <p className="text-[11px] text-primary-foreground/60">仅限经批准的招生管理人员使用</p>
      </div>
    </aside>
    <main className="flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="size-3.5" />返回小程序</Link>
        <img src={logoDark.url} alt="Durham University" className="mt-8 h-11 w-auto max-w-[220px] object-contain object-left lg:hidden" />
        {sent ? <div className="mt-10 rounded-md border border-border bg-paper p-6 shadow-sm">
          <Mail className="size-7 text-primary" />
          <h2 className="mt-4 font-display text-2xl font-bold">请查收验证邮件</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">我们已向 <strong className="text-foreground">{sent}</strong> 发送确认链接。验证邮箱后即可登录；新账号需由现有管理员审核通过后才能管理内容。</p>
          <Button variant="outline" className="mt-6 w-full" onClick={() => { setSent(null); setMode("login"); }}>返回登录</Button>
        </div> : <>
          <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{mode === "login" ? "Sign in" : "Create account"}</p>
          <h2 className="mt-2 font-display text-3xl font-bold">{mode === "login" ? "登录管理后台" : "注册管理账号"}</h2>
          <div className="mt-6 grid grid-cols-2 rounded-md border border-border bg-muted p-1">
            {(["login", "register"] as const).map((m) => <button key={m} type="button" onClick={() => setMode(m)} className={cn("h-9 rounded-sm text-sm font-semibold transition", mode === m ? "bg-paper text-primary shadow-sm" : "text-muted-foreground")}>{m === "login" ? "登录" : "注册"}</button>)}
          </div>
          <form key={mode} onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && <Input icon={<UserRound />} name="name" placeholder="姓名" autoComplete="name" required minLength={2} maxLength={30} />}
            <Input icon={<Mail />} name="email" type="email" placeholder="工作邮箱" autoComplete="email" required maxLength={120} />
            <Input icon={<LockKeyhole />} name="password" type="password" placeholder={mode === "register" ? "设置密码（至少 8 位）" : "密码"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : 1} maxLength={72} />
            {mode === "register" && <Input icon={<LockKeyhole />} name="confirm" type="password" placeholder="再次输入密码" autoComplete="new-password" required minLength={8} maxLength={72} />}
            <Button className="h-12 w-full" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />}{mode === "login" ? "登录" : "注册账号"}</Button>
          </form>
          {mode === "register" && <p className="mt-4 text-xs leading-5 text-muted-foreground">注册后需验证邮箱，并由现有管理员在「账号审核」中批准，方可进入后台。</p>}
        </>}
      </div>
    </main>
    <Toaster position="top-center" richColors />
  </div>;
}

function Input({ icon, ...rest }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="relative block"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">{icon}</span><input {...rest} className={field} /></label>;
}
