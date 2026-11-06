import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, LogOut, Users } from "lucide-react";
import { toast } from "sonner";
import { useApp, useMe, useOpenSessions } from "@/lib/store";
import { fmtDateTime, fmtDuration } from "@/lib/rules";
import type { Session } from "@/lib/mock";
import { Badge, Btn, Card, Confirm, Empty, Field, Input, PageHeader, Pager, Segmented, Table, Td, Textarea } from "@/components/kit";
import { MethodBadge, SessionDrawer } from "@/components/staff";

export const Route = createFileRoute("/_desk/staff/occupants")({
  head: () => ({ meta: [{ title: "Người đang trong thư viện" }, { name: "description", content: "Danh sách người đang có mặt trong thư viện." }, { property: "og:title", content: "Người đang trong thư viện" }, { property: "og:description", content: "Tìm kiếm và ghi nhận ra thủ công." }] }),
  component: Occupants,
});

function Occupants() {
  const open = useOpenSessions();
  const me = useMe()!;
  const recordExit = useApp((s) => s.recordExit);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"ALL" | "STUDENT" | "VISITOR">("ALL");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Session | null>(null);
  const [checkout, setCheckout] = useState<Session | null>(null);
  const [reason, setReason] = useState("");
  const list = open.filter((s) => (type === "ALL" || s.subjectType === type) && (s.name.toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase().includes(q.toLowerCase())));
  const rows = list.slice((page - 1) * 8, page * 8);

  return (
    <>
      <PageHeader title="Người đang trong thư viện" crumbs={["Vận hành", "Người đang trong thư viện"]} sub={`${open.length} người đang có mặt`} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="relative w-80"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Tìm theo tên hoặc mã" className="pl-9" /></div>
          <Segmented value={type} onChange={(v) => { setType(v); setPage(1); }} options={[{ value: "ALL", label: "Tất cả" }, { value: "STUDENT", label: "Sinh viên" }, { value: "VISITOR", label: "Khách ngoài" }]} />
        </div>
        {rows.length === 0 ? (
          <Empty icon={<Users className="size-6" />} title={q ? "Không tìm thấy kết quả" : "Thư viện đang trống"} desc={q ? "Thử từ khóa khác." : "Chưa có ai trong thư viện lúc này."} />
        ) : (
          <div className="px-5">
            <Table head={["Họ và tên", "Mã", "Đối tượng", "Giờ vào", "Phương thức", "Đã ở", ""]}>
              {rows.map((s) => (
                <tr key={s.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => setDetail(s)}>
                  <Td className="font-medium">{s.name}</Td>
                  <Td className="text-muted-foreground">{s.code}</Td>
                  <Td>{s.subjectType === "STUDENT" ? <Badge tone="info">Sinh viên</Badge> : <Badge tone="danger">Khách ngoài</Badge>}</Td>
                  <Td>{fmtDateTime(s.entryAt)}</Td>
                  <Td><MethodBadge m={s.entryMethod} /></Td>
                  <Td>{fmtDuration(Date.now() - s.entryAt)}</Td>
                  <Td className="text-right"><Btn size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setCheckout(s); setReason(""); }}><LogOut className="size-3.5" /> Ghi nhận ra</Btn></Td>
                </tr>
              ))}
            </Table>
          </div>
        )}
        <Pager page={page} total={list.length} perPage={8} onPage={setPage} />
      </Card>
      <SessionDrawer session={detail} onClose={() => setDetail(null)} />
      <Confirm
        open={!!checkout}
        onOpenChange={(o) => !o && setCheckout(null)}
        title="Ghi nhận ra thủ công"
        desc={checkout && <>Xác nhận <b>{checkout.name}</b> ({checkout.code}) đã rời thư viện.</>}
        confirmLabel="Ghi nhận ra"
        onConfirm={() => {
          if (!reason.trim()) return toast.error("Vui lòng nhập lý do.");
          const err = recordExit(checkout!.subjectId, "MANUAL", me.name, reason);
          if (err) toast.error(err); else toast.success(`Đã ghi nhận ra cho ${checkout!.name}`);
          setCheckout(null);
        }}
      >
        <Field label="Lý do (bắt buộc)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Sinh viên rời đi khi kiosk lối ra đang bảo trì" /></Field>
      </Confirm>
    </>
  );
}
