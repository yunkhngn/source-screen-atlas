import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/kit";
import { PasswordForm } from "@/components/password-form";

export const Route = createFileRoute("/_desk/staff/change-password")({
  head: () => ({ meta: [{ title: "Đổi mật khẩu" }, { name: "description", content: "Đổi mật khẩu tài khoản nhân viên." }, { property: "og:title", content: "Đổi mật khẩu" }, { property: "og:description", content: "Cập nhật mật khẩu." }] }),
  component: ChangePw,
});

function ChangePw() {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="Đổi mật khẩu" crumbs={["Tài khoản", "Đổi mật khẩu"]} />
      <Card className="max-w-md p-6"><PasswordForm onDone={() => { toast.success("Đã đổi mật khẩu"); navigate({ to: "/staff/profile" }); }} /></Card>
    </>
  );
}
