import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, LogIn, LogOut } from "lucide-react";
import { useApp, useMe } from "@/lib/store";
import { fmtDateTime } from "@/lib/rules";
import { Badge, Btn, Card, Field, Input, Notice, PageHeader, Segmented, Select, Textarea } from "@/components/kit";

export const Route = createFileRoute("/_desk/staff/manual-access")({
  validateSearch: (s: Record<string, unknown>): { visitor?: string } => ({ visitor: typeof s.visitor === "string" ? s.visitor : undefined }),
  head: () => ({ meta: [{ title: "Ghi nhận thủ công" }, { name: "description", content: "Ghi nhận vào hoặc ra cho sinh viên và khách ngoài." }, { property: "og:title", content: "Ghi nhận thủ công" }, { property: "og:description", content: "Ghi nhận ra vào có lý do." }] }),
  component: Manual,
});

function Manual() {
  const { visitor: preVisitor } = Route.useSearch();
  const me = useMe()!;
  const { accounts, visitors, sessions, recordEntry, recordExit } = useApp();
  const [type, setType] = useState<"STUDENT" | "VISITOR">(preVisitor ? "VISITOR" : "STUDENT");
  const [dir, setDir] = useState<"IN" | "OUT">("IN");
  const [code, setCode] = useState("");
  const [visitorId, setVisitorId] = useState(preVisitor ?? "");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"form" | "review" | "done">("form");
  const [err, setErr] = useState<string | null>(null);

  // Student lookup uses data known to staff (history/occupants), plus entering a known account code.
  const student = accounts.find((a) => a.role === "STUDENT" && a.code.toLowerCase() === code.trim().toLowerCase());
  const target = type === "STUDENT" ? student : visitors.find((v) => v.id === visitorId);
  const targetName = target?.name;
  const subjectId = target?.id;
  const inside = !!subjectId && sessions.some((s) => s.subjectId === subjectId && !s.exitAt);

  const review = () => {
    if (!target) return setErr(type === "STUDENT" ? "Không tìm thấy sinh viên với mã này." : "Vui lòng chọn khách.");
    if (!reason.trim()) return setErr("Vui lòng nhập lý do ghi nhận.");
    setErr(null);
    setStep("review");
  };
  const submit = () => {
    const e = dir === "IN" ? recordEntry({ subjectType: type, subjectId: subjectId!, method: "MANUAL", actor: me.name, reason }) : recordExit(subjectId!, "MANUAL", me.name, reason);
    if (e) { setErr(e); setStep("form"); } else setStep("done");
  };
  const reset = () => { setStep("form"); setCode(""); setVisitorId(""); setReason(""); };

  return (
    <>
      <PageHeader title="Ghi nhận thủ công" crumbs={["Vận hành", "Ghi nhận thủ công"]} sub="Dùng khi sinh viên hoặc khách không thể sử dụng kiosk." />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="p-6">
          {step === "done" ? (
            <div className="py-10 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-xl bg-mint"><CheckCircle2 className="size-8 text-success" /></div>
              <h2 className="mt-4 text-xl font-semibold">Đã ghi nhận {dir === "IN" ? "vào" : "ra"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{targetName} · {fmtDateTime(Date.now())}</p>
              <Btn className="mt-6" onClick={reset}>Ghi nhận lượt khác</Btn>
            </div>
          ) : step === "review" ? (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Xem lại trước khi ghi nhận</h2>
              <dl className="grid grid-cols-2 gap-4 rounded-xl bg-secondary p-4 text-sm">
                <div><dt className="text-muted-foreground">Đối tượng</dt><dd className="font-medium">{targetName}</dd></div>
                <div><dt className="text-muted-foreground">Loại</dt><dd>{type === "STUDENT" ? "Sinh viên" : "Khách ngoài"}</dd></div>
                <div><dt className="text-muted-foreground">Thao tác</dt><dd className="font-medium">{dir === "IN" ? "Ghi nhận vào" : "Ghi nhận ra"}</dd></div>
                <div><dt className="text-muted-foreground">Người thực hiện</dt><dd>{me.name}</dd></div>
                <div className="col-span-2"><dt className="text-muted-foreground">Lý do</dt><dd>{reason}</dd></div>
              </dl>
              <div className="flex gap-2"><Btn variant="outline" onClick={() => setStep("form")}>Quay lại</Btn><Btn onClick={submit}>{dir === "IN" ? "Xác nhận ghi nhận vào" : "Xác nhận ghi nhận ra"}</Btn></div>
            </div>
          ) : (
            <div className="space-y-5">
              {err && <Notice tone="danger">{err}</Notice>}
              <div className="flex flex-wrap gap-6">
                <div><div className="mb-1.5 text-sm font-medium">Đối tượng</div><Segmented value={type} onChange={setType} options={[{ value: "STUDENT", label: "Sinh viên" }, { value: "VISITOR", label: "Khách ngoài" }]} /></div>
                <div><div className="mb-1.5 text-sm font-medium">Thao tác</div><Segmented value={dir} onChange={setDir} options={[{ value: "IN", label: "Ghi nhận vào" }, { value: "OUT", label: "Ghi nhận ra" }]} /></div>
              </div>
              {type === "STUDENT" ? (
                <Field label="Mã tài khoản sinh viên" hint={student ? <span className="text-success">✓ {student.name}</span> : "Nhập mã tài khoản đã biết, VD: SV2201234"}><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SV…" /></Field>
              ) : (
                <Field label="Chọn khách"><Select value={visitorId} onChange={(e) => setVisitorId(e.target.value)}><option value="">— Chọn khách ngoài —</option>{visitors.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.ref}</option>)}</Select></Field>
              )}
              {target && <div>{inside ? <Badge tone="success">Đang trong thư viện</Badge> : <Badge>Đang ở ngoài</Badge>}</div>}
              <Field label="Lý do (bắt buộc)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Kiosk không nhận diện được, sinh viên không có điện thoại" /></Field>
              <Btn size="lg" onClick={review}>{dir === "IN" ? <LogIn className="size-4" /> : <LogOut className="size-4" />} Tiếp tục</Btn>
            </div>
          )}
        </Card>
        <Card className="h-fit p-5 text-sm">
          <div className="font-semibold">Lưu ý</div>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-muted-foreground">
            <li>Mọi ghi nhận thủ công đều lưu tên người thực hiện và lý do.</li>
            <li>Không thể ghi nhận vào khi người đó đang ở trong thư viện.</li>
            <li>Khi bật giới hạn sức chứa, lượt vào bị từ chối nếu thư viện đã đầy.</li>
            <li>Lịch sử ra vào không thể sửa sau khi ghi nhận.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
