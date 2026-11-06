import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, useMe } from "@/lib/store";
import { fmtDateTime } from "@/lib/rules";
import type { Shift } from "@/lib/mock";
import { Badge, Card, Modal, Notice, PageHeader, Segmented, Table, Td } from "@/components/kit";
import { ShiftWeek, WeekNav, mondayOf, DAY } from "@/components/shift-week";

export const Route = createFileRoute("/_desk/librarian/shifts")({
  head: () => ({ meta: [{ title: "Ca trực của tôi" }, { name: "description", content: "Lịch ca trực được phân cho bạn." }, { property: "og:title", content: "Ca trực của tôi" }, { property: "og:description", content: "Xem ca trực theo tuần." }] }),
  component: MyShifts,
});

function MyShifts() {
  const me = useMe()!;
  const all = useApp((s) => s.shifts);
  const mine = all.filter((s) => s.staff.includes(me.id));
  const [week, setWeek] = useState(0);
  const [view, setView] = useState<"week" | "list">("week");
  const [pick, setPick] = useState<Shift | null>(null);
  const start = mondayOf(week);
  const inWeek = mine.filter((s) => s.start >= start && s.start < start + 7 * DAY).sort((a, b) => a.start - b.start);
  return (
    <>
      <PageHeader title="Ca trực của tôi" crumbs={["Cá nhân", "Ca trực"]} actions={<Segmented value={view} onChange={setView} options={[{ value: "week", label: "Tuần" }, { value: "list", label: "Danh sách" }]} />} />
      <Card className="p-5">
        <div className="mb-4"><WeekNav week={week} setWeek={setWeek} /></div>
        {view === "week" ? <ShiftWeek shifts={mine} week={week} onPick={setPick} /> : (
          <Table head={["Ca", "Bắt đầu", "Kết thúc", "Trạng thái"]}>
            {inWeek.map((s) => <tr key={s.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => setPick(s)}><Td className="font-medium">{s.name}</Td><Td>{fmtDateTime(s.start)}</Td><Td>{fmtDateTime(s.end)}</Td><Td>{s.status === "ACTIVE" ? <Badge tone="success">Đang hiệu lực</Badge> : <Badge tone="danger">Đã hủy</Badge>}</Td></tr>)}
          </Table>
        )}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">Lịch ca chỉ để tham khảo, không dùng để chấm công và không giới hạn quyền đăng nhập.</p>
      <Modal open={!!pick} onOpenChange={(o) => !o && setPick(null)} title={pick?.name ?? ""}>
        {pick && <>
          <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted-foreground">Bắt đầu</dt><dd>{fmtDateTime(pick.start)}</dd></div><div><dt className="text-muted-foreground">Kết thúc</dt><dd>{fmtDateTime(pick.end)}</dd></div></dl>
          {pick.status === "CANCELLED" && <Notice tone="warning" title="Ca đã bị hủy">{pick.cancelReason}</Notice>}
        </>}
      </Modal>
    </>
  );
}
