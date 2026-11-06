import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, History as HistoryIcon } from "lucide-react";
import { useApp } from "@/lib/store";
import { fmtDateTime, fmtDuration } from "@/lib/rules";
import type { Session } from "@/lib/mock";
import { Badge, Card, Empty, Input, PageHeader, Pager, Select, Table, Td } from "@/components/kit";
import { MethodBadge, SessionDrawer } from "@/components/staff";

export const Route = createFileRoute("/_desk/staff/history")({
  head: () => ({ meta: [{ title: "Lịch sử ra vào" }, { name: "description", content: "Tra cứu toàn bộ lượt ra vào thư viện." }, { property: "og:title", content: "Lịch sử ra vào" }, { property: "og:description", content: "Lọc theo ngày, đối tượng, phương thức." }] }),
  component: History,
});

const toInput = (d: number) => new Date(d - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function History() {
  const sessions = useApp((s) => s.sessions);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState(toInput(Date.now() - 30 * 86400000));
  const [to, setTo] = useState(toInput(Date.now()));
  const [type, setType] = useState("ALL");
  const [method, setMethod] = useState("ALL");
  const [state, setState] = useState("ALL");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Session | null>(null);
  const f = new Date(from).setHours(0, 0, 0, 0), t = new Date(to).setHours(23, 59, 59, 999);
  const list = sessions.filter((s) =>
    s.entryAt >= f && s.entryAt <= t &&
    (type === "ALL" || s.subjectType === type) &&
    (method === "ALL" || s.entryMethod === method || s.exitMethod === method) &&
    (state === "ALL" || (state === "OPEN" ? !s.exitAt : !!s.exitAt)) &&
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase().includes(q.toLowerCase())),
  );
  const reset = () => setPage(1);
  return (
    <>
      <PageHeader title="Lịch sử ra vào" crumbs={["Vận hành", "Lịch sử ra vào"]} />
      <Card>
        <div className="grid gap-3 p-5 md:grid-cols-6">
          <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="Tên hoặc mã" className="pl-9" /></div>
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); reset(); }} aria-label="Từ ngày" />
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); reset(); }} aria-label="Đến ngày" />
          <Select value={type} onChange={(e) => { setType(e.target.value); reset(); }}><option value="ALL">Mọi đối tượng</option><option value="STUDENT">Sinh viên</option><option value="VISITOR">Khách ngoài</option></Select>
          <div className="flex gap-3">
            <Select value={method} onChange={(e) => { setMethod(e.target.value); reset(); }}><option value="ALL">Mọi cách</option><option value="FACE">Khuôn mặt</option><option value="QR">Mã QR</option><option value="MANUAL">Thủ công</option><option value="AUTO">Tự động</option></Select>
            <Select value={state} onChange={(e) => { setState(e.target.value); reset(); }}><option value="ALL">Tất cả</option><option value="OPEN">Đang mở</option><option value="CLOSED">Đã đóng</option></Select>
          </div>
        </div>
        {list.length === 0 ? <Empty icon={<HistoryIcon className="size-6" />} title="Không có lượt nào" desc="Thử mở rộng khoảng ngày hoặc bỏ bớt bộ lọc." /> : (
          <div className="px-5">
            <Table head={["Họ và tên", "Mã", "Đối tượng", "Vào", "Ra", "Thời lượng", "Phương thức"]}>
              {list.slice((page - 1) * 10, page * 10).map((s) => (
                <tr key={s.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => setDetail(s)}>
                  <Td className="font-medium">{s.name}</Td>
                  <Td className="text-muted-foreground">{s.code}</Td>
                  <Td>{s.subjectType === "STUDENT" ? "Sinh viên" : "Khách ngoài"}</Td>
                  <Td>{fmtDateTime(s.entryAt)}</Td>
                  <Td>{s.exitAt ? fmtDateTime(s.exitAt) : <Badge tone="success">Đang mở</Badge>}</Td>
                  <Td>{fmtDuration((s.exitAt ?? Date.now()) - s.entryAt)}</Td>
                  <Td><MethodBadge m={s.entryMethod} /></Td>
                </tr>
              ))}
            </Table>
          </div>
        )}
        <Pager page={page} total={list.length} perPage={10} onPage={setPage} />
      </Card>
      <SessionDrawer session={detail} onClose={() => setDetail(null)} />
    </>
  );
}
