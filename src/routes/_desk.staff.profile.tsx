import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useMe } from "@/lib/store";
import { ROLE_LABEL } from "@/lib/rules";
import { Avatar, Card, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_desk/staff/profile")({
  head: () => ({ meta: [{ title: "Hồ sơ tài khoản" }, { name: "description", content: "Thông tin tài khoản nhân viên." }, { property: "og:title", content: "Hồ sơ tài khoản" }, { property: "og:description", content: "Thông tin chỉ đọc." }] }),
  component: Profile,
});

function Profile() {
  const me = useMe()!;
  return (
    <>
      <PageHeader title="Hồ sơ tài khoản" />
      <Card className="max-w-xl p-6">
        <div className="flex items-center gap-4"><Avatar name={me.name} className="size-14 text-base" /><div><div className="text-lg font-semibold">{me.name}</div><div className="text-sm text-muted-foreground">{ROLE_LABEL[me.role]}</div></div></div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-muted-foreground">Mã tài khoản</dt><dd className="font-medium">{me.code}</dd></div>
          <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{me.email}</dd></div>
        </dl>
        <p className="mt-5 text-xs text-muted-foreground">Thông tin hồ sơ do quản trị viên quản lý.</p>
        <Link to="/staff/change-password" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-input px-4 text-sm font-medium hover:bg-secondary"><KeyRound className="size-4" /> Đổi mật khẩu</Link>
      </Card>
    </>
  );
}
