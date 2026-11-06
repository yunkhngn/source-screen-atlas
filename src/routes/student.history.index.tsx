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
              <Link key={s.id} to="/student/history/$sessionId" params={{ sessionId: s.id }} className="block rounded-2xl bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between"><span className="font-semibold">{fmtDate(s.entryAt)}</span>{s.exitAt ? <span className="text-sm text-muted-foreground">{fmtDuration(s.exitAt - s.entryAt)}</span> : <Badge tone="success">Đang mở</Badge>}</div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span>{fmtTime(s.entryAt)} → {s.exitAt ? fmtTime(s.exitAt) : "…"}</span>
                  <span className="ml-auto flex gap-1"><MethodBadge m={s.entryMethod} />{s.exitMethod && <MethodBadge m={s.exitMethod} />}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
            {shown < list.length && <Btn variant="outline" className="w-full" onClick={() => setShown(shown + 6)}>Xem thêm</Btn>}
          </div>
        )}
      </div>
    </>
  );
}
