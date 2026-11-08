import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, History } from "lucide-react";
import { useApp, useMe } from "@/lib/store";
import { fmtDate, fmtDuration, fmtTime } from "@/lib/rules";
import { Badge, Btn, Empty, Segmented } from "@/components/kit";
import { MethodBadge } from "@/components/staff";
import { MHeader } from "@/components/mobile";

export const Route = createFileRoute("/student/history/")({
  head: () => ({ meta: [{ title: "Lịch sử — Sinh viên" }, { name: "description", content: "Lịch sử ra vào thư viện của bạn." }, { property: "og:title", content: "Lịch sử ra vào" }, { property: "og:description", content: "Các lượt ra vào gần đây." }] }),
  component: StuHistory,
});

function StuHistory() {
  const me = useMe()!;
  const all = useApp((s) => s.sessions).filter((x) => x.subjectId === me.id);
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const [shown, setShown] = useState(6);
  const list = all.filter((s) => s.entryAt >= Date.now() - Number(range) * 86400000);
  return (
    <>
      <MHeader title="Lịch sử ra vào" />
      <div className="px-5">
        <Segmented value={range} onChange={(v) => { setRange(v); setShown(6); }} options={[{ value: "7", label: "7 ngày" }, { value: "30", label: "30 ngày" }, { value: "90", label: "90 ngày" }]} />
        {list.length === 0 ? <Empty icon={<History className="size-6" />} title="Chưa có lượt ra vào" desc="Không có lượt nào trong khoảng thời gian này." /> : (
          <div className="mt-4 space-y-2.5">
            {list.slice(0, shown).map((s) => (
              <Link key={s.id} to="/student/history/$sessionId" params={{ sessionId: s.id }} className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-soft transition hover:shadow-pop">
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${s.exitAt ? "bg-secondary text-muted-foreground" : "bg-accent text-accent-foreground"}`}>
                  {s.exitAt ? <LogOut className="size-5" /> : <LogIn className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{fmtDate(s.entryAt)}</span>
                    {s.exitAt ? <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{fmtDuration(s.exitAt - s.entryAt)}</span> : <Badge tone="success">Đang mở</Badge>}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground tabular">{fmtTime(s.entryAt)} → {s.exitAt ? fmtTime(s.exitAt) : "…"} · <MethodBadge m={s.entryMethod} /></span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
            {shown < list.length && <Btn variant="outline" className="w-full" onClick={() => setShown(shown + 6)}>Xem thêm</Btn>}
          </div>
        )}
      </div>
    </>
  );
}
