import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useMe } from "@/lib/store";
import { qrRemaining, QR_VALIDITY_SECONDS } from "@/lib/rules";
import { Btn } from "@/components/kit";
import { MHeader } from "@/components/mobile";

export const Route = createFileRoute("/student/qr")({
  head: () => ({ meta: [{ title: "Mã QR — Sinh viên" }, { name: "description", content: "Mã QR cá nhân hiệu lực 30 giây." }, { property: "og:title", content: "Mã QR cá nhân" }, { property: "og:description", content: "Xuất trình mã tại kiosk." }] }),
  component: Qr,
});

type St = "generating" | "active" | "expired" | "failed" | "limited";

function Qr() {
  const me = useMe()!;
  const [st, setSt] = useState<St>("generating");
  const [issued, setIssued] = useState(0);
  const [token, setToken] = useState("");
  const [now, setNow] = useState(Date.now());
  const [count, setCount] = useState(0);

  const gen = () => {
    if (count >= 4) return setSt("limited");
    setSt("generating");
    setCount((c) => c + 1);
    setTimeout(() => { setIssued(Date.now()); setNow(Date.now()); setToken(`LA1.${me.code}.${Math.random().toString(36).slice(2, 12)}`); setSt("active"); }, 600);
  };
  useEffect(gen, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (st !== "active") return;
    const i = setInterval(() => { const n = Date.now(); setNow(n); if (qrRemaining(issued, n) === 0) setSt("expired"); }, 250);
    return () => clearInterval(i);
  }, [st, issued]);
  useEffect(() => { if (st === "limited") { const t = setTimeout(() => setCount(0), 15000); return () => clearTimeout(t); } }, [st]);

  const rem = qrRemaining(issued, now);
  return (
    <>
      <MHeader title="Mã QR cá nhân" />
      <div className="px-5 pb-6">
        <div className="rounded-xl bg-card p-6 text-center shadow-soft">
          <div className="text-lg font-semibold">{me.name}</div>
          <div className="text-sm text-muted-foreground">{me.code}</div>
          <div className="relative mx-auto mt-5 grid aspect-square w-full max-w-[260px] place-items-center rounded-lg bg-yellow-soft p-4">
            {st === "active" && <QRCodeSVG value={token} size={228} bgColor="transparent" fgColor="currentColor" className="text-foreground" />}
            {st === "generating" && <Loader2 className="size-8 animate-spin text-muted-foreground" />}
            {st !== "active" && st !== "generating" && (
              <div className="px-4 text-sm">
                {st === "expired" ? <Clock className="mx-auto mb-2 size-8" /> : <AlertTriangle className="mx-auto mb-2 size-8 text-destructive" />}
                <div className="font-semibold">{st === "expired" ? "Mã đã hết hạn" : st === "failed" ? "Không tạo được mã" : "Bạn tạo mã quá nhanh"}</div>
                <div className="mt-1 text-muted-foreground">{st === "expired" ? "Mã này không còn dùng được." : st === "failed" ? "Kiểm tra kết nối và thử lại." : "Vui lòng đợi khoảng 15 giây rồi thử lại."}</div>
              </div>
            )}
          </div>
          {st === "active" && (
            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(rem / QR_VALIDITY_SECONDS) * 100}%` }} /></div>
              <div className="mt-2 text-sm">Còn hiệu lực <b className="tabular-nums">{rem} giây</b></div>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">Đưa mã vào vùng quét của kiosk. Mỗi mã chỉ dùng một lần trong {QR_VALIDITY_SECONDS} giây.</p>
        <Btn size="lg" variant={st === "active" ? "outline" : "primary"} className="mt-4 w-full" onClick={gen} disabled={st === "generating" || st === "limited"}><RefreshCw className="size-4" /> Tạo mã mới</Btn>
        <button className="mt-3 w-full text-xs text-muted-foreground underline" onClick={() => setSt("failed")}>Mô phỏng lỗi tạo mã</button>
      </div>
    </>
  );
}
