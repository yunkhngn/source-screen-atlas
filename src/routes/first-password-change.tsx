import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useApp, useMe } from "@/lib/store";
import { homeFor } from "@/lib/rules";
import { Btn, Card, Logo } from "@/components/kit";
import { PasswordForm } from "@/components/password-form";

export const Route = createFileRoute("/first-password-change")({
  head: () => ({
    meta: [
      { title: "Đổi mật khẩu lần đầu — Cổng Thư Viện" },
      { name: "description", content: "Bạn cần đổi mật khẩu được cấp trước khi sử dụng hệ thống." },
      { property: "og:title", content: "Đổi mật khẩu lần đầu" },
      { property: "og:description", content: "Bắt buộc đổi mật khẩu ban đầu." },
    ],
  }),
  component: FirstChange,
});

function FirstChange() {
  const me = useMe();
  const clear = useApp((s) => s.clearMustChange);
  const logout = useApp((s) => s.logout);
  const navigate = useNavigate();
  if (!me) return <Navigate to="/login" />;
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card className="p-7">
          <div className="mb-5 flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow"><ShieldAlert className="size-5" /></span>
            <div>
              <h1 className="text-lg font-semibold">Đổi mật khẩu ban đầu</h1>
              <p className="text-sm text-muted-foreground">Mật khẩu được quản trị viên cấp phải được thay đổi trước khi bạn tiếp tục.</p>
            </div>
          </div>
          <PasswordForm submitLabel="Đổi mật khẩu và tiếp tục" onDone={() => { clear(); toast.success("Đã đổi mật khẩu"); navigate({ to: homeFor(me.role) }); }} />
          <Btn variant="ghost" className="mt-3 w-full" onClick={() => { logout(); navigate({ to: "/login" }); }}>Đăng xuất</Btn>
        </Card>
      </div>
    </div>
  );
}
