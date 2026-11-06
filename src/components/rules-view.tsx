import { Clock, Users, Timer } from "lucide-react";
import { useApp } from "@/lib/store";
import { Card, Notice } from "@/components/kit";

export function RulesView() {
  const c = useApp((s) => s.config);
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2 font-semibold"><Clock className="size-4" /> Giờ mở cửa</div>
        <ul className="divide-y divide-border text-sm">
          {c.hours.map((h) => <li key={h.day} className="flex justify-between py-2"><span>{h.day}</span><span className={h.closed ? "text-muted-foreground" : "font-medium"}>{h.closed ? "Đóng cửa" : `${h.open} – ${h.close}`}</span></li>)}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">Múi giờ: Việt Nam (UTC+7)</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="size-4" /> Sức chứa</div><div className="mt-1 text-2xl font-semibold">{c.capacity} người</div></Card>
        <Card className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Timer className="size-4" /> Thời gian ở tối đa</div><div className="mt-1 text-2xl font-semibold">{c.maxStayHours ? `${c.maxStayHours} giờ` : "Không giới hạn"}</div></Card>
      </div>
      <Notice tone="info">Ngoài giờ mở cửa vẫn có thể ghi nhận ra. Khi thư viện đóng cửa hoặc vượt thời gian ở tối đa, lượt đang mở sẽ được hệ thống tự kết thúc.</Notice>
    </div>
  );
}
