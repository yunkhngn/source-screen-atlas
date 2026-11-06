import { createFileRoute } from "@tanstack/react-router";
import { SessionStatus, type StatusKind } from "@/components/session-status";

export const Route = createFileRoute("/session")({
  validateSearch: (s: Record<string, unknown>): { kind: StatusKind } => ({ kind: (["expired", "forbidden", "missing"].includes(s.kind as string) ? s.kind : "expired") as StatusKind }),
  head: () => ({
    meta: [
      { title: "Trạng thái phiên — Cổng Thư Viện" },
      { name: "description", content: "Phiên đăng nhập hết hạn hoặc không có quyền truy cập." },
      { property: "og:title", content: "Trạng thái phiên" },
      { property: "og:description", content: "Thông báo phiên đăng nhập." },
    ],
  }),
  component: SessionPage,
});

function SessionPage() {
  return <SessionStatus kind={Route.useSearch().kind} />;
}
