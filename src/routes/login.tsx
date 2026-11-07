import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, DEMO_PASSWORD } from "@/lib/store";
import { homeFor } from "@/lib/rules";
import { Btn, Field, Input, Logo, Notice, PasswordInput } from "@/components/kit";
import libraryInterior from "@/assets/library-interior.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — Cổng Thư Viện" },
      { name: "description", content: "Đăng nhập bằng mã tài khoản hoặc email." },
      { property: "og:title", content: "Đăng nhập — Cổng Thư Viện" },
      { property: "og:description", content: "Đăng nhập hệ thống quản lý ra vào thư viện." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const login = useApp((s) => s.login);
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fails, setFails] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !pw) return setErr("Vui lòng nhập mã tài khoản/email và mật khẩu.");
    if (fails >= 5) return setErr("Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ít phút.");
    setLoading(true);
    setErr(null);
    setTimeout(() => {
      setLoading(false);
      const r = login(id, pw);
      if (r === "INVALID") { setFails(fails + 1); return setErr("Mã tài khoản, email hoặc mật khẩu không đúng."); }
      if (r === "LOCKED") return setErr("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
      const me = useApp.getState().accounts.find((a) => a.id === useApp.getState().userId);
      if (!me) return;
      navigate({ to: me.mustChange ? "/first-password-change" : homeFor(me.role) });
    }, 700);
  };

  return (
    <div className="grid min-h-screen bg-background md:grid-cols-2">
      <section className="flex flex-col bg-card md:m-5 md:mr-0 md:overflow-hidden md:rounded-3xl">
        <div className="relative h-60 overflow-hidden md:min-h-96 md:flex-1">
          <img src={libraryInterior} alt="Không gian thư viện sáng thoáng với kệ sách, bàn học và sinh viên" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover object-center" fetchPriority="high" />
        </div>
        <div className="hidden space-y-3 p-7 md:block lg:p-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary"><span className="h-px w-8 bg-primary" />Không gian tri thức</div>
          <h2 className="max-w-md text-3xl font-semibold leading-snug">Mỗi lần ghé thăm,<br />một điều mới để khám phá.</h2>
          <div className="pt-2 text-xs text-muted-foreground">Cổng Thư Viện · Quản lý ra vào</div>
        </div>
      </section>
      <div className="flex items-center justify-center px-6 py-10 md:px-8 md:py-12 lg:px-16">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div className="pb-6"><Logo /></div>
          <div>
            <h1 className="text-2xl font-semibold">Đăng nhập</h1>
            <p className="mt-1 text-sm text-muted-foreground">Hệ thống quản lý ra vào thư viện</p>
          </div>
          {err && <Notice tone="danger">{err}</Notice>}
          <Field label="Mã tài khoản hoặc email"><Input value={id} onChange={(e) => setId(e.target.value)} placeholder="VD: SV2201234" autoComplete="username" /></Field>
          <Field label="Mật khẩu"><PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></Field>
          <Btn type="submit" size="lg" className="w-full" loading={loading}>Đăng nhập</Btn>
          <p className="text-center text-sm text-muted-foreground">Chưa có tài khoản hoặc quên mật khẩu? Vui lòng liên hệ quản trị viên.</p>
          <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
            Demo: <b>SV2201234</b>, <b>TT001</b> hoặc <b>QT001</b> · mật khẩu <b>{DEMO_PASSWORD}</b> · <b>TT004</b> là tài khoản bị khóa.
          </div>
        </form>
      </div>
    </div>
  );
}
