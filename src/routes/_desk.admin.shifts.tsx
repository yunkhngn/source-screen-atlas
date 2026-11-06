import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, UserPlus, Ban, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { fmtDateTime, validateShift } from "@/lib/rules";
import type { Shift } from "@/lib/mock";
import { Avatar, Badge, Btn, Card, Confirm, Field, Input, Modal, Notice, PageHeader, Segmented, Select, Table, Td, Textarea } from "@/components/kit";
import { ShiftWeek, WeekNav, mondayOf, DAY } from "@/components/shift-week";

export const Route = createFileRoute("/_desk/admin/shifts")({
  head: () => ({ meta: [{ title: "Phân ca nhân viên — Quản trị" }, { name: "description", content: "Lên lịch và phân công ca trực cho thủ thư." }, { property: "og:title", content: "Phân ca nhân viên" }, { property: "og:description", content: "Lịch ca trực theo tuần." }] }),
  component: Shifts,
});

const toLocal = (t: number) => new Date(t - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const overlaps = (a: Shift, b: Shift) => a.start < b.end && b.start < a.end;

function Shifts() {
  const { shifts, accounts, upsertShift } = useApp();
  const librarians = accounts.filter((a) => a.role === "LIBRARIAN");
  const nameOf = (id: string) => accounts.find((a) => a.id === id)?.name ?? "?";
  const [week, setWeek] = useState(0);
  const [view, setView] = useState<"week" | "list">("week");
  const [detail, setDetail] = useState<Shift | null>(null);
  const [form, setForm] = useState<{ id?: string; name: string; start: string; end: string } | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [addId, setAddId] = useState("");
  const [assignErr, setAssignErr] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [cancel, setCancel] = useState(false);
  const [reason, setReason] = useState("");

  const cur = detail ? shifts.find((s) => s.id === detail.id)! : null;
  const start = mondayOf(week);

  const saveForm = () => {
    if (!form!.name.trim()) return setFormErr("Vui lòng nhập tên ca.");
    const s = new Date(form!.start), e = new Date(form!.end);
    const err = validateShift(s, e);
    if (err) return setFormErr(err);
    const base = form!.id ? shifts.find((x) => x.id === form!.id)! : { id: `sh-${Date.now()}`, status: "ACTIVE" as const, staff: [] };
    const next = { ...base, name: form!.name, start: s.getTime(), end: e.getTime() };
    const clash = next.staff.find((sid) => shifts.some((o) => o.id !== next.id && o.status === "ACTIVE" && o.staff.includes(sid) && overlaps(o, next)));
    if (clash) return setFormErr(`${nameOf(clash)} sẽ bị trùng với một ca khác.`);
    upsertShift(next);
    toast.success(form!.id ? "Đã cập nhật ca — thay đổi áp dụng cho tất cả nhân viên được phân" : "Đã tạo ca trực");
    setForm(null);
  };

  const assign = () => {
    if (!addId) return;
    const clash = shifts.find((o) => o.id !== cur!.id && o.status === "ACTIVE" && o.staff.includes(addId) && overlaps(o, cur!));
    if (clash) return setAssignErr(`${nameOf(addId)} đã có ca "${clash.name}" trùng giờ (${fmtDateTime(clash.start)}). Ca liền kề thì được phép.`);
    upsertShift({ ...cur!, staff: [...cur!.staff, addId] });
    setAddId(""); setAssignErr(null);
    toast.success("Đã phân công");
  };

  const inWeek = shifts.filter((s) => s.start >= start && s.start < start + 7 * DAY).sort((a, b) => a.start - b.start);

  return (
    <>
      <PageHeader title="Phân ca nhân viên" crumbs={["Quản trị", "Phân ca"]} actions={<><Segmented value={view} onChange={setView} options={[{ value: "week", label: "Tuần" }, { value: "list", label: "Danh sách" }]} /><Btn onClick={() => { setFormErr(null); setForm({ name: "", start: toLocal(Date.now() + DAY), end: toLocal(Date.now() + DAY + 5 * 3600000) }); }}><Plus className="size-4" /> Tạo ca trực</Btn></>} />
      <Card className="p-5">
        <div className="mb-4"><WeekNav week={week} setWeek={setWeek} /></div>
        {view === "week" ? <ShiftWeek shifts={shifts} week={week} onPick={(s) => { setDetail(s); setAssignErr(null); }} staffName={nameOf} /> : (
          <Table head={["Ca", "Bắt đầu", "Kết thúc", "Nhân viên", "Trạng thái"]}>
            {inWeek.map((s) => <tr key={s.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => setDetail(s)}><Td className="font-medium">{s.name}</Td><Td>{fmtDateTime(s.start)}</Td><Td>{fmtDateTime(s.end)}</Td><Td>{s.staff.map(nameOf).join(", ") || "—"}</Td><Td>{s.status === "ACTIVE" ? <Badge tone="success">Đang hiệu lực</Badge> : <Badge tone="danger">Đã hủy</Badge>}</Td></tr>)}
          </Table>
        )}
      </Card>

      <Modal open={!!form} onOpenChange={(o) => !o && setForm(null)} title={form?.id ? "Sửa ca trực" : "Tạo ca trực"} footer={<><Btn variant="outline" onClick={() => setForm(null)}>Hủy</Btn><Btn onClick={saveForm}>Lưu</Btn></>}>
        {form && <>
          {formErr && <Notice tone="danger">{formErr}</Notice>}
          <Field label="Tên ca"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Ca sáng" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bắt đầu"><Input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
            <Field label="Kết thúc"><Input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
          </div>
          <p className="text-xs text-muted-foreground">Tối đa 24 giờ. Hỗ trợ ca qua đêm.{form.id && " Thay đổi sẽ áp dụng cho tất cả nhân viên đã được phân."}</p>
        </>}
      </Modal>

      <Modal open={!!cur && !form && !cancel && !removeId} onOpenChange={(o) => !o && setDetail(null)} title={cur?.name ?? ""} wide
        footer={cur?.status === "ACTIVE" && <><Btn variant="outline" onClick={() => { setFormErr(null); setForm({ id: cur.id, name: cur.name, start: toLocal(cur.start), end: toLocal(cur.end) }); }}><Pencil className="size-4" /> Sửa ca</Btn><Btn variant="danger" onClick={() => { setReason(""); setCancel(true); }}><Ban className="size-4" /> Hủy ca</Btn></>}>
        {cur && <>
          <div className="flex flex-wrap items-center gap-3 text-sm"><span>{fmtDateTime(cur.start)} → {fmtDateTime(cur.end)}</span>{cur.status === "ACTIVE" ? <Badge tone="success">Đang hiệu lực</Badge> : <Badge tone="danger">Đã hủy</Badge>}</div>
          {cur.status === "CANCELLED" && <Notice tone="warning" title="Ca đã hủy — chỉ xem">{cur.cancelReason}</Notice>}
          <div>
            <div className="mb-2 text-sm font-medium">Nhân viên được phân ({cur.staff.length})</div>
            {cur.staff.length === 0 && <p className="text-sm text-muted-foreground">Chưa có ai.</p>}
            <ul className="space-y-2">
              {cur.staff.map((id) => <li key={id} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-sm"><span className="flex items-center gap-2"><Avatar name={nameOf(id)} className="size-7" />{nameOf(id)}</span>{cur.status === "ACTIVE" && <button onClick={() => setRemoveId(id)} aria-label="Gỡ phân công" className="rounded-lg p-1 hover:bg-card"><X className="size-4" /></button>}</li>)}
            </ul>
          </div>
          {cur.status === "ACTIVE" && <>
            {assignErr && <Notice tone="danger">{assignErr}</Notice>}
            <div className="flex gap-2">
              <Select value={addId} onChange={(e) => setAddId(e.target.value)}>
                <option value="">— Chọn thủ thư đang hoạt động —</option>
                {librarians.filter((l) => l.status === "ACTIVE" && !cur.staff.includes(l.id)).map((l) => <option key={l.id} value={l.id}>{l.name} · {l.code}</option>)}
              </Select>
              <Btn onClick={assign} disabled={!addId}><UserPlus className="size-4" /> Phân công</Btn>
            </div>
            <p className="text-xs text-muted-foreground">Chỉ thủ thư đang hoạt động mới được phân. Lịch ca không phải chấm công.</p>
          </>}
        </>}
      </Modal>

      <Confirm open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)} danger title="Gỡ phân công?" desc={<>Gỡ <b>{removeId && nameOf(removeId)}</b> khỏi ca này. Ca trực vẫn giữ nguyên cho những người khác.</>} confirmLabel="Gỡ"
        onConfirm={() => { upsertShift({ ...cur!, staff: cur!.staff.filter((x) => x !== removeId) }); setRemoveId(null); toast.success("Đã gỡ phân công"); }} />
      <Confirm open={cancel} onOpenChange={setCancel} danger title="Hủy toàn bộ ca trực?" desc="Hủy ca sẽ áp dụng cho tất cả nhân viên đã phân. Ca đã hủy chỉ có thể xem và không mở lại được." confirmLabel="Hủy ca"
        onConfirm={() => { if (!reason.trim()) return toast.error("Vui lòng nhập lý do hủy."); upsertShift({ ...cur!, status: "CANCELLED", cancelReason: reason }); setCancel(false); toast.success("Đã hủy ca"); }}>
        <Field label="Lý do hủy (bắt buộc)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Confirm>
    </>
  );
}
