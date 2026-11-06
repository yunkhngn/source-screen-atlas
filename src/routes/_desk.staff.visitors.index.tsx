import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { fmtDateTime } from "@/lib/rules";
import { Badge, Btn, Card, Empty, Field, Input, Modal, PageHeader, Pager, Table, Td } from "@/components/kit";

export const Route = createFileRoute("/_desk/staff/visitors/")({
  head: () => ({ meta: [{ title: "Khách ngoài" }, { name: "description", content: "Danh bạ khách ngoài của thư viện." }, { property: "og:title", content: "Khách ngoài" }, { property: "og:description", content: "Đăng ký và tra cứu khách ngoài." }] }),
  component: Visitors,
});

function Visitors() {
  const { visitors, sessions, addVisitor } = useApp();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [ref, setRef] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const list = visitors.filter((v) => v.name.toLowerCase().includes(q.toLowerCase()) || v.ref.toLowerCase().includes(q.toLowerCase()));
  const save = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Vui lòng nhập họ tên.";
    if (!ref.trim()) e.ref = "Vui lòng nhập mã tham chiếu (CCCD, thẻ, giấy giới thiệu…).";
    setErr(e);
    if (Object.keys(e).length) return;
    addVisitor(name.trim(), ref.trim());
    toast.success("Đã đăng ký khách");
    setOpen(false); setName(""); setRef("");
  };
  return (
    <>
      <PageHeader title="Khách ngoài" crumbs={["Vận hành", "Khách ngoài"]} actions={<Btn onClick={() => setOpen(true)}><Plus className="size-4" /> Đăng ký khách</Btn>} />
      <Card>
        <div className="p-5"><div className="relative w-80"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên hoặc mã tham chiếu" className="pl-9" /></div></div>
        {list.length === 0 ? <Empty icon={<UserRoundPlus className="size-6" />} title="Chưa có khách phù hợp" /> : (
          <div className="px-5">
            <Table head={["Họ và tên", "Mã tham chiếu", "Ngày tạo", "Trạng thái"]}>
              {list.slice((page - 1) * 10, page * 10).map((v) => {
                const inside = sessions.some((s) => s.subjectId === v.id && !s.exitAt);
                return (
                  <tr key={v.id} className="hover:bg-secondary/40">
                    <Td className="font-medium"><Link to="/staff/visitors/$id" params={{ id: v.id }} className="hover:underline">{v.name}</Link></Td>
                    <Td className="text-muted-foreground">{v.ref}</Td>
                    <Td>{fmtDateTime(v.createdAt)}</Td>
                    <Td>{inside ? <Badge tone="success">Đang trong thư viện</Badge> : <Badge>Ở ngoài</Badge>}</Td>
                  </tr>
                );
              })}
            </Table>
          </div>
        )}
        <Pager page={page} total={list.length} perPage={10} onPage={setPage} />
      </Card>
      <Modal open={open} onOpenChange={setOpen} title="Đăng ký khách ngoài" desc="Khách ngoài không có tài khoản và không thể tự đăng nhập. Thông tin không chỉnh sửa được sau khi lưu." footer={<><Btn variant="outline" onClick={() => setOpen(false)}>Hủy</Btn><Btn onClick={save}>Lưu</Btn></>}>
        <Field label="Họ và tên" error={err.name}><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Mã tham chiếu" error={err.ref}><Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="VD: CCCD 079203004512" /></Field>
      </Modal>
    </>
  );
}
