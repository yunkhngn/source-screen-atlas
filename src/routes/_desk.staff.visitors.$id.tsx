import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, PenLine } from "lucide-react";
import { useApp } from "@/lib/store";
import { fmtDateTime, fmtDuration } from "@/lib/rules";
import type { Session } from "@/lib/mock";
import { Badge, Card, Empty, PageHeader, Table, Td } from "@/components/kit";
import { MethodBadge, SessionDrawer } from "@/components/staff";

export const Route = createFileRoute("/_desk/staff/visitors/$id")({
  head: () => ({ meta: [{ title: "Chi tiết khách ngoài" }, { name: "description", content: "Thông tin và lịch sử ra vào của khách." }, { property: "og:title", content: "Chi tiết khách" }, { property: "og:description", content: "Lịch sử ra vào của khách ngoài." }] }),
  component: VisitorDetail,
});

function VisitorDetail() {
  const { id } = Route.useParams();
  const v = useApp((s) => s.visitors.find((x) => x.id === id));
  const all = useApp((s) => s.sessions);
  const [detail, setDetail] = useState<Session | null>(null);
  if (!v) return <Empty title="Không tìm thấy khách" desc="Khách này không tồn tại." action={<Link to="/staff/visitors" className="text-sm underline">Về danh sách</Link>} />;
  const hist = all.filter((s) => s.subjectId === id);
  const inside = hist.some((s) => !s.exitAt);
  return (
    <>
      <Link to="/staff/visitors" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Khách ngoài</Link>
      <PageHeader title={v.name} actions={<Link to="/staff/manual-access" search={{ visitor: v.id }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"><PenLine className="size-4" /> Ghi nhận {inside ? "ra" : "vào"}</Link>} />
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit space-y-4 p-5 text-sm">
          <div><div className="text-muted-foreground">Mã tham chiếu</div><div className="font-medium">{v.ref}</div></div>
          <div><div className="text-muted-foreground">Ngày tạo</div><div>{fmtDateTime(v.createdAt)}</div></div>
          <div><div className="text-muted-foreground">Hiện tại</div>{inside ? <Badge tone="success">Đang trong thư viện</Badge> : <Badge>Ở ngoài</Badge>}</div>
          <p className="text-xs text-muted-foreground">Thông tin khách chỉ để xem, không thể chỉnh sửa hoặc xóa.</p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 font-semibold">Lịch sử ra vào</div>
          {hist.length === 0 ? <Empty title="Chưa có lượt ra vào" /> : (
            <Table head={["Giờ vào", "Giờ ra", "Thời lượng", "Phương thức"]}>
              {hist.map((s) => (
                <tr key={s.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => setDetail(s)}>
                  <Td>{fmtDateTime(s.entryAt)}</Td>
                  <Td>{s.exitAt ? fmtDateTime(s.exitAt) : <Badge tone="success">Đang ở</Badge>}</Td>
                  <Td>{fmtDuration((s.exitAt ?? Date.now()) - s.entryAt)}</Td>
                  <Td><MethodBadge m={s.entryMethod} /></Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
      <SessionDrawer session={detail} onClose={() => setDetail(null)} />
    </>
  );
}
