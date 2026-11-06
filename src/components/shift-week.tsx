import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Shift } from "@/lib/mock";
import { fmtDate, fmtTime } from "@/lib/rules";
import { Btn } from "@/components/kit";
import { cn } from "@/lib/utils";

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export const DAY = 86400000;

export function mondayOf(offsetWeeks: number) {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offsetWeeks * 7);
  return d.getTime();
}

export function WeekNav({ week, setWeek }: { week: number; setWeek: (n: number) => void }) {
  const start = mondayOf(week);
  return (
    <div className="flex items-center gap-2">
      <Btn variant="outline" size="sm" onClick={() => setWeek(week - 1)} aria-label="Tuần trước"><ChevronLeft className="size-4" /></Btn>
      <Btn variant="outline" size="sm" onClick={() => setWeek(0)}>Hôm nay</Btn>
      <Btn variant="outline" size="sm" onClick={() => setWeek(week + 1)} aria-label="Tuần sau"><ChevronRight className="size-4" /></Btn>
      <span className="ml-2 text-sm font-medium">{fmtDate(start)} – {fmtDate(start + 6 * DAY)}</span>
    </div>
  );
}

export function ShiftWeek({ shifts, week, onPick, staffName }: { shifts: Shift[]; week: number; onPick: (s: Shift) => void; staffName?: (id: string) => string }) {
  const start = mondayOf(week);
  const today = new Date().setHours(0, 0, 0, 0);
  return (
    <div className="grid grid-cols-7 gap-2">
      {DAYS.map((d, i) => {
        const day = start + i * DAY;
        const items = shifts.filter((s) => s.start >= day && s.start < day + DAY).sort((a, b) => a.start - b.start);
        return (
          <div key={d} className={cn("min-h-64 rounded-2xl border border-border p-2", day === today ? "bg-yellow-soft" : "bg-card")}>
            <div className="mb-2 px-1 text-xs"><span className="font-semibold">{d}</span> <span className="text-muted-foreground">{fmtDate(day).slice(0, 5)}</span></div>
            <div className="space-y-1.5">
              {items.map((s) => {
                const overnight = new Date(s.end).getDate() !== new Date(s.start).getDate();
                return (
                  <button key={s.id} onClick={() => onPick(s)} className={cn("w-full rounded-xl p-2 text-left text-xs transition hover:shadow-soft", s.status === "CANCELLED" ? "bg-secondary text-muted-foreground line-through" : s.name.includes("sáng") ? "bg-sky-soft" : s.name.includes("chiều") ? "bg-mint-soft" : "bg-pink-soft")}>
                    <div className="font-semibold">{s.name}</div>
                    <div>{fmtTime(s.start)} – {fmtTime(s.end)}{overnight && ` (${fmtDate(s.end).slice(0, 5)})`}</div>
                    {staffName && <div className="mt-1 truncate text-muted-foreground">{s.staff.map(staffName).join(", ") || "Chưa phân công"}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
