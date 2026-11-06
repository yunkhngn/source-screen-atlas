import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, LogOut, Timer, UserCog, CalendarRange, Settings2, MonitorSmartphone } from "lucide-react";
import { useApp } from "@/lib/store";
import { fmtDuration } from "@/lib/rules";
import { Badge, Card, PageHeader, Stat } from "@/components/kit";
import { OccupancyCard, OccupantsPreview } from "@/components/staff";

export const Route = createFileRoute("/_desk/admin/overview")({
  head: () => ({ meta: [{ title: "Tổng quan — Quản trị viên" }, { name: "description", content: "Tổng quan vận hành thư viện." }, { property: "og:title", content: "Tổng quan quản trị" }, { property: "og:description", content: "Số người, lượt ra vào, kiosk." }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const { sessions, kiosks } = useApp();
  const from = Date.now() - 7 * 86400000;
  const period = sessions.filter((s) => s.entryAt >= from);
  const closed = period.filter((s) => s.exitAt);
  const avg = closed.length ? closed.reduce((a, s) => a + (s.exitAt! - s.entryAt), 0) / closed.length : null;
  const active = kiosks.filter((k) => k.status === "ACTIVE");
  const online = active.filter((k) => Date.now() - k.lastSeen < 120_000).length;
  return (
    <>
      <PageHeader title="Tổng quan" sub="Số liệu lượt ra vào tính trong 7 ngày gần nhất" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><OccupancyCard /></div>
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 font-semibold"><MonitorSmartphone className="size-4" /> Kiosk</div><Link to="/admin/kiosks" className="text-sm text-muted-foreground hover:text-foreground">Quản lý →</Link></div>
          <div className="text-3xl font-semibold">{online}<span className="text-lg text-muted-foreground"> / {active.length}</span></div>
          <div className="text-xs text-muted-foreground">thiết bị báo hiệu trong 2 phút gần nhất</div>
          <ul className="mt-4 space-y-2 text-sm">
            {kiosks.map((k) => <li key={k.id} className="flex items-center justify-between"><span>{k.name}</span>{k.status === "REVOKED" ? <Badge>Đã thu hồi</Badge> : Date.now() - k.lastSeen < 120_000 ? <Badge tone="success">Trực tuyến</Badge> : <Badge tone="warning">Mất tín hiệu</Badge>}</li>)}
          </ul>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Stat label="Tổng lượt vào (7 ngày)" value={period.length} icon={<LogIn className="size-4" />} color="yellow" />
        <Stat label="Tổng lượt ra (7 ngày)" value={closed.length} icon={<LogOut className="size-4" />} color="sky" />
        <Stat label="Thời gian ở trung bình" value={avg ? fmtDuration(avg) : "Chưa có dữ liệu"} icon={<Timer className="size-4" />} color="pink" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="grid content-start gap-3 lg:col-span-1">
          {[{ to: "/admin/accounts", l: "Tài khoản", i: UserCog }, { to: "/admin/shifts", l: "Phân ca nhân viên", i: CalendarRange }, { to: "/admin/config", l: "Cấu hình hệ thống", i: Settings2 }].map((x) => (
            <Link key={x.to} to={x.to} className="flex items-center gap-3 rounded-3xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-pop"><span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground"><x.i className="size-4" /></span><span className="font-medium">{x.l}</span></Link>
          ))}
        </div>
        <div className="lg:col-span-2"><OccupantsPreview /></div>
      </div>
    </>
  );
}
