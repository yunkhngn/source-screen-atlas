import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, KeyRound, LogOut, ScanFace, BookOpenText } from "lucide-react";
import { useApp, useMe } from "@/lib/store";
import { ROLE_LABEL } from "@/lib/rules";
import { Avatar, Badge, Confirm } from "@/components/kit";
import { MHeader } from "@/components/mobile";

export const Route = createFileRoute("/student/account/")({
  head: () => ({ meta: [{ title: "Tài khoản — Sinh viên" }, { name: "description", content: "Thông tin tài khoản sinh viên." }, { property: "og:title", content: "Tài khoản sinh viên" }, { property: "og:description", content: "Hồ sơ và cài đặt." }] }),
  component: Account,
});

function Account() {
  const me = useMe()!;
  const enr = useApp((s) => s.enrollment);
  const logout = useApp((s) => s.logout);
  const navigate = useNavigate();
  const [out, setOut] = useState(false);
  const Row = ({ to, icon, label, right }: { to: string; icon: React.ReactNode; label: string; right?: React.ReactNode }) => (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5"><span className="grid size-9 place-items-center rounded-xl bg-secondary">{icon}</span><span className="flex-1 text-sm font-medium">{label}</span>{right}<ChevronRight className="size-4 text-muted-foreground" /></Link>
  );
  return (
    <>
      <MHeader title="Tài khoản" />
      <div className="space-y-4 px-5">
        <div className="flex items-center gap-4 rounded-3xl bg-yellow p-5"><Avatar name={me.name} className="size-14 bg-card text-base" /><div><div className="text-lg font-semibold">{me.name}</div><div className="text-sm">{ROLE_LABEL[me.role]}</div></div></div>
        <dl className="divide-y divide-border rounded-2xl bg-card text-sm shadow-soft">
          <div className="flex justify-between px-4 py-3"><dt className="text-muted-foreground">Mã tài khoản</dt><dd className="font-medium">{me.code}</dd></div>
          <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">Email</dt><dd className="truncate font-medium">{me.email}</dd></div>
        </dl>
        <div className="divide-y divide-border rounded-2xl bg-card shadow-soft">
          <Row to="/student/face" icon={<ScanFace className="size-4" />} label="Khuôn mặt" right={enr.status === "ENROLLED" ? <Badge tone="success">Đã đăng ký</Badge> : <Badge>Chưa đăng ký</Badge>} />
          <Row to="/student/account/password" icon={<KeyRound className="size-4" />} label="Đổi mật khẩu" />
          <Row to="/student/account/rules" icon={<BookOpenText className="size-4" />} label="Quy định thư viện" />
        </div>
        <button onClick={() => setOut(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3.5 text-sm font-medium text-destructive shadow-soft"><LogOut className="size-4" /> Đăng xuất</button>
        <p className="text-center text-xs text-muted-foreground">Cần sửa thông tin? Vui lòng liên hệ quản trị viên.</p>
      </div>
      <Confirm open={out} onOpenChange={setOut} title="Đăng xuất?" desc="Bạn sẽ cần đăng nhập lại để dùng mã QR." confirmLabel="Đăng xuất" onConfirm={() => { logout(); navigate({ to: "/login" }); }} />
    </>
  );
}
