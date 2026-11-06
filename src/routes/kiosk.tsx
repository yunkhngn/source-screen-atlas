import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QrCode, ScanFace, CheckCircle2, XCircle, Settings, WifiOff, Users, Moon, ShieldOff, ArrowLeft, Loader2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { fmtDate, fmtTime } from "@/lib/rules";
import { MODE_LABEL, type Kiosk } from "@/lib/mock";
import { Btn, Deco, Field, Input, Logo, Notice, PasswordInput } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kiosk")({
  head: () => ({ meta: [{ title: "Kiosk tự phục vụ — Cổng Thư Viện" }, { name: "description", content: "Ghi nhận ra vào bằng khuôn mặt hoặc mã QR." }, { property: "og:title", content: "Kiosk tự phục vụ" }, { property: "og:description", content: "Màn hình kiosk ra vào thư viện." }] }),
  component: KioskPage,
});

type Phase = "setup" | "ready" | "position" | "recognizing" | "qr" | "success" | "fail" | "full" | "closed" | "revoked" | "offline";

function KioskPage() {
  const { kiosks, accounts, sessions, recordEntry, recordExit } = useApp();
  const [device, setDevice] = useState<Kiosk | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [devId, setDevId] = useState("");
  const [secret, setSecret] = useState("");
  const [setupErr, setSetupErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; dir: "IN" | "OUT"; msg?: string } | null>(null);
  const [guide, setGuide] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [admin, setAdmin] = useState(false);

  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  useEffect(() => {
    if (["success", "fail", "full", "closed"].includes(phase)) { const t = setTimeout(() => setPhase("ready"), 4500); return () => clearTimeout(t); }
  }, [phase]);

  const connect = () => {
    const k = kiosks.find((x) => x.code.toLowerCase() === devId.trim().toLowerCase());
    if (!devId || !secret) return setSetupErr("Vui lòng nhập mã thiết bị và mật khẩu.");
    if (!k || secret.length < 8) return setSetupErr("Mã thiết bị hoặc mật khẩu không đúng.");
    if (k.status === "REVOKED") return setSetupErr("Thiết bị này đã bị thu hồi. Liên hệ quản trị viên để cấp mật khẩu mới.");
    setSetupErr(null); setDevice(k); setPhase("ready");
  };

  const process = (method: "FACE" | "QR") => {
    // Pick a random student to simulate an identity match.
    const st = accounts.filter((a) => a.role === "STUDENT" && a.status === "ACTIVE");
    const who = st[Math.floor(Math.random() * st.length)];
    const inside = sessions.some((s) => s.subjectId === who.id && !s.exitAt);
    const dir: "IN" | "OUT" = device!.mode === "ENTRY" ? "IN" : device!.mode === "EXIT" ? "OUT" : inside ? "OUT" : "IN";
    const err = dir === "IN" ? recordEntry({ subjectType: "STUDENT", subjectId: who.id, method, actor: device!.code }) : recordExit(who.id, method, device!.code);
    if (err?.includes("sức chứa")) return setPhase("full");
    if (err) { setResult({ name: who.name, dir, msg: err }); return setPhase("fail"); }
    setResult({ name: who.name, dir }); setPhase("success");
  };

  const startFace = (g?: string) => {
    setGuide(g ?? null); setPhase("position");
    if (g) return;
    setTimeout(() => setPhase("recognizing"), 1200);
    setTimeout(() => process("FACE"), 2600);
  };

  const dirWord = device?.mode === "ENTRY" ? "vào" : device?.mode === "EXIT" ? "ra" : "ra vào";

  if (phase === "setup" || !device) {
    return (
      <Frame>
        <div className="relative grid h-full place-items-center">
          <Deco />
          <div className="relative w-[440px] rounded-3xl bg-card p-8 shadow-pop">
            <Logo />
            <h1 className="mt-6 text-2xl font-semibold">Cài đặt thiết bị</h1>
            <p className="mt-1 text-sm text-muted-foreground">Dành cho quản trị viên. Nhập thông tin được cấp khi tạo kiosk.</p>
            <div className="mt-6 space-y-4">
              {setupErr && <Notice tone="danger">{setupErr}</Notice>}
              <Field label="Mã thiết bị"><Input value={devId} onChange={(e) => setDevId(e.target.value)} placeholder="VD: KIOSK-CỔNG-A" className="h-14 text-base" /></Field>
              <Field label="Mật khẩu thiết bị" hint="Demo: dùng KIOSK-CỔNG-A / KIOSK-TẦNG-2 với mật khẩu bất kỳ từ 8 ký tự"><PasswordInput value={secret} onChange={(e) => setSecret(e.target.value)} /></Field>
              <Btn size="xl" className="w-full" onClick={connect}>Kết nối</Btn>
              <Link to="/" className="block text-center text-sm text-muted-foreground">← Cổng demo</Link>
            </div>
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      <header className="flex items-center justify-between px-10 py-6">
        <Logo />
        <div className="text-center"><div className="text-3xl font-semibold tabular-nums">{fmtTime(now)}</div><div className="text-sm text-muted-foreground">{fmtDate(now)}</div></div>
        <div className="flex items-center gap-3 text-right">
          <div><div className="font-medium">{device.name}</div><div className="text-sm text-muted-foreground">Chế độ: {MODE_LABEL[device.mode]}</div></div>
          <button onClick={() => setAdmin(!admin)} aria-label="Cài đặt" className="grid size-12 place-items-center rounded-2xl hover:bg-secondary"><Settings className="size-5" /></button>
        </div>
      </header>

      {admin && (
        <div className="absolute right-10 top-24 z-20 w-72 space-y-1 rounded-2xl bg-card p-3 text-sm shadow-pop">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Mô phỏng trạng thái</div>
          {([["full", "Thư viện đã đầy"], ["closed", "Ngoài giờ mở cửa"], ["offline", "Mất kết nối"], ["revoked", "Thiết bị bị thu hồi"]] as const).map(([p, l]) => <button key={p} onClick={() => { setPhase(p); setAdmin(false); }} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-secondary">{l}</button>)}
          <button onClick={() => { setDevice(null); setPhase("setup"); setAdmin(false); }} className="block w-full rounded-lg px-2 py-2 text-left text-destructive hover:bg-secondary">Ngắt thiết bị</button>
        </div>
      )}

      <main className="grid flex-1 grid-cols-[1fr_380px] gap-8 px-10 pb-10">
        {/* Camera area */}
        <div className="relative overflow-hidden rounded-[2rem] bg-primary">
          {phase === "qr" ? (
            <div className="grid h-full place-items-center text-primary-foreground">
              <div className="text-center">
                <div className="relative mx-auto size-72 rounded-3xl border-4 border-yellow"><div className="animate-scan absolute inset-x-4 h-1 rounded bg-yellow" /></div>
                <div className="mt-6 text-2xl font-semibold">Đưa mã QR vào khung</div>
                <Btn variant="accent" size="lg" className="mt-6" onClick={() => process("QR")}>Mô phỏng quét mã</Btn>
              </div>
            </div>
          ) : (
            <>
              <div className={cn("absolute left-1/2 top-1/2 h-[70%] aspect-[3/4] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 transition", phase === "recognizing" ? "border-mint" : phase === "position" ? "border-yellow" : "border-dashed border-primary-foreground/40")} />
              {phase === "recognizing" && <div className="animate-scan absolute inset-x-[30%] h-1 rounded bg-mint" />}
              <div className="absolute inset-x-0 bottom-8 text-center text-primary-foreground">
                {phase === "recognizing" ? <div className="inline-flex items-center gap-2 text-xl font-medium"><Loader2 className="size-5 animate-spin" /> Đang nhận diện…</div>
                  : phase === "position" ? <div className="text-xl font-medium">{guide ?? "Giữ yên, nhìn thẳng vào camera"}</div>
                  : <div className="text-xl font-medium">Đưa khuôn mặt vào khung để ghi nhận {dirWord}</div>}
              </div>
              <div className="absolute left-6 top-6 rounded-full bg-card/15 px-3 py-1 text-xs text-primary-foreground">Xem trước camera · không lưu hình</div>
            </>
          )}
          {/* overlays */}
          {["success", "fail", "full", "closed", "revoked", "offline"].includes(phase) && (
            <div className={cn("absolute inset-0 grid place-items-center", phase === "success" ? "bg-mint" : phase === "revoked" || phase === "offline" ? "bg-secondary" : "bg-pink")}>
              <div className="max-w-lg px-8 text-center">
                {phase === "success" && <><CheckCircle2 className="mx-auto size-24 text-success" strokeWidth={1.5} /><div className="mt-6 text-4xl font-semibold">{result?.dir === "IN" ? "Chào mừng" : "Hẹn gặp lại"}, {result?.name.split(" ").pop()}!</div><div className="mt-3 text-xl">Đã ghi nhận {result?.dir === "IN" ? "vào" : "ra"} lúc {fmtTime(now)}</div></>}
                {phase === "fail" && <><XCircle className="mx-auto size-24 text-destructive" strokeWidth={1.5} /><div className="mt-6 text-3xl font-semibold">Chưa ghi nhận được</div><div className="mt-3 text-lg">{result?.msg ?? "Không nhận diện được khuôn mặt."} Vui lòng dùng mã QR hoặc liên hệ thủ thư.</div></>}
                {phase === "full" && <><Users className="mx-auto size-24 text-destructive" strokeWidth={1.5} /><div className="mt-6 text-3xl font-semibold">Thư viện đã đầy</div><div className="mt-3 text-lg">Vui lòng quay lại sau. Lượt ra vẫn được ghi nhận bình thường.</div></>}
                {phase === "closed" && <><Moon className="mx-auto size-24" strokeWidth={1.5} /><div className="mt-6 text-3xl font-semibold">Thư viện đang đóng cửa</div><div className="mt-3 text-lg">Bạn vẫn có thể ghi nhận ra.</div></>}
                {phase === "revoked" && <><ShieldOff className="mx-auto size-24" strokeWidth={1.5} /><div className="mt-6 text-3xl font-semibold">Thiết bị tạm ngừng hoạt động</div><div className="mt-3 text-lg">Vui lòng liên hệ thủ thư để được hỗ trợ.</div></>}
                {phase === "offline" && <><WifiOff className="mx-auto size-24" strokeWidth={1.5} /><div className="mt-6 text-3xl font-semibold">Mất kết nối</div><div className="mt-3 text-lg">Đang thử kết nối lại… Vui lòng liên hệ thủ thư nếu cần gấp.</div><Btn size="lg" className="mt-6" onClick={() => setPhase("ready")}>Thử lại</Btn></>}
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          {phase === "qr" ? (
            <Btn size="xl" variant="outline" className="h-20 rounded-3xl" onClick={() => setPhase("ready")}><ArrowLeft className="size-5" /> Quay lại nhận diện khuôn mặt</Btn>
          ) : (
            <>
              <Btn size="xl" className="h-24 rounded-3xl text-xl" onClick={() => startFace()} disabled={phase !== "ready"}><ScanFace className="size-7" /> Bắt đầu nhận diện</Btn>
              <Btn size="xl" variant="accent" className="h-20 rounded-3xl" onClick={() => setPhase("qr")} disabled={phase !== "ready" && phase !== "position"}><QrCode className="size-6" /> Sử dụng mã QR</Btn>
            </>
          )}
          <div className="flex-1 rounded-3xl bg-card p-6 shadow-soft">
            <div className="text-lg font-semibold">Hướng dẫn</div>
            <ol className="mt-4 space-y-4 text-base">
              {["Đứng cách kiosk khoảng 50 cm", "Nhìn thẳng, không đeo khẩu trang", "Chờ màn hình xác nhận màu xanh"].map((t, i) => <li key={t} className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-yellow font-semibold">{i + 1}</span>{t}</li>)}
            </ol>
            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
              Mô phỏng hướng dẫn: <button className="underline" onClick={() => startFace("Thiếu sáng — hãy đứng gần nguồn sáng hơn")}>thiếu sáng</button> · <button className="underline" onClick={() => startFace("Chưa thấy khuôn mặt — hãy nhìn vào camera")}>không có mặt</button> · <button className="underline" onClick={() => startFace("Có nhiều người — chỉ một người mỗi lượt")}>nhiều người</button>
            </div>
          </div>
        </div>
      </main>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-surface"><div className="relative flex h-[800px] w-[1280px] flex-col overflow-hidden bg-background">{children}</div></div>;
}
