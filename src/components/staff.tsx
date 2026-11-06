import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Bot, UserRound, MonitorSmartphone } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useApp, useOpenSessions } from "@/lib/store";
import { METHOD_LABEL, type Session } from "@/lib/mock";
import { fmtDateTime, fmtDuration } from "@/lib/rules";
import { Badge, Card, Notice } from "@/components/kit";

export function OccupancyCard() {
  const open = useOpenSessions();
  const cap = useApp((s) => s.config.capacity);
  const warn = useApp((s) => s.config.warnPct);
  const pct = Math.round((open.length / cap) * 100);
  const near = pct >= warn;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-yellow p-6 shadow-soft">
      <div aria-hidden className="blob absolute -right-10 -top-12 size-44 bg-card/40" />
      <div className="relative">
        <div className="text-sm font-medium">Đang trong thư viện</div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-6xl font-semibold tracking-tight">{open.length}</span>
          <span className="mb-2 text-xl text-foreground/60">/ {cap} chỗ</span>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-card/60">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span>{pct}% sức chứa</span>
          {near ? <Badge tone="warning">Sắp đầy (ngưỡng {warn}%)</Badge> : <Badge tone="success">Còn chỗ</Badge>}
        </div>
      </div>
    </div>
  );
}

export function MethodBadge({ m }: { m: Session["entryMethod"] }) {
  const tone = m === "FACE" ? "success" : m === "QR" ? "info" : m === "AUTO" ? "neutral" : "brand";
  return <Badge tone={tone} dot={false}>{METHOD_LABEL[m]}</Badge>;
}

export function SessionDrawer({ session, onClose }: { session: Session | null; onClose: () => void }) {
  return (
    <Sheet open={!!session} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[440px] border-border bg-card sm:max-w-[440px]">
        {session && (
          <>
            <SheetHeader><SheetTitle>Chi tiết lượt ra vào</SheetTitle></SheetHeader>
            <div className="mt-6 space-y-6 px-4">
              <div>
                <div className="text-lg font-semibold">{session.name}</div>
                <div className="text-sm text-muted-foreground">{session.subjectType === "STUDENT" ? "Sinh viên" : "Khách ngoài"} · {session.code}</div>
                <div className="mt-2">{session.exitAt ? <Badge>Đã kết thúc · {fmtDuration(session.exitAt - session.entryAt)}</Badge> : <Badge tone="success">Đang trong thư viện</Badge>}</div>
              </div>
              <ol className="relative space-y-6 border-l-2 border-dashed border-border pl-6">
                <TimelineItem icon={<LogIn className="size-4" />} bg="bg-mint" title="Vào thư viện" time={fmtDateTime(session.entryAt)} method={session.entryMethod} actor={session.entryActor} />
                {session.exitAt ? (
                  <TimelineItem icon={session.exitMethod === "AUTO" ? <Bot className="size-4" /> : <LogOut className="size-4" />} bg="bg-pink" title="Ra khỏi thư viện" time={fmtDateTime(session.exitAt)} method={session.exitMethod!} actor={session.exitActor!} />
                ) : (
                  <li className="text-sm text-muted-foreground"><span className="absolute -left-[9px] size-4 rounded-full border-2 border-border bg-card" />Chưa ghi nhận ra</li>
                )}
              </ol>
              {session.reason && <Notice tone="info" title="Lý do ghi nhận thủ công">{session.reason}</Notice>}
              {session.autoClose && (
                <Notice tone="warning" title="Tự động kết thúc">
                  {session.autoClose === "CLOSING" ? "Lượt này được hệ thống tự kết thúc khi thư viện đóng cửa." : "Lượt này được hệ thống tự kết thúc do vượt thời gian ở tối đa."} Không có nhân viên thao tác.
                </Notice>
              )}
              <p className="text-xs text-muted-foreground">Lịch sử ra vào không thể chỉnh sửa.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function TimelineItem({ icon, bg, title, time, method, actor }: { icon: React.ReactNode; bg: string; title: string; time: string; method: Session["entryMethod"]; actor: string }) {
  return (
    <li className="relative">
      <span className={`absolute -left-[37px] grid size-7 place-items-center rounded-full ${bg}`}>{icon}</span>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{time}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <MethodBadge m={method} />
        <span className="inline-flex items-center gap-1 text-muted-foreground">{actor.startsWith("KIOSK") ? <MonitorSmartphone className="size-3.5" /> : <UserRound className="size-3.5" />}{actor}</span>
      </div>
    </li>
  );
}

export function OccupantsPreview() {
  const open = useOpenSessions().slice(0, 6);
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-semibold">Vào gần đây</div>
        <Link to="/staff/occupants" className="text-sm text-muted-foreground hover:text-foreground">Xem tất cả →</Link>
      </div>
      <ul className="divide-y divide-border">
        {open.map((s) => (
          <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
            <div><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.code}</div></div>
            <div className="text-right"><MethodBadge m={s.entryMethod} /><div className="mt-1 text-xs text-muted-foreground">{fmtDuration(Date.now() - s.entryAt)}</div></div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
