import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QrCode, ScanFace, ChevronRight, LogIn } from "lucide-react";
import { useApp, useMe } from "@/lib/store";
import { fmtDateTime, fmtDuration, fmtTime } from "@/lib/rules";
import { Badge, Card } from "@/components/kit";
import { MethodBadge } from "@/components/staff";
import libraryInterior from "@/assets/library-interior.jpg";

export const Route = createFileRoute("/student/home")({
  head: () => ({ meta: [{ title: "Trang chủ — Sinh viên | Cổng Thư Viện" }, { name: "description", content: "Trạng thái ra vào thư viện của bạn." }, { property: "og:title", content: "Trang chủ sinh viên — Cổng Thư Viện" }, { property: "og:description", content: "Trạng thái và mã QR." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Home,
});

function Home() {
  const me = useMe()!;
  const sessions = useApp((s) => s.sessions).filter((x) => x.subjectId === me.id);
  const enr = useApp((s) => s.enrollment);
  const open = sessions.find((s) => !s.exitAt);
  const last = sessions[0];
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(i); }, []);
  return (
    <div className="px-5 pt-6">
      <div className="text-sm text-muted-foreground">Xin chào,</div>
      <h1 className="text-2xl font-semibold">{me.name}</h1>
      <img src={libraryInterior} alt="Không gian học tập và đọc sách tại thư viện" width={1536} height={1024} className="mt-5 aspect-[2/1] w-full rounded-2xl object-cover" />

      <div className={`relative mt-5 overflow-hidden rounded-xl p-5 ${open ? "bg-mint" : "bg-card border border-border"}`}>
        <div aria-hidden className="blob absolute -right-8 -top-10 size-32 bg-card/40" />
        <div className="relative">
          <Badge tone={open ? "success" : "neutral"}>{open ? "Đang trong thư viện" : "Đang ở ngoài thư viện"}</Badge>
          {open ? (
            <>
              <div className="mt-4 text-4xl font-semibold tracking-tight">{fmtDuration(Date.now() - open.entryAt)}</div>
              <div className="mt-1 text-sm">Vào lúc {fmtTime(open.entryAt)} · <MethodBadge m={open.entryMethod} /></div>
            </>
          ) : <div className="mt-4 text-sm text-muted-foreground">{last?.exitAt ? `Lần ra gần nhất: ${fmtDateTime(last.exitAt)}` : "Chưa có lượt ra vào."}</div>}
          <div className="mt-3 text-xs text-foreground/60">Cập nhật lúc {fmtTime(Date.now())}</div>
        </div>
      </div>

      <Link to="/student/qr" className="mt-4 flex items-center gap-4 rounded-xl bg-primary p-5 text-primary-foreground">
        <span className="grid size-12 place-items-center rounded-lg bg-yellow text-foreground"><QrCode className="size-6" /></span>
        <span className="flex-1"><span className="block font-semibold">Mở mã QR</span><span className="text-sm opacity-75">Dùng khi kiosk không nhận diện được</span></span>
        <ChevronRight className="size-5" />
      </Link>

      <Link to="/student/face" className="mt-3 block">
        <Card className="flex items-center gap-4 p-4">
          <span className="grid size-11 place-items-center rounded-lg bg-pink"><ScanFace className="size-5" /></span>
          <div className="flex-1"><div className="font-medium">Khuôn mặt</div><div className="text-sm text-muted-foreground">{enr.status === "ENROLLED" ? "Đã đăng ký" : enr.status === "CONSENT_REQUIRED" ? "Cần đồng ý chính sách mới" : "Chưa đăng ký"}</div></div>
          {enr.status === "ENROLLED" ? <Badge tone="success">Sẵn sàng</Badge> : <Badge tone="brand">Đăng ký</Badge>}
        </Card>
      </Link>

      <div className="mt-6 flex items-center justify-between"><h2 className="font-semibold">Gần đây</h2><Link to="/student/history" className="text-sm text-muted-foreground">Xem tất cả</Link></div>
      <div className="mt-2 space-y-2">
        {sessions.slice(0, 3).map((s) => (
          <Link key={s.id} to="/student/history/$sessionId" params={{ sessionId: s.id }} className="flex items-center gap-3 rounded-lg bg-card p-3.5 shadow-soft">
            <span className="grid size-9 place-items-center rounded-xl bg-sky-soft"><LogIn className="size-4" /></span>
            <div className="flex-1 text-sm"><div className="font-medium">{fmtDateTime(s.entryAt)}</div><div className="text-muted-foreground">{s.exitAt ? fmtDuration(s.exitAt - s.entryAt) : "Đang trong thư viện"}</div></div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
