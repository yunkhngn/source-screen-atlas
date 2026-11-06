import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useApp } from "@/lib/store";
import { fmtDate, fmtDuration, pad } from "@/lib/rules";
import { METHOD_LABEL } from "@/lib/mock";
import { Card, Field, Input, Notice, PageHeader, Segmented, Stat, Empty } from "@/components/kit";

export const Route = createFileRoute("/_desk/admin/analytics")({
  head: () => ({ meta: [{ title: "Thống kê — Quản trị" }, { name: "description", content: "Thống kê lượt ra vào và nhận diện khuôn mặt." }, { property: "og:title", content: "Thống kê" }, { property: "og:description", content: "Lượt ra vào và nhận diện." }] }),
  component: Analytics,
});

const toInput = (d: number) => new Date(d - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const COLORS = ["var(--chart-3)", "var(--chart-1)", "var(--chart-4)", "var(--chart-2)"];

function Analytics() {
  const sessions = useApp((s) => s.sessions);
  const [tab, setTab] = useState<"access" | "recog">("access");
  const [from, setFrom] = useState(toInput(Date.now() - 14 * 86400000));
  const [to, setTo] = useState(toInput(Date.now()));
  const [group, setGroup] = useState<"day" | "hour">("day");
  const f = new Date(from).setHours(0, 0, 0, 0), t = new Date(to).setHours(23, 59, 59, 999);
  const days = Math.round((t - f) / 86400000);
  const rangeErr = t < f ? "Ngày kết thúc phải sau ngày bắt đầu." : days > 366 ? "Khoảng thời gian tối đa là 366 ngày." : group === "hour" && days > 31 ? "Nhóm theo giờ chỉ hỗ trợ tối đa 31 ngày." : null;
  const inRange = sessions.filter((s) => s.entryAt >= f && s.entryAt <= t);
  const closed = inRange.filter((s) => s.exitAt);
  const avg = closed.length ? closed.reduce((a, s) => a + (s.exitAt! - s.entryAt), 0) / closed.length : null;

  const buckets = new Map<string, { k: string; vao: number; ra: number }>();
  for (const s of inRange) {
    const d = new Date(s.entryAt);
    const k = group === "day" ? fmtDate(d).slice(0, 5) : `${pad(d.getHours())}h`;
    const b = buckets.get(k) ?? { k, vao: 0, ra: 0 };
    b.vao++; if (s.exitAt) b.ra++;
    buckets.set(k, b);
  }
  const series = [...buckets.values()].reverse();
  if (group === "hour") series.sort((a, b) => a.k.localeCompare(b.k));
  const methods = (["FACE", "QR", "MANUAL"] as const).map((m) => ({ name: METHOD_LABEL[m], value: inRange.filter((s) => s.entryMethod === m).length })).filter((x) => x.value);

  // recognition (mock aggregate derived from face-based sessions)
  const faces = inRange.filter((s) => s.entryMethod === "FACE").length;
  const attempts = faces ? Math.round(faces * 1.18) : 0;
  const failed = attempts - faces;
  const outcomes = [{ name: "Khớp danh tính", value: faces }, { name: "Không tìm thấy khuôn mặt", value: Math.ceil(failed * 0.4) }, { name: "Không khớp", value: Math.floor(failed * 0.35) }, { name: "Không đạt kiểm tra thật", value: failed - Math.ceil(failed * 0.4) - Math.floor(failed * 0.35) }].filter((x) => x.value > 0);

  return (
    <>
      <PageHeader title="Thống kê" crumbs={["Quản trị", "Thống kê"]} actions={<Segmented value={tab} onChange={setTab} options={[{ value: "access", label: "Lượt ra vào" }, { value: "recog", label: "Nhận diện" }]} />} />
      <Card className="mb-5 flex flex-wrap items-end gap-4 p-5">
        <Field label="Từ ngày"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Đến ngày"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        {tab === "access" && <div><div className="mb-1.5 text-sm font-medium">Nhóm theo</div><Segmented value={group} onChange={setGroup} options={[{ value: "day", label: "Ngày" }, { value: "hour", label: "Giờ" }]} /></div>}
        <div className="ml-auto text-sm text-muted-foreground">Kỳ: {fmtDate(f)} – {fmtDate(t)}</div>
      </Card>
      {rangeErr ? <Notice tone="danger">{rangeErr}</Notice> : tab === "access" ? (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            <Stat label="Tổng lượt vào" value={inRange.length || "Chưa có dữ liệu"} color="mint" />
            <Stat label="Tổng lượt ra" value={closed.length || "Chưa có dữ liệu"} color="sky" />
            <Stat label="Thời gian ở trung bình (lượt đã kết thúc)" value={avg ? fmtDuration(avg) : "Chưa có dữ liệu"} color="yellow" />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 font-semibold">Lượt vào và ra</div>
              {series.length === 0 ? <Empty title="Chưa có dữ liệu" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={series}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="k" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} /><Tooltip cursor={{ fill: "var(--secondary)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} /><Legend /><Bar dataKey="vao" name="Vào" fill="var(--chart-3)" radius={[6, 6, 0, 0]} /><Bar dataKey="ra" name="Ra" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Card className="p-5">
              <div className="mb-4 font-semibold">Phương thức vào</div>
              {methods.length === 0 ? <Empty title="Chưa có dữ liệu" /> : (
                <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={methods} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>{methods.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
              )}
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-4">
            <Stat label="Tổng lượt nhận diện" value={attempts || "Chưa có dữ liệu"} />
            <Stat label="Khớp danh tính" value={faces || "—"} color="mint" />
            <Stat label="Không khớp / lỗi" value={attempts ? `${failed} (${Math.round((failed / attempts) * 100)}%)` : "—"} color="pink" />
            <Stat label="Thời gian xử lý" value={attempts ? "P50 412ms" : "—"} sub={attempts ? "P95 968ms" : undefined} color="sky" />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 font-semibold">Phân loại kết quả</div>
              {outcomes.length === 0 ? <Empty title="Chưa có dữ liệu" /> : <ResponsiveContainer width="100%" height={260}><BarChart data={outcomes} layout="vertical"><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={180} tickLine={false} axisLine={false} fontSize={12} /><Tooltip /><Bar dataKey="value" name="Số lượt" radius={[0, 6, 6, 0]}>{outcomes.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Bar></BarChart></ResponsiveContainer>}
            </Card>
            <Notice tone="info" title="Cách đọc số liệu">"Khớp danh tính" nghĩa là hệ thống nhận ra người dùng; điều đó không đồng nghĩa lượt vào/ra được chấp nhận (ví dụ thư viện đã đầy). Tỷ lệ khớp không phải là độ chính xác của mô hình.</Notice>
          </div>
        </>
      )}
    </>
  );
}
