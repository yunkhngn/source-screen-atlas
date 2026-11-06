import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Users, ScanFace, Save } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import type { Config } from "@/lib/mock";
import { Btn, Card, Confirm, Field, Input, Notice, PageHeader } from "@/components/kit";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_desk/admin/config")({
  head: () => ({ meta: [{ title: "Cấu hình hệ thống — Quản trị" }, { name: "description", content: "Giờ mở cửa, sức chứa và cấu hình nhận diện." }, { property: "og:title", content: "Cấu hình hệ thống" }, { property: "og:description", content: "Thiết lập vận hành thư viện." }] }),
  component: ConfigPage,
});

function ConfigPage() {
  const saved = useApp((s) => s.config);
  const setConfig = useApp((s) => s.setConfig);
  const [c, setC] = useState<Config>(saved);
  const [confirm, setConfirm] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(c) !== JSON.stringify(saved);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!(c.capacity >= 1)) e.capacity = "Sức chứa phải lớn hơn 0.";
    if (!(c.warnPct >= 1 && c.warnPct <= 100)) e.warnPct = "Từ 1 đến 100%.";
    if (c.maxStayHours !== null && !(c.maxStayHours > 0 && c.maxStayHours <= 24)) e.maxStay = "Từ 1 đến 24 giờ, hoặc để trống.";
    if (!(c.cooldownSec >= 0 && c.cooldownSec <= 300)) e.cooldown = "Từ 0 đến 300 giây.";
    for (const k of ["maxDistance", "minGap", "minLiveness"] as const) if (c[k] && !(Number(c[k]) >= 0 && Number(c[k]) <= 1)) e[k] = "Giá trị từ 0 đến 1.";
    setErrs(e);
    return !Object.keys(e).length;
  };

  return (
    <>
      <PageHeader title="Cấu hình hệ thống" crumbs={["Quản trị", "Cấu hình"]} actions={<><Btn variant="outline" disabled={!dirty} onClick={() => setC(saved)}>Hoàn tác</Btn><Btn disabled={!dirty} onClick={() => validate() && setConfirm(true)}><Save className="size-4" /> Lưu cấu hình</Btn></>} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6 lg:row-span-2">
          <div className="mb-1 flex items-center gap-2 font-semibold"><Clock className="size-4" /> Giờ mở cửa</div>
          <p className="mb-4 text-xs text-muted-foreground">Múi giờ: Việt Nam (UTC+7) · chỉ đọc. Có thể đặt khung giờ qua đêm.</p>
          <div className="space-y-2">
            {c.hours.map((h, i) => (
              <div key={h.day} className="grid grid-cols-[100px_auto_1fr_1fr] items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2">
                <span className="text-sm font-medium">{h.day}</span>
                <Switch checked={!h.closed} onCheckedChange={(v) => setC({ ...c, hours: c.hours.map((x, j) => (j === i ? { ...x, closed: !v } : x)) })} aria-label={`Mở cửa ${h.day}`} />
                {h.closed ? <span className="col-span-2 text-sm text-muted-foreground">Đóng cửa</span> : <>
                  <Input type="time" value={h.open} onChange={(e) => setC({ ...c, hours: c.hours.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)) })} className="h-9" />
                  <Input type="time" value={h.close} onChange={(e) => setC({ ...c, hours: c.hours.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)) })} className="h-9" />
                </>}
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2 font-semibold"><Users className="size-4" /> Sức chứa và thời gian ở</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sức chứa (người)" error={errs.capacity}><Input type="number" value={c.capacity} onChange={(e) => setC({ ...c, capacity: Number(e.target.value) })} /></Field>
            <Field label="Cảnh báo sắp đầy (%)" error={errs.warnPct}><Input type="number" value={c.warnPct} onChange={(e) => setC({ ...c, warnPct: Number(e.target.value) })} /></Field>
            <Field label="Thời gian ở tối đa (giờ)" error={errs.maxStay} hint="Để trống nếu không giới hạn"><Input type="number" value={c.maxStayHours ?? ""} onChange={(e) => setC({ ...c, maxStayHours: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="Thời gian chờ giữa 2 lần quét (giây)" error={errs.cooldown}><Input type="number" value={c.cooldownSec} onChange={(e) => setC({ ...c, cooldownSec: Number(e.target.value) })} /></Field>
          </div>
          <label className="flex items-center justify-between rounded-xl bg-secondary/60 p-3 text-sm"><span><span className="font-medium">Chặn lượt vào khi đầy</span><span className="block text-xs text-muted-foreground">Từ chối lượt vào mới khi đạt sức chứa</span></span><Switch checked={c.enforce} onCheckedChange={(v) => setC({ ...c, enforce: v })} /></label>
        </Card>
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2 font-semibold"><ScanFace className="size-4" /> Nhận diện khuôn mặt (nâng cao)</div>
          {!c.modelVersion && <Notice tone="warning">Chưa cấu hình nhận diện. Cần hiệu chỉnh ngưỡng trước khi bật nhận diện khuôn mặt; trong lúc đó kiosk chỉ dùng mã QR.</Notice>}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phiên bản mô hình" hint="Tên phiên bản mô hình đang chạy"><Input value={c.modelVersion} onChange={(e) => setC({ ...c, modelVersion: e.target.value })} placeholder="Chưa đặt" /></Field>
            <Field label="Khoảng cách cosine tối đa" error={errs.maxDistance} hint="Càng nhỏ càng khắt khe"><Input value={c.maxDistance} onChange={(e) => setC({ ...c, maxDistance: e.target.value })} placeholder="Chưa đặt" /></Field>
            <Field label="Khoảng cách chênh tối thiểu" error={errs.minGap} hint="Phân biệt người gần giống nhau"><Input value={c.minGap} onChange={(e) => setC({ ...c, minGap: e.target.value })} placeholder="Chưa đặt" /></Field>
            <Field label="Điểm kiểm tra người thật tối thiểu" error={errs.minLiveness} hint="Chống dùng ảnh in, màn hình"><Input value={c.minLiveness} onChange={(e) => setC({ ...c, minLiveness: e.target.value })} placeholder="Chưa đặt" /></Field>
          </div>
        </Card>
      </div>
      <Confirm open={confirm} onOpenChange={setConfirm} title="Lưu cấu hình?" desc="Thay đổi giờ mở cửa và thời gian ở tối đa chỉ áp dụng cho các lượt vào sau thời điểm lưu." confirmLabel="Lưu"
        onConfirm={() => { setConfig(c); setConfirm(false); toast.success("Đã lưu cấu hình"); }} />
    </>
  );
}
