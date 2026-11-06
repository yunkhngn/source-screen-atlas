import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PasswordForm } from "@/components/password-form";
import { MHeader } from "@/components/mobile";

export const Route = createFileRoute("/student/account/password")({
  head: () => ({ meta: [{ title: "Đổi mật khẩu — Sinh viên" }, { name: "description", content: "Đổi mật khẩu tài khoản." }, { property: "og:title", content: "Đổi mật khẩu" }, { property: "og:description", content: "Cập nhật mật khẩu." }] }),
  component: Pw,
});

function Pw() {
  const navigate = useNavigate();
  return (
    <>
      <MHeader title="Đổi mật khẩu" back="/student/account" />
      <div className="px-5"><PasswordForm onDone={() => { toast.success("Đã đổi mật khẩu"); navigate({ to: "/student/account" }); }} /></div>
    </>
  );
}
