import { createFileRoute } from "@tanstack/react-router";
import { SessionStatus } from "./session";

export const Route = createFileRoute("/forbidden")({
  head: () => ({
    meta: [
      { title: "Không có quyền truy cập — Cổng Thư Viện" },
      { name: "description", content: "Tài khoản không có quyền truy cập trang này." },
      { property: "og:title", content: "Không có quyền truy cập" },
      { property: "og:description", content: "Trang bị giới hạn theo vai trò." },
    ],
  }),
  component: () => <SessionStatus kind="forbidden" />,
});
