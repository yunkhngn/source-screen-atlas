import { createFileRoute } from "@tanstack/react-router";
import { LogIn, LogOut, Bot } from "lucide-react";
import { useApp } from "@/lib/store";
import { fmtDateTime, fmtDuration } from "@/lib/rules";
import { Badge, Empty, Notice } from "@/components/kit";
import { MethodBadge } from "@/components/staff";
import { MHeader } from "@/components/mobile";

export const Route = createFileRoute("/student/history/$sessionId")({
  head: () => ({ meta: [{ title: "Chi tiết lượt — Sinh viên" }, { name: "description", content: "Chi tiết một lượt ra vào." }, { property: "og:title", content: "Chi tiết lượt ra vào" }, { property: "og:description", content: "Dòng thời gian vào và ra." }] }),
  component: Detail,
});

function Detail() {
  const { sessionId } = Route.useParams();
  const s = useApp((st) => st.sessions.find((x) => x.id === sessionId && x.subjectId === st.userId));
  if (!s) return <><MHeader title="Chi tiết" back="/student/history" /><Empty title="Không tìm thấy lượt này" /></>;
  return (
    <>
      <MHeader title="Chi tiết lượt" back="/student/history" />
      <div className="space-y-4 px-5">
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          {s.exitAt ? <Badge>Đã kết thúc</Badge> : <Badge tone="success">Đang trong thư viện</Badge>}
          <div className="mt-3 text-3xl font-semibold">{fmtDuration((s.exitAt ?? Date.now()) - s.entryAt)}</div>
        </div>
        <ol className="space-y-3">
          <li className="flex gap-3 rounded-2xl bg-card p-4 shadow-soft"><span className="grid size-10 place-items-center rounded-xl bg-mint"><LogIn className="size-4" /></span><div className="text-sm"><div className="font-medium">Vào thư viện</div><div className="text-muted-foreground">{fmtDateTime(s.entryAt)}</div><div className="mt-1.5 flex items-center gap-2"><MethodBadge m={s.entryMethod} /><span className="text-xs text-muted-foreground">{s.entryActor}</span></div></div></li>
          {s.exitAt ? (
            <li className="flex gap-3 rounded-2xl bg-card p-4 shadow-soft"><span className="grid size-10 place-items-center rounded-xl bg-pink">{s.autoClose ? <Bot className="size-4" /> : <LogOut className="size-4" />}</span><div className="text-sm"><div className="font-medium">Ra khỏi thư viện</div><div className="text-muted-foreground">{fmtDateTime(s.exitAt)}</div><div className="mt-1.5 flex items-center gap-2"><MethodBadge m={s.exitMethod!} />{!s.autoClose && <span className="text-xs text-muted-foreground">{s.exitActor}</span>}</div></div></li>
          ) : <li className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">Chưa ghi nhận ra. Hãy quét khuôn mặt hoặc mã QR tại kiosk khi rời thư viện.</li>}
        </ol>
        {s.autoClose && <Notice tone="warning" title="Tự động kết thúc">{s.autoClose === "CLOSING" ? "Thư viện đóng cửa nên lượt này được hệ thống tự kết thúc." : "Lượt này vượt thời gian ở tối đa nên được hệ thống tự kết thúc."}</Notice>}
      </div>
    </>
  );
}
