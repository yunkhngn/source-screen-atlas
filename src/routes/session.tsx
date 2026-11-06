import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Lock, SearchX } from "lucide-react";
import { useApp } from "@/lib/store";
import { Logo } from "@/components/kit";

type Kind = "expired" | "forbidden" | "missing";
export const Route = createFileRoute("/session")({
  validateSearch: (s: Record<string, unknown>): { kind: Kind } => ({ kind: (["expired", "forbidden", "missing"].includes(s.kind as string) ? s.kind : "expired") as Kind }),
  head: () => ({
    meta: [
      { title: "Trạng thái phiên — Cổng Thư Viện" },
      { name: "description", content: "Phiên đăng nhập hết hạn hoặc không có quyền truy cập." },
      { property: "og:title", content: "Trạng thái phiên" },
      { property: "og:description", content: "Thông báo phiên đăng nhập." },
    ],
  }),
  component: () => <SessionStatus kind={Route.useSearch().kind} />,
});

const COPY = {
  expired: { icon: Clock, bg: "bg-yellow", title: "Phiên đăng nhập đã hết hạn", desc: "Vì lý do an toàn, vui lòng đăng nhập lại để tiếp tục.", cta: "Đăng nhập lại" },
  forbidden: { icon: Lock, bg: "bg-pink", title: "Bạn không có quyền truy cập", desc: "Trang này không thuộc phạm vi vai trò của tài khoản hiện tại.", cta: "Về trang chính" },
  missing: { icon: SearchX, bg: "bg-sky", title: "Không tìm thấy dữ liệu", desc: "Nội dung bạn tìm không tồn tại hoặc đã bị thay đổi.", cta: "Về trang chính" },
};

export function SessionStatus({ kind }: { kind: Kind }) {
  const c = COPY[kind];
  const logout = useApp((s) => s.logout);
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="max-w-sm text-center">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className={`mx-auto mb-5 grid size-16 place-items-center rounded-3xl ${c.bg}`}><c.icon className="size-7" /></div>
        <h1 className="text-xl font-semibold">{c.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
        <Link to={kind === "expired" ? "/login" : "/"} onClick={() => kind === "expired" && logout()} className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">{c.cta}</Link>
      </div>
    </div>
  );
}
