import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ScanFace, Sun, User, EyeOff, Camera, ImagePlus, X, CheckCircle2, AlertTriangle, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { ENROLL_MAX_IMAGES, ENROLL_MIN_IMAGES, fmtDateTime } from "@/lib/rules";
import { Badge, Btn, Confirm, Notice } from "@/components/kit";
import { Checkbox } from "@/components/ui/checkbox";
import { MHeader } from "@/components/mobile";

export const Route = createFileRoute("/student/face")({
  head: () => ({ meta: [{ title: "Khuôn mặt — Sinh viên" }, { name: "description", content: "Đăng ký khuôn mặt để vào thư viện nhanh hơn." }, { property: "og:title", content: "Đăng ký khuôn mặt" }, { property: "og:description", content: "Đồng ý sinh trắc và đăng ký." }] }),
  component: Face,
});

const POLICY = "v2026.1";
type Step = "overview" | "consent" | "prepare" | "capture" | "processing" | "result";
const FAILS = {
  NO_FACE: "Không tìm thấy khuôn mặt trong một hoặc nhiều ảnh.",
  MULTI: "Có nhiều hơn một khuôn mặt trong ảnh.",
  LOW_QUALITY: "Ảnh bị mờ hoặc thiếu sáng.",
  INCONSISTENT: "Các ảnh có vẻ không cùng một người.",
  AI_DOWN: "Dịch vụ nhận diện tạm thời không khả dụng.",
} as const;

function Face() {
  const enr = useApp((s) => s.enrollment);
  const setEnr = useApp((s) => s.setEnrollment);
  const [step, setStep] = useState<Step>("overview");
  const [agree, setAgree] = useState(false);
  const [cam, setCam] = useState<"ask" | "granted" | "denied">("ask");
  const [imgs, setImgs] = useState<string[]>([]);
  const [fail, setFail] = useState<keyof typeof FAILS | null>(null);
  const [simulate, setSimulate] = useState<"OK" | keyof typeof FAILS>("OK");
  const [del, setDel] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const wasEnrolled = enr.status === "ENROLLED";

  const capture = () => {
    if (imgs.length >= ENROLL_MAX_IMAGES) return;
    const hues = ["bg-yellow", "bg-pink", "bg-mint", "bg-sky", "bg-yellow-soft"];
    setImgs([...imgs, hues[imgs.length]]);
  };
  const onFiles = (fl: FileList | null) => {
    if (!fl) return;
    for (const f of Array.from(fl)) {
      if (!/image\/(jpeg|png)/.test(f.type)) { toast.error(`${f.name}: chỉ hỗ trợ JPG hoặc PNG.`); continue; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name}: vượt quá 5 MB.`); continue; }
      setImgs((p) => (p.length < ENROLL_MAX_IMAGES ? [...p, URL.createObjectURL(f)] : p));
    }
  };
  const submit = () => {
    setStep("processing");
    setTimeout(() => {
      if (simulate === "OK") { setEnr({ status: "ENROLLED", at: Date.now(), samples: imgs.length, policy: POLICY }); setFail(null); }
      else setFail(simulate);
      setStep("result");
    }, 1600);
  };
  const start = () => { setAgree(false); setImgs([]); setCam("ask"); setStep("consent"); };

  return (
    <>
      <MHeader title="Khuôn mặt" back={step === "overview" ? "/student/home" : undefined} right={step !== "overview" && step !== "processing" && <button onClick={() => setStep("overview")} className="text-sm text-muted-foreground">Đóng</button>} />
      <div className="px-5 pb-6">
        {step === "overview" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-pink p-6 text-center">
              <ScanFace className="mx-auto size-12" strokeWidth={1.5} />
              <div className="mt-3 text-lg font-semibold">{wasEnrolled ? "Đã đăng ký khuôn mặt" : enr.status === "CONSENT_REQUIRED" ? "Cần đồng ý chính sách mới" : "Chưa đăng ký khuôn mặt"}</div>
              <p className="mt-1 text-sm text-foreground/75">Vào thư viện chỉ bằng cách nhìn vào kiosk.</p>
            </div>
            {wasEnrolled && (
              <dl className="divide-y divide-border rounded-lg bg-card text-sm shadow-soft">
                <div className="flex justify-between px-4 py-3"><dt className="text-muted-foreground">Ngày đăng ký</dt><dd>{fmtDateTime(enr.at!)}</dd></div>
                <div className="flex justify-between px-4 py-3"><dt className="text-muted-foreground">Số ảnh mẫu</dt><dd>{enr.samples}</dd></div>
                <div className="flex justify-between px-4 py-3"><dt className="text-muted-foreground">Phiên bản chính sách</dt><dd>{enr.policy}</dd></div>
              </dl>
            )}
            <Notice tone="info">Bạn luôn có thể dùng mã QR thay cho khuôn mặt. Hệ thống không lưu ảnh khuôn mặt của bạn.</Notice>
            <Btn size="lg" className="w-full" onClick={start}>{wasEnrolled ? "Đăng ký lại" : "Đăng ký khuôn mặt"}</Btn>
            {wasEnrolled && <Btn size="lg" variant="outline" className="w-full text-destructive" onClick={() => setDel(true)}><Trash2 className="size-4" /> Xóa dữ liệu khuôn mặt</Btn>}
            <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              Mô phỏng trạng thái:{" "}
              <button className="underline" onClick={() => setEnr({ status: "CONSENT_REQUIRED" })}>cần đồng ý lại</button> ·{" "}
              <button className="underline" onClick={() => setEnr({ status: "NONE" })}>chưa đăng ký</button>
            </div>
          </div>
        )}

        {step === "consent" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2"><ShieldCheck className="size-5" /><h2 className="text-lg font-semibold">Đồng ý xử lý dữ liệu sinh trắc</h2></div>
            <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg bg-card p-4 text-sm leading-relaxed shadow-soft">
              <p><b>Mục đích:</b> Dữ liệu khuôn mặt chỉ dùng để nhận diện bạn khi ra vào thư viện.</p>
              <p><b>Ảnh chụp tạm thời:</b> Ảnh bạn gửi chỉ dùng để tạo mẫu nhận diện và được xóa sau khi xử lý xong. Hệ thống không lưu ảnh.</p>
              <p><b>Quyền xóa:</b> Bạn có thể xóa dữ liệu khuôn mặt bất kỳ lúc nào. Lịch sử ra vào vẫn được giữ lại.</p>
              <p><b>Lựa chọn khác:</b> Không đồng ý cũng không sao — bạn vẫn dùng mã QR bình thường.</p>
              <p className="text-xs text-muted-foreground">Phiên bản chính sách: {POLICY}</p>
            </div>
            <label className="flex items-start gap-3 rounded-lg bg-yellow-soft p-4 text-sm"><Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" /> Tôi đã đọc và đồng ý cho thư viện xử lý dữ liệu khuôn mặt của tôi theo chính sách trên.</label>
            <Btn size="lg" className="w-full" disabled={!agree} onClick={() => setStep("prepare")}>Đồng ý và tiếp tục</Btn>
            <Link to="/student/qr" className="block text-center text-sm font-medium underline">Sử dụng mã QR</Link>
          </div>
        )}

        {step === "prepare" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Chuẩn bị chụp ảnh</h2>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[{ i: Sun, t: "Đủ ánh sáng" }, { i: User, t: "Chỉ một người" }, { i: EyeOff, t: "Không che mặt" }].map((x) => <div key={x.t} className="rounded-lg bg-card p-3 shadow-soft"><x.i className="mx-auto mb-1.5 size-5" />{x.t}</div>)}
            </div>
            {cam === "denied" && <Notice tone="warning" title="Chưa có quyền dùng camera">Bạn có thể bật quyền camera trong cài đặt trình duyệt, hoặc chọn ảnh có sẵn trên thiết bị.</Notice>}
            {cam !== "denied" && <Btn size="lg" className="w-full" onClick={() => { setCam("granted"); setStep("capture"); }}><Camera className="size-4" /> Cho phép camera</Btn>}
            {cam === "ask" && <Btn variant="ghost" className="w-full" onClick={() => setCam("denied")}>Không cho phép</Btn>}
            <Btn size="lg" variant="outline" className="w-full" onClick={() => setStep("capture")}><ImagePlus className="size-4" /> Chọn ảnh từ thiết bị</Btn>
          </div>
        )}

        {step === "capture" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Chụp {ENROLL_MIN_IMAGES}–{ENROLL_MAX_IMAGES} ảnh</h2><Badge tone={imgs.length >= ENROLL_MIN_IMAGES ? "success" : "neutral"}>{imgs.length}/{ENROLL_MAX_IMAGES}</Badge></div>
            {cam === "granted" && (
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-primary">
                <div className="absolute inset-[18%] rounded-[50%] border-4 border-dashed border-yellow" />
                <div className="absolute inset-x-0 bottom-4 text-center text-sm text-primary-foreground">Nhìn thẳng, rồi hơi nghiêng đầu ở các ảnh sau</div>
              </div>
            )}
            <div className="flex gap-2">
              {Array.from({ length: ENROLL_MAX_IMAGES }).map((_, i) => (
                <div key={i} className="relative aspect-square flex-1 overflow-hidden rounded-xl border border-dashed border-border bg-card">
                  {imgs[i] && (imgs[i].startsWith("bg-") ? <div className={`grid h-full place-items-center ${imgs[i]}`}><User className="size-5" /></div> : <img src={imgs[i]} alt={`Ảnh tạm ${i + 1}`} className="h-full w-full object-cover" />)}
                  {imgs[i] && <button aria-label="Xóa ảnh" onClick={() => setImgs(imgs.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-card p-0.5"><X className="size-3" /></button>}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Ảnh xem trước tạm thời · JPG/PNG, tối đa 5 MB mỗi ảnh. Kiểm tra trên máy không đảm bảo ảnh được chấp nhận.</p>
            <div className="grid grid-cols-2 gap-2">
              {cam === "granted" && <Btn variant="accent" onClick={capture} disabled={imgs.length >= ENROLL_MAX_IMAGES}><Camera className="size-4" /> Chụp</Btn>}
              <Btn variant="outline" onClick={() => file.current?.click()} disabled={imgs.length >= ENROLL_MAX_IMAGES} className={cam === "granted" ? "" : "col-span-2"}><ImagePlus className="size-4" /> Chọn ảnh</Btn>
              <input ref={file} type="file" accept="image/jpeg,image/png" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            </div>
            <label className="block text-xs text-muted-foreground">Mô phỏng kết quả:
              <select value={simulate} onChange={(e) => setSimulate(e.target.value as typeof simulate)} className="ml-2 rounded-lg border border-input bg-card px-2 py-1">
                <option value="OK">Thành công</option>{Object.entries(FAILS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <Btn size="lg" className="w-full" disabled={imgs.length < ENROLL_MIN_IMAGES} onClick={submit}>Gửi {imgs.length} ảnh</Btn>
          </div>
        )}

        {step === "processing" && (
          <div className="py-20 text-center"><Loader2 className="mx-auto size-10 animate-spin" /><div className="mt-4 font-semibold">Đang xử lý ảnh…</div><p className="mt-1 text-sm text-muted-foreground">Vui lòng không đóng màn hình.</p></div>
        )}

        {step === "result" && (fail ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-xl bg-pink"><AlertTriangle className="size-8 text-destructive" /></div>
            <div className="text-lg font-semibold">Chưa đăng ký được</div>
            <p className="text-sm text-muted-foreground">{FAILS[fail]}</p>
            {wasEnrolled && <Notice tone="info">Dữ liệu khuôn mặt đã đăng ký trước đó vẫn được giữ nguyên.</Notice>}
            <Btn size="lg" className="w-full" onClick={() => { setImgs([]); setStep("capture"); }}>Chụp lại</Btn>
            <Link to="/student/qr" className="block text-sm font-medium underline">Sử dụng mã QR</Link>
          </div>
        ) : (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-xl bg-mint"><CheckCircle2 className="size-8 text-success" /></div>
            <div className="text-lg font-semibold">Đăng ký thành công</div>
            <p className="text-sm text-muted-foreground">Từ giờ bạn có thể vào thư viện bằng khuôn mặt. Ảnh tạm thời đã được xóa.</p>
            <Btn size="lg" className="w-full" onClick={() => setStep("overview")}>Xong</Btn>
          </div>
        ))}
      </div>
      <Confirm open={del} onOpenChange={setDel} danger title="Xóa dữ liệu khuôn mặt?" desc="Dữ liệu khuôn mặt và sự đồng ý của bạn sẽ bị xóa. Lịch sử ra vào vẫn được giữ lại và bạn vẫn dùng mã QR được." confirmLabel="Xóa dữ liệu"
        onConfirm={() => { setEnr({ status: "NONE" }); setDel(false); toast.success("Đã xóa dữ liệu khuôn mặt"); }} />
    </>
  );
}
