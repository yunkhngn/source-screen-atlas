import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QrCode, ScanFace, CheckCircle2, XCircle, Settings, WifiOff, Users, Moon, ShieldOff, ArrowLeft, Loader2, LogIn, LogOut, Camera } from "lucide-react";
import { useApp } from "@/lib/store";
import { fmtDate, fmtTime } from "@/lib/rules";
import { MODE_LABEL, type Kiosk } from "@/lib/mock";
import { Btn, Field, Input, Logo, Notice, PasswordInput } from "@/components/kit";
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
    const isIn = (id: string) => sessions.some((s) => s.subjectId === id && !s.exitAt);
    const pool = device!.mode === "ENTRY" ? st.filter((a) => !isIn(a.id)) : device!.mode === "EXIT" ? st.filter((a) => isIn(a.id)) : st;
    const who = (pool.length ? pool : st)[Math.floor(Math.random() * (pool.length || st.length))];
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
  const DirIcon = device?.mode === "EXIT" ? LogOut : LogIn;

  if (phase === "setup" || !device) {
    return (
      <div className="bg-mesh grid min-h-screen place-items-center p-6">
        <div className="animate-rise w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-pop">
          <Logo />
          <h1 className="mt-8 text-2xl font-semibold tracking-tight">Cài đặt thiết bị</h1>
          <p className="mt-1 text-sm text-muted-foreground">Dành cho quản trị viên. Nhập thông tin được cấp khi tạo kiosk.</p>
          <div className="mt-6 space-y-4">
            {setupErr && <Notice tone="danger">{setupErr}</Notice>}
            <Field label="Mã thiết bị"><Input value={devId} onChange={(e) => setDevId(e.target.value)} placeholder="VD: KIOSK-CỔNG-A" className="h-12 rounded-xl text-base" /></Field>
            <Field label="Mật khẩu thiết bị" hint="Demo: dùng KIOSK-CỔNG-A / KIOSK-TẦNG-2 với mật khẩu bất kỳ từ 8 ký tự"><PasswordInput value={secret} onChange={(e) => setSecret(e.target.value)} /></Field>
            <Btn size="lg" className="w-full shadow-glow" onClick={connect}>Kết nối</Btn>
            <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">← Cổng demo</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="bg-mesh relative flex h-[800px] w-[1280px] flex-col overflow-hidden rounded-[2rem] border border-border/60 shadow-pop">
        {/* Header */}
        <header className="flex items-center justify-between px-8 pt-6">
          <div className="rounded-2xl border border-border/60 bg-card px-4 py-2.5 shadow-soft"><Logo /></div>
          <div className="rounded-2xl border border-border/60 bg-card px-6 py-2 text-center shadow-soft">
            <div className="font-display text-2xl font-semibold tabular-nums tracking-tight">{fmtTime(now)}</div>
            <div className="text-xs text-muted-foreground">{fmtDate(now)}</div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card py-2 pl-4 pr-2 shadow-soft">
            <div className="text-right">
              <div className="text-sm font-medium">{device.name}</div>
              <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-success" />
                {MODE_LABEL[device.mode]}
              </div>
            </div>
            <button onClick={() => setAdmin(!admin)} aria-label="Cài đặt" className="grid size-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground"><Settings className="size-5" /></button>
          </div>
        </header>

        {admin && (
          <div className="animate-rise absolute right-8 top-24 z-30 w-72 space-y-1 rounded-2xl border border-border/60 bg-card p-3 text-sm shadow-pop">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Mô phỏng trạng thái</div>
            {([["full", "Thư viện đã đầy"], ["closed", "Ngoài giờ mở cửa"], ["offline", "Mất kết nối"], ["revoked", "Thiết bị bị thu hồi"]] as const).map(([p, l]) => <button key={p} onClick={() => { setPhase(p); setAdmin(false); }} className="block w-full rounded-xl px-3 py-2 text-left transition hover:bg-secondary">{l}</button>)}
            <button onClick={() => { setDevice(null); setPhase("setup"); setAdmin(false); }} className="block w-full rounded-xl px-3 py-2 text-left text-destructive transition hover:bg-pink-soft">Ngắt thiết bị</button>
          </div>
        )}

        <main className="grid flex-1 grid-cols-[1fr_360px] gap-6 p-8">
          {/* Camera area */}
          <div className="relative overflow-hidden rounded-3xl bg-[oklch(0.24_0.01_60)] shadow-pop">
            {/* ambient glow */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(36rem 24rem at 50% 115%, color-mix(in oklab, var(--primary) 30%, transparent), transparent 70%), radial-gradient(28rem 18rem at 85% -10%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)" }} />
            {phase === "qr" ? (
              <div className="relative grid h-full place-items-center">
                <div className="text-center">
                  <div className="relative mx-auto size-72">
                    <div className="absolute inset-0 rounded-3xl bg-card" />
                    <Corner className="left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl" />
                    <Corner className="right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl" />
                    <Corner className="bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl" />
                    <Corner className="bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl" />
                    <div className="animate-scan absolute inset-x-6 h-0.5 rounded-full bg-primary shadow-glow" />
                    <QrCode className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/40" strokeWidth={1.25} />
                  </div>
                  <div className="mt-6 text-2xl font-semibold text-white">Đưa mã QR vào khung</div>
                  <div className="mt-1 text-sm text-white/60">Mã trên ứng dụng sinh viên, còn hạn 30 giây</div>
                  <Btn size="lg" className="mt-6 shadow-glow" onClick={() => process("QR")}>Mô phỏng quét mã</Btn>
                </div>
              </div>
            ) : (
              <>
                {/* face frame */}
                <div className={cn("absolute left-1/2 top-1/2 h-[68%] aspect-[3/4] -translate-x-1/2 -translate-y-1/2 rounded-[46%] border-[3px] transition-all duration-500",
                  phase === "recognizing" ? "border-primary shadow-glow" : phase === "position" ? "border-warning" : "border-dashed border-white/30")} />
                {phase === "position" && <div className="absolute left-1/2 top-1/2 h-[68%] aspect-[3/4] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-[46%] border-2 border-warning/50" />}
                {phase === "recognizing" && <div className="animate-scan absolute inset-x-[28%] h-1 rounded-full bg-primary shadow-glow" />}
                {/* caption */}
                <div className="absolute inset-x-0 bottom-8 text-center">
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-lg font-medium text-white backdrop-blur-md">
                    {phase === "recognizing" ? <><Loader2 className="size-5 animate-spin text-primary" /> Đang nhận diện…</>
                      : phase === "position" ? guide ?? "Giữ yên, nhìn thẳng vào camera"
                      : <><DirIcon className="size-5 text-primary" /> Đưa khuôn mặt vào khung để ghi nhận {dirWord}</>}
                  </div>
                </div>
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs text-white/80 backdrop-blur-md">
                  <Camera className="size-3.5" /> Xem trước camera · không lưu hình
                </div>
              </>
            )}
            {/* overlays */}
            {["success", "fail", "full", "closed", "revoked", "offline"].includes(phase) && (
              <div className="animate-rise absolute inset-0 grid place-items-center bg-card">
                <div className="max-w-lg px-8 text-center">
                  {phase === "success" && <>
                    <div className="mx-auto grid size-24 place-items-center rounded-full bg-mint-soft"><CheckCircle2 className="size-14 text-success" strokeWidth={1.75} /></div>
                    <div className="mt-6 font-display text-4xl font-semibold tracking-tight">{result?.dir === "IN" ? "Chào mừng" : "Hẹn gặp lại"}, {result?.name.split(" ").pop()}!</div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm text-muted-foreground">Đã ghi nhận {result?.dir === "IN" ? "vào" : "ra"} lúc {fmtTime(now)}</div>
                  </>}
                  {phase === "fail" && <>
                    <div className="mx-auto grid size-24 place-items-center rounded-full bg-pink-soft"><XCircle className="size-14 text-destructive" strokeWidth={1.75} /></div>
                    <div className="mt-6 font-display text-3xl font-semibold tracking-tight">Chưa ghi nhận được</div>
                    <div className="mt-3 text-lg text-muted-foreground">{result?.msg ?? "Không nhận diện được khuôn mặt."} Vui lòng dùng mã QR hoặc liên hệ thủ thư.</div>
                  </>}
                  {phase === "full" && <>
                    <div className="mx-auto grid size-24 place-items-center rounded-full bg-pink-soft"><Users className="size-14 text-destructive" strokeWidth={1.75} /></div>
                    <div className="mt-6 font-display text-3xl font-semibold tracking-tight">Thư viện đã đầy</div>
                    <div className="mt-3 text-lg text-muted-foreground">Vui lòng quay lại sau. Lượt ra vẫn được ghi nhận bình thường.</div>
                  </>}
                  {phase === "closed" && <>
                    <div className="mx-auto grid size-24 place-items-center rounded-full bg-secondary"><Moon className="size-14 text-muted-foreground" strokeWidth={1.75} /></div>
                    <div className="mt-6 font-display text-3xl font-semibold tracking-tight">Thư viện đang đóng cửa</div>
                    <div className="mt-3 text-lg text-muted-foreground">Bạn vẫn có thể ghi nhận ra.</div>
                  </>}
                  {phase === "revoked" && <>
                    <div className="mx-auto grid size-24 place-items-center rounded-full bg-pink-soft"><ShieldOff className="size-14 text-destructive" strokeWidth={1.75} /></div>
                    <div className="mt-6 font-display text-3xl font-semibold tracking-tight">Thiết bị tạm ngừng hoạt động</div>
                    <div className="mt-3 text-lg text-muted-foreground">Vui lòng liên hệ thủ thư để được hỗ trợ.</div>
                  </>}
                  {phase === "offline" && <>
                    <div className="mx-auto grid size-24 place-items-center rounded-full bg-warning-soft"><WifiOff className="size-14 text-warning" strokeWidth={1.75} /></div>
                    <div className="mt-6 font-display text-3xl font-semibold tracking-tight">Mất kết nối</div>
                    <div className="mt-3 text-lg text-muted-foreground">Đang thử kết nối lại… Vui lòng liên hệ thủ thư nếu cần gấp.</div>
                    <Btn size="lg" className="mt-6 shadow-glow" onClick={() => setPhase("ready")}>Thử lại</Btn>
                  </>}
                </div>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4">
            {phase === "qr" ? (
              <Btn size="xl" variant="outline" className="h-20 rounded-2xl" onClick={() => setPhase("ready")}><ArrowLeft className="size-5" /> Quay lại nhận diện khuôn mặt</Btn>
            ) : (
              <>
                <button onClick={() => startFace()} disabled={phase !== "ready"}
                  className="bg-stripes group relative flex h-28 items-center justify-center gap-3 overflow-hidden rounded-2xl text-xl font-semibold text-primary-foreground shadow-glow transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                  <ScanFace className="size-8 transition-transform group-hover:scale-110" /> Bắt đầu nhận diện
                </button>
                <Btn size="xl" variant="outline" className="h-20 rounded-2xl border-2" onClick={() => setPhase("qr")} disabled={phase !== "ready" && phase !== "position"}><QrCode className="size-6" /> Sử dụng mã QR</Btn>
              </>
            )}
            <div className="flex-1 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="font-display text-lg font-semibold">Hướng dẫn</div>
              <ol className="mt-4 space-y-4 text-[15px]">
                {["Đứng cách kiosk khoảng 50 cm", "Nhìn thẳng, không đeo khẩu trang", "Chờ màn hình xác nhận màu xanh"].map((t, i) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{i + 1}</span>{t}
                  </li>
                ))}
              </ol>
              <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
                Mô phỏng hướng dẫn: <button className="underline decoration-primary/40 underline-offset-2 hover:text-foreground" onClick={() => startFace("Thiếu sáng — hãy đứng gần nguồn sáng hơn")}>thiếu sáng</button> · <button className="underline decoration-primary/40 underline-offset-2 hover:text-foreground" onClick={() => startFace("Chưa thấy khuôn mặt — hãy nhìn vào camera")}>không có mặt</button> · <button className="underline decoration-primary/40 underline-offset-2 hover:text-foreground" onClick={() => startFace("Có nhiều người — chỉ một người mỗi lượt")}>nhiều người</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return <div className={cn("absolute size-10 border-primary", className)} />;
}
