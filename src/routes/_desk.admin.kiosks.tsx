import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Copy, ShieldOff, RefreshCw, Camera, CameraOff } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { fmtDateTime } from "@/lib/rules";
import { MODE_LABEL, type Kiosk } from "@/lib/mock";
import { Badge, Btn, Card, Confirm, Field, Input, Modal, Notice, PageHeader, Select, Table, Td } from "@/components/kit";

export const Route = createFileRoute("/_desk/admin/kiosks")({
  head: () => ({ meta: [{ title: "Thiết bị Kiosk — Quản trị" }, { name: "description", content: "Quản lý thiết bị kiosk nhận diện." }, { property: "og:title", content: "Thiết bị Kiosk" }, { property: "og:description", content: "Tạo, sửa, thu hồi kiosk." }] }),
  component: Kiosks,
});

const genSecret = () => Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);

function Conn({ k }: { k: Kiosk }) {
  if (k.status === "REVOKED") return <span className="text-muted-foreground">—</span>;
  const age = Date.now() - k.lastSeen;
  return age < 120_000 ? <Badge tone="success">Có tín hiệu gần đây</Badge> : <Badge tone="warning">Không có tín hiệu</Badge>;
}

function Kiosks() {
  const { kiosks, upsertKiosk } = useApp();
  const [create, setCreate] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", mode: "AUTO" as Kiosk["mode"] });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [cred, setCred] = useState<{ id: string; secret: string } | null>(null);
  const [detail, setDetail] = useState<Kiosk | null>(null);
  const [revoke, setRevoke] = useState(false);
  const [rotate, setRotate] = useState(false);

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = "Vui lòng nhập mã thiết bị.";
    else if (kiosks.some((k) => k.code.toLowerCase() === form.code.toLowerCase())) e.code = "Mã thiết bị đã tồn tại.";
    if (!form.name.trim()) e.name = "Vui lòng nhập tên.";
    setErrs(e);
    if (Object.keys(e).length) return;
    upsertKiosk({ id: `k-${Date.now()}`, code: form.code.toUpperCase(), name: form.name, mode: form.mode, status: "ACTIVE", lastSeen: 0, camera: "OK", version: "—" });
    setCreate(false);
    setCred({ id: form.code.toUpperCase(), secret: genSecret() });
    setForm({ code: "", name: "", mode: "AUTO" });
  };

  return (
    <>
      <PageHeader title="Thiết bị Kiosk" crumbs={["Quản trị", "Thiết bị Kiosk"]} actions={<Btn onClick={() => setCreate(true)}><Plus className="size-4" /> Thêm kiosk</Btn>} />
      <Card className="p-5">
        <Table head={["Mã", "Tên", "Chế độ", "Trạng thái", "Kết nối", "Lần cuối báo hiệu", "Camera", "Phiên bản"]}>
          {kiosks.map((k) => (
            <tr key={k.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => setDetail(k)}>
              <Td className="font-medium">{k.code}</Td>
              <Td>{k.name}</Td>
              <Td>{MODE_LABEL[k.mode]}</Td>
              <Td>{k.status === "ACTIVE" ? <Badge tone="success">Đang hoạt động</Badge> : <Badge tone="danger">Đã thu hồi</Badge>}</Td>
              <Td><Conn k={k} /></Td>
              <Td className="text-muted-foreground">{k.lastSeen ? fmtDateTime(k.lastSeen) : "Chưa kết nối"}</Td>
              <Td>{k.camera === "OK" ? <span className="inline-flex items-center gap-1 text-success"><Camera className="size-4" /> Hoạt động</span> : <span className="inline-flex items-center gap-1 text-destructive"><CameraOff className="size-4" /> Không khả dụng</span>}</Td>
              <Td className="text-muted-foreground">{k.version}</Td>
            </tr>
          ))}
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">Trạng thái kết nối được suy ra từ lần báo hiệu cuối, không phải theo thời gian thực.</p>
      </Card>

      <Modal open={create} onOpenChange={setCreate} title="Thêm kiosk" footer={<><Btn variant="outline" onClick={() => setCreate(false)}>Hủy</Btn><Btn onClick={submit}>Tạo và cấp thông tin đăng nhập</Btn></>}>
        <Field label="Mã thiết bị" error={errs.code}><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: KIOSK-TẦNG-3" /></Field>
        <Field label="Tên hiển thị" error={errs.name}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Chế độ"><Select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as Kiosk["mode"] })}><option value="ENTRY">Chỉ vào</option><option value="EXIT">Chỉ ra</option><option value="AUTO">Tự động</option></Select></Field>
      </Modal>

      <Modal open={!!cred} onOpenChange={() => {}} title="Thông tin đăng nhập thiết bị" desc="Thông tin này chỉ hiển thị một lần. Hãy sao chép và lưu ở nơi an toàn trước khi đóng."
        footer={<Btn onClick={() => setCred(null)}>Tôi đã lưu, đóng lại</Btn>}>
        {cred && <>
          <Field label="Mã thiết bị"><Input readOnly value={cred.id} /></Field>
          <Field label="Mật khẩu thiết bị"><div className="flex gap-2"><Input readOnly value={cred.secret} className="font-mono" /><Btn variant="outline" onClick={() => { navigator.clipboard?.writeText(cred.secret); toast.success("Đã sao chép"); }}><Copy className="size-4" /> Sao chép</Btn></div></Field>
          <Notice tone="warning">Không thể xem lại mật khẩu này. Nếu bị mất, hãy cấp lại mật khẩu mới.</Notice>
        </>}
      </Modal>

      <Modal open={!!detail && !revoke && !rotate && !cred} onOpenChange={(o) => !o && setDetail(null)} title={detail?.name ?? ""} wide
        footer={detail && (detail.status === "ACTIVE" ? <>
          <Btn variant="outline" onClick={() => setRotate(true)}><RefreshCw className="size-4" /> Cấp lại mật khẩu</Btn>
          <Btn variant="danger" onClick={() => setRevoke(true)}><ShieldOff className="size-4" /> Thu hồi</Btn>
          <Btn onClick={() => { upsertKiosk(detail); toast.success("Đã lưu"); setDetail(null); }}>Lưu</Btn>
        </> : <Btn onClick={() => setRotate(true)}><RefreshCw className="size-4" /> Kích hoạt lại bằng mật khẩu mới</Btn>)}>
        {detail && <>
          {detail.status === "REVOKED" && <Notice tone="danger" title="Thiết bị đã bị thu hồi">Thiết bị không thể kết nối. Muốn dùng lại phải cấp mật khẩu mới.</Notice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tên hiển thị"><Input disabled={detail.status === "REVOKED"} value={detail.name} onChange={(e) => setDetail({ ...detail, name: e.target.value })} /></Field>
            <Field label="Chế độ"><Select disabled={detail.status === "REVOKED"} value={detail.mode} onChange={(e) => setDetail({ ...detail, mode: e.target.value as Kiosk["mode"] })}><option value="ENTRY">Chỉ vào</option><option value="EXIT">Chỉ ra</option><option value="AUTO">Tự động</option></Select></Field>
          </div>
          <dl className="grid grid-cols-3 gap-3 rounded-xl bg-secondary p-4 text-sm">
            <div><dt className="text-muted-foreground">Lần cuối báo hiệu</dt><dd>{detail.lastSeen ? fmtDateTime(detail.lastSeen) : "Chưa kết nối"}</dd></div>
            <div><dt className="text-muted-foreground">Camera</dt><dd>{detail.camera === "OK" ? "Hoạt động" : "Không khả dụng"}</dd></div>
            <div><dt className="text-muted-foreground">Phiên bản</dt><dd>{detail.version}</dd></div>
          </dl>
        </>}
      </Modal>

      <Confirm open={revoke} onOpenChange={setRevoke} danger title="Thu hồi thiết bị?" desc="Thiết bị sẽ bị ngắt quyền truy cập ngay lập tức và không thể ghi nhận ra vào." confirmLabel="Thu hồi"
        onConfirm={() => { upsertKiosk({ ...detail!, status: "REVOKED" }); toast.success("Đã thu hồi thiết bị"); setRevoke(false); setDetail(null); }} />
      <Confirm open={rotate} onOpenChange={setRotate} title="Cấp lại mật khẩu thiết bị?" desc="Mật khẩu cũ sẽ ngừng hoạt động. Thiết bị cần được cài đặt lại với mật khẩu mới." confirmLabel="Cấp lại"
        onConfirm={() => { upsertKiosk({ ...detail!, status: "ACTIVE" }); setRotate(false); setCred({ id: detail!.code, secret: genSecret() }); setDetail(null); }}>
        <p className="text-xs text-muted-foreground">Nếu mất kết nối khi đang cấp lại, hãy tải lại dữ liệu thiết bị rồi cấp lại một lần nữa.</p>
      </Confirm>
    </>
  );
}
