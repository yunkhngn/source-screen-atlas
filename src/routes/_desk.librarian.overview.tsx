import { createFileRoute, Link } from "@tanstack/react-router";
import { PenLine, UserRoundPlus, CalendarClock, LogIn, LogOut } from "lucide-react";
import { useApp, useMe } from "@/lib/store";
import { fmtDate, fmtTime } from "@/lib/rules";
import { Card, PageHeader, Stat } from "@/components/kit";
import { OccupancyCard, OccupantsPreview } from "@/components/staff";

export const Route = createFileRoute("/_desk/librarian/overview")({
  head: () => ({ meta: [{ title: "Tổng quan — Thủ thư" }, { name: "description", content: "Theo dõi số người trong thư viện theo thời gian thực." }, { property: "og:title", content: "Tổng quan thủ thư" }, { property: "og:description", content: "Số người hiện có và thao tác nhanh." }] }),
  component: LibOverview,
});

function LibOverview() {
  const me = useMe()!;
  const sessions = useApp((s) => s.sessions);
  const shifts = useApp((s) => s.shifts);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayEntries = sessions.filter((s) => s.entryAt >= today.getTime()).length;
  const todayExits = sessions.filter((s) => s.exitAt && s.exitAt >= today.getTime()).length;
  const next = shifts.filter((s) => s.staff.includes(me.id) && s.status === "ACTIVE" && s.end > Date.now()).sort((a, b) => a.start - b.start)[0];
  return (
    <>
      <PageHeader title={`Xin chào, ${me.name.split(" ").pop()}`} sub={`Hôm nay là ${fmtDate(Date.now())}`} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><OccupancyCard /></div>
        <div className="grid gap-3">
          <Link to="/staff/manual-access" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft hover:bg-secondary"><span className="grid size-10 place-items-center rounded-xl bg-mint"><PenLine className="size-4" /></span><div><div className="font-medium">Ghi nhận thủ công</div><div className="text-xs text-muted-foreground">Ghi vào/ra cho sinh viên hoặc khách</div></div></Link>
          <Link to="/staff/visitors" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft hover:bg-secondary"><span className="grid size-10 place-items-center rounded-xl bg-pink"><UserRoundPlus className="size-4" /></span><div><div className="font-medium">Đăng ký khách ngoài</div><div className="text-xs text-muted-foreground">Tạo hồ sơ khách mới</div></div></Link>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><CalendarClock className="size-4" /> Ca trực sắp tới</div>
            {next ? <div className="mt-2 text-sm"><div className="font-medium">{next.name}</div><div className="text-muted-foreground">{fmtTime(next.start)} – {fmtTime(next.end)} · {fmtDate(next.start)}</div></div> : <div className="mt-2 text-sm text-muted-foreground">Chưa có ca nào được phân.</div>}
          </Card>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Stat label="Lượt vào hôm nay" value={todayEntries} icon={<LogIn className="size-4" />} color="mint" />
        <Stat label="Lượt ra hôm nay" value={todayExits} icon={<LogOut className="size-4" />} color="sky" />
        <div className="lg:row-span-2"><OccupantsPreview /></div>
      </div>
    </>
  );
}
