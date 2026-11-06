import { createFileRoute } from "@tanstack/react-router";
import { RulesView } from "@/components/rules-view";
import { MHeader } from "@/components/mobile";

export const Route = createFileRoute("/student/account/rules")({
  head: () => ({ meta: [{ title: "Quy định thư viện — Sinh viên" }, { name: "description", content: "Giờ mở cửa và quy định." }, { property: "og:title", content: "Quy định thư viện" }, { property: "og:description", content: "Giờ mở cửa, sức chứa." }] }),
  component: R,
});

function R() {
  return (<><MHeader title="Quy định thư viện" back="/student/account" /><div className="px-5"><RulesView /></div></>);
}
