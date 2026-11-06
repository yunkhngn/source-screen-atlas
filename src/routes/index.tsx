import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MonitorSmartphone, ShieldCheck, Smartphone, BookUser, Palette, ArrowRight, KeyRound } from "lucide-react";
import { useApp } from "@/lib/store";
import { Deco, Logo } from "@/components/kit";
import type { Role } from "@/lib/rules";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cổng demo — Cổng Thư Viện" },
      { name: "description", content: "Chọn một trong bốn trải nghiệm: Quản trị viên, Thủ thư, Kiosk tự phục vụ và Sinh viên." },
      { property: "og:title", content: "Cổng demo — Cổng Thư Viện" },
      { property: "og:description", content: "Bản mẫu tương tác hệ thống quản lý ra vào thư viện." },
    ],
  }),
  component: DemoGate,
});

const cards = [
  { role: "ADMIN" as Role, title: "Quản trị viên", desc: "Tài khoản, kiosk, phân ca, thống kê và cấu hình.", icon: ShieldCheck, bg: "bg-yellow", size: "Máy tính · 1440" },
  { role: "LIBRARIAN" as Role, title: "Thủ thư", desc: "Theo dõi số người, ghi nhận thủ công, khách ngoài.", icon: BookUser, bg: "bg-mint", size: "Máy tính · 1440" },
  { role: "STUDENT" as Role, title: "Sinh viên", desc: "Mã QR cá nhân, lịch sử, đăng ký khuôn mặt.", icon: Smartphone, bg: "bg-pink", size: "Điện thoại · 390" },
];

function DemoGate() {
  const demoLogin = useApp((s) => s.demoLogin);
  const navigate = useNavigate();
  const go = (r: Role, must?: boolean) => {
    demoLogin(r, must);
    navigate({ to: must ? "/first-password-change" : r === "ADMIN" ? "/admin/overview" : r === "LIBRARIAN" ? "/librarian/overview" : "/student/home" });
  };
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Deco />
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <Logo />
        <h1 className="mt-10 max-w-2xl text-4xl font-semibold leading-tight tracking-tight">Bản mẫu giao diện hệ thống ra vào thư viện</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Cổng này chỉ dành cho người duyệt thiết kế. Chọn một trải nghiệm để khám phá — mọi dữ liệu đều là dữ liệu mô phỏng.</p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {cards.map((c) => (
            <button key={c.role} onClick={() => go(c.role)} className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-pop">
              <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${c.bg}`}><c.icon className="size-5" /></span>
              <span className="flex-1">
                <span className="flex items-center justify-between font-semibold">{c.title}<ArrowRight className="size-4 opacity-0 transition group-hover:opacity-100" /></span>
                <span className="mt-1 block text-sm text-muted-foreground">{c.desc}</span>
                <span className="mt-3 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs">{c.size}</span>
              </span>
            </button>
          ))}
          <Link to="/kiosk" className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-pop">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky"><MonitorSmartphone className="size-5" /></span>
            <span className="flex-1">
              <span className="font-semibold">Kiosk tự phục vụ</span>
              <span className="mt-1 block text-sm text-muted-foreground">Nhận diện khuôn mặt, quét QR dự phòng, cài đặt thiết bị.</span>
              <span className="mt-3 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs">Màn cảm ứng · 1280 × 800</span>
            </span>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link to="/login" className="rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground">Màn hình đăng nhập</Link>
          <button onClick={() => go("LIBRARIAN", true)} className="flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5"><KeyRound className="size-4" /> Đổi mật khẩu lần đầu</button>
          <Link to="/session" search={{ kind: "expired" }} className="rounded-xl border border-input bg-card px-4 py-2.5">Hết phiên đăng nhập</Link>
          <Link to="/design-system" className="flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5"><Palette className="size-4" /> Hệ thống thiết kế</Link>
        </div>
      </div>
    </div>
  );
}
