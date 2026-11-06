import { useState } from "react";
import { Info } from "lucide-react";
import { Btn, Field, Notice, PasswordInput } from "@/components/kit";
import { DEMO_PASSWORD } from "@/lib/store";
import { validatePassword, PASSWORD_MAX_BYTES } from "@/lib/rules";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function PasswordForm({ onDone, submitLabel = "Lưu mật khẩu mới" }: { onDone: () => void; submitLabel?: string }) {
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [cf, setCf] = useState("");
  const [errs, setErrs] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: Record<string, string | null> = {};
    if (!cur) n.cur = "Vui lòng nhập mật khẩu hiện tại.";
    else if (cur !== DEMO_PASSWORD) n.cur = "Mật khẩu hiện tại không đúng.";
    n.nw = validatePassword(nw, cur);
    if (cf !== nw) n.cf = "Mật khẩu xác nhận không khớp.";
    setErrs(n);
    if (Object.values(n).some(Boolean)) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onDone(); }, 700);
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Mật khẩu hiện tại" error={errs.cur} hint={`Demo: ${DEMO_PASSWORD}`}><PasswordInput value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
      <Field
        label="Mật khẩu mới"
        error={errs.nw}
        hint={
          <span className="inline-flex items-center gap-1">
            Từ 12 đến 64 ký tự
            <TooltipProvider><Tooltip><TooltipTrigger type="button"><Info className="size-3.5" /></TooltipTrigger><TooltipContent>Tối đa {PASSWORD_MAX_BYTES} byte khi mã hóa UTF-8 — ký tự có dấu chiếm nhiều byte hơn.</TooltipContent></Tooltip></TooltipProvider>
          </span>
        }
      >
        <PasswordInput value={nw} onChange={(e) => setNw(e.target.value)} />
      </Field>
      <Field label="Xác nhận mật khẩu mới" error={errs.cf}><PasswordInput value={cf} onChange={(e) => setCf(e.target.value)} /></Field>
      <Btn type="submit" size="lg" className="w-full" loading={loading}>{submitLabel}</Btn>
      <Notice tone="info">Nếu kết nối bị gián đoạn khi đang lưu, hãy đăng nhập lại thay vì gửi lại biểu mẫu.</Notice>
    </form>
  );
}
