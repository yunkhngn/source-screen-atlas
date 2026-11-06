import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/kit";
import { RulesView } from "@/components/rules-view";

export const Route = createFileRoute("/_desk/librarian/rules")({
  head: () => ({ meta: [{ title: "Quy định thư viện" }, { name: "description", content: "Giờ mở cửa, sức chứa và quy định thời gian ở." }, { property: "og:title", content: "Quy định thư viện" }, { property: "og:description", content: "Quy định vận hành." }] }),
  component: Rules,
});

function Rules() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Quy định thư viện" crumbs={["Cá nhân", "Quy định"]} sub="Chỉ xem. Quản trị viên thay đổi trong Cấu hình hệ thống." />
      <RulesView />
    </div>
  );
}
