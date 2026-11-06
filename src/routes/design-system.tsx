import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge, Btn, Card, Confirm, Empty, Field, Input, Logo, Notice, Pager, PasswordInput, Segmented, Select, Stat, Table, Td } from "@/components/kit";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/design-system")({
  head: () => ({ meta: [{ title: "Hệ thống thiết kế — Cổng Thư Viện" }, { name: "description", content: "Màu sắc, chữ và thành phần giao diện dùng chung." }, { property: "og:title", content: "Hệ thống thiết kế" }, { property: "og:description", content: "Japanese Pastel SaaS." }] }),
  component: DS,
});

const colors = [["Than", "bg-primary", "#111111"], ["Trắng ấm", "bg-background", "#F7F3EF"], ["Trắng", "bg-card", "#FFFFFF"], ["Vàng pastel", "bg-yellow", "#FFE59A"], ["Hồng", "bg-pink", "#FFB5C1"], ["Bạc hà", "bg-mint", "#B7E1D1"], ["Xanh nhạt", "bg-sky", "#A9D3FF"]];

function DS() {
  const [seg, setSeg] = useState("a");
  const [page, setPage] = useState(1);
  const [dlg, setDlg] = useState(false);
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-8 py-10">
      <div className="flex items-center justify-between"><Logo /><Link to="/" className="text-sm text-muted-foreground">← Cổng demo</Link></div>
      <h1 className="text-3xl font-semibold">Hệ thống thiết kế</h1>
      <section><h2 className="mb-4 font-semibold">Màu sắc</h2><div className="grid grid-cols-7 gap-3">{colors.map(([n, c, h]) => <div key={n}><div className={`h-24 rounded-2xl border border-border ${c}`} /><div className="mt-2 text-sm font-medium">{n}</div><div className="text-xs text-muted-foreground">{h}</div></div>)}</div></section>
      <section><h2 className="mb-4 font-semibold">Chữ — Be Vietnam Pro</h2><Card className="space-y-2 p-6"><div className="text-4xl font-semibold">Tiêu đề lớn · Thư viện</div><div className="text-2xl font-semibold">Tiêu đề trang</div><div className="text-lg font-medium">Tiêu đề thẻ</div><div className="text-sm">Nội dung: Sinh viên quét khuôn mặt để ghi nhận ra vào.</div><div className="text-xs text-muted-foreground">Chú thích · 08:30 · 06/11/2026</div></Card></section>
      <section><h2 className="mb-4 font-semibold">Nút và nhãn</h2><div className="flex flex-wrap gap-3"><Btn>Chính</Btn><Btn variant="accent">Nhấn</Btn><Btn variant="outline">Viền</Btn><Btn variant="ghost">Nhẹ</Btn><Btn variant="danger">Nguy hiểm</Btn><Btn loading>Đang lưu</Btn><Btn disabled>Vô hiệu</Btn></div><div className="mt-4 flex flex-wrap gap-2"><Badge tone="success">Thành công</Badge><Badge tone="warning">Cảnh báo</Badge><Badge tone="danger">Lỗi</Badge><Badge tone="info">Thông tin</Badge><Badge tone="brand">Thương hiệu</Badge><Badge>Trung tính</Badge></div></section>
      <section className="grid gap-5 md:grid-cols-2"><Card className="space-y-4 p-6"><Field label="Ô nhập"><Input placeholder="Nhập nội dung" /></Field><Field label="Có lỗi" error="Trường này là bắt buộc."><Input /></Field><Field label="Mật khẩu"><PasswordInput /></Field><Field label="Chọn"><Select><option>Sinh viên</option></Select></Field><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Tìm kiếm" /></div><Segmented value={seg} onChange={setSeg} options={[{ value: "a", label: "Tuần" }, { value: "b", label: "Danh sách" }]} /></Card>
        <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><Stat label="Đang trong thư viện" value="23" color="yellow" /><Stat label="Lượt vào" value="148" color="mint" /></div><Notice tone="info">Thông báo thông tin.</Notice><Notice tone="warning">Cảnh báo sắp đầy.</Notice><Notice tone="success">Đã lưu thành công.</Notice><Notice tone="danger">Không thể kết nối.</Notice><div className="flex gap-2"><Btn variant="outline" onClick={() => setDlg(true)}>Mở hộp thoại</Btn><Btn variant="outline" onClick={() => toast.success("Đã ghi nhận vào")}>Hiện thông báo</Btn></div></div></section>
      <section className="grid gap-5 md:grid-cols-2"><Card><div className="p-5"><Table head={["Họ và tên", "Mã", "Trạng thái"]}><tr><Td>Nguyễn Minh Anh</Td><Td>SV2201234</Td><Td><Badge tone="success">Đang ở</Badge></Td></tr><tr><Td>Lê Ngọc Linh</Td><Td>TT001</Td><Td><Badge>Ở ngoài</Badge></Td></tr></Table></div><Pager page={page} total={42} perPage={10} onPage={setPage} /></Card><Card className="space-y-3 p-5"><div className="font-semibold">Đang tải</div><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /><Empty icon={<Users className="size-6" />} title="Danh sách trống" desc="Trạng thái rỗng" action={<Btn size="sm"><Plus className="size-4" /> Thêm</Btn>} /></Card></section>
      <Confirm open={dlg} onOpenChange={setDlg} title="Xác nhận thao tác" desc="Đây là hộp thoại xác nhận mẫu." confirmLabel="Đồng ý" onConfirm={() => setDlg(false)} />
    </div>
  );
}
