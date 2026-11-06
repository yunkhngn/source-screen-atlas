import type { Role } from "./rules";

export type Account = { id: string; code: string; name: string; email: string; role: Role; status: "ACTIVE" | "LOCKED"; mustChange?: boolean };
export type Method = "FACE" | "QR" | "MANUAL" | "AUTO";
export type Session = {
  id: string;
  subjectType: "STUDENT" | "VISITOR";
  subjectId: string;
  name: string;
  code: string;
  entryAt: number;
  entryMethod: Method;
  entryActor: string;
  exitAt?: number;
  exitMethod?: Method;
  exitActor?: string;
  reason?: string;
  autoClose?: "CLOSING" | "MAX_STAY";
};
export type Visitor = { id: string; name: string; ref: string; createdAt: number };
export type Kiosk = { id: string; code: string; name: string; mode: "ENTRY" | "EXIT" | "AUTO"; status: "ACTIVE" | "REVOKED"; lastSeen: number; camera: "OK" | "UNAVAILABLE"; version: string };
export type Shift = { id: string; name: string; start: number; end: number; status: "ACTIVE" | "CANCELLED"; staff: string[]; cancelReason?: string };

export const METHOD_LABEL: Record<Method, string> = { FACE: "Khuôn mặt", QR: "Mã QR", MANUAL: "Thủ công", AUTO: "Tự động" };
export const MODE_LABEL = { ENTRY: "Chỉ vào", EXIT: "Chỉ ra", AUTO: "Tự động" } as const;

const NOW = Date.now();
const H = 3600_000;
const M = 60_000;

const familyNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô", "Dương", "Lý"];
const middle = ["Văn", "Thị", "Minh", "Đức", "Ngọc", "Quang", "Thu", "Hải", "Gia", "Bảo"];
const given = ["An", "Bình", "Châu", "Dũng", "Giang", "Hà", "Huy", "Khánh", "Linh", "Long", "My", "Nam", "Phương", "Quân", "Sơn", "Thảo", "Trang", "Tú", "Vy", "Yến"];
const nm = (i: number) => `${familyNames[i % 12]} ${middle[(i * 3) % 10]} ${given[(i * 7) % 20]}`;
const slug = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().split(" ");

export const ME_STUDENT = "u-st-0";
export const ME_LIBRARIAN = "u-lb-0";
export const ME_ADMIN = "u-ad-0";

export function seedAccounts(): Account[] {
  const list: Account[] = [
    { id: ME_ADMIN, code: "QT001", name: "Phạm Thu Hà", email: "ha.pt@thuvien.edu.vn", role: "ADMIN", status: "ACTIVE" },
    { id: "u-ad-1", code: "QT002", name: "Đỗ Quang Huy", email: "huy.dq@thuvien.edu.vn", role: "ADMIN", status: "ACTIVE" },
    { id: ME_LIBRARIAN, code: "TT001", name: "Lê Ngọc Linh", email: "linh.ln@thuvien.edu.vn", role: "LIBRARIAN", status: "ACTIVE" },
    { id: "u-lb-1", code: "TT002", name: "Trần Minh Quân", email: "quan.tm@thuvien.edu.vn", role: "LIBRARIAN", status: "ACTIVE" },
    { id: "u-lb-2", code: "TT003", name: "Vũ Thị Yến", email: "yen.vt@thuvien.edu.vn", role: "LIBRARIAN", status: "ACTIVE" },
    { id: "u-lb-3", code: "TT004", name: "Bùi Gia Bảo", email: "bao.bg@thuvien.edu.vn", role: "LIBRARIAN", status: "LOCKED" },
    { id: ME_STUDENT, code: "SV2201234", name: "Nguyễn Minh Anh", email: "anh.nm2201234@sv.edu.vn", role: "STUDENT", status: "ACTIVE" },
  ];
  for (let i = 1; i <= 46; i++) {
    const n = nm(i);
    const p = slug(n);
    const code = `SV22${String(10000 + i * 37).slice(-5)}`;
    list.push({ id: `u-st-${i}`, code, name: n, email: `${p[2]}.${p[0][0]}${p[1][0]}${code.slice(2)}@sv.edu.vn`, role: "STUDENT", status: i % 13 === 0 ? "LOCKED" : "ACTIVE", mustChange: i % 9 === 0 });
  }
  return list;
}

export function seedVisitors(): Visitor[] {
  return [
    { id: "v1", name: "Trương Hoài Nam", ref: "CCCD 079203004512", createdAt: NOW - 2 * H },
    { id: "v2", name: "Lâm Thị Mai", ref: "Thẻ GV-ĐHKHTN 0331", createdAt: NOW - 26 * H },
    { id: "v3", name: "Hồ Đức Thịnh", ref: "CCCD 001198007731", createdAt: NOW - 3 * 24 * H },
    { id: "v4", name: "Kiều Phương Thảo", ref: "Giấy giới thiệu số 12/2026", createdAt: NOW - 6 * 24 * H },
  ];
}

export function seedSessions(accounts: Account[], visitors: Visitor[]): Session[] {
  const students = accounts.filter((a) => a.role === "STUDENT");
  const out: Session[] = [];
  const methods: Method[] = ["FACE", "FACE", "QR", "FACE", "MANUAL"];
  // open sessions
  for (let i = 1; i <= 23; i++) {
    const s = students[i];
    const m = methods[i % 5];
    out.push({ id: `s-open-${i}`, subjectType: "STUDENT", subjectId: s.id, name: s.name, code: s.code, entryAt: NOW - (i * 11 + 4) * M, entryMethod: m, entryActor: m === "MANUAL" ? "Lê Ngọc Linh" : "KIOSK-CỔNG-A", reason: m === "MANUAL" ? "Kiosk không nhận diện được" : undefined });
  }
  out.push({ id: "s-open-v1", subjectType: "VISITOR", subjectId: "v1", name: visitors[0].name, code: visitors[0].ref, entryAt: NOW - 95 * M, entryMethod: "MANUAL", entryActor: "Lê Ngọc Linh", reason: "Khách tham quan theo lịch hẹn" });
  // me (student) — open
  const me = students[0];
  out.push({ id: "s-me-open", subjectType: "STUDENT", subjectId: me.id, name: me.name, code: me.code, entryAt: NOW - 72 * M, entryMethod: "FACE", entryActor: "KIOSK-CỔNG-A" });
  // closed history
  for (let d = 1; d <= 40; d++) {
    const s = d % 3 === 0 ? me : students[(d * 5) % students.length];
    const entry = NOW - d * 24 * H - ((d * 37) % 300) * M;
    const auto = d % 11 === 0 ? (d % 2 ? "CLOSING" : "MAX_STAY") : undefined;
    const em = methods[d % 5];
    out.push({
      id: `s-${d}`, subjectType: "STUDENT", subjectId: s.id, name: s.name, code: s.code,
      entryAt: entry, entryMethod: em, entryActor: em === "MANUAL" ? "Trần Minh Quân" : "KIOSK-CỔNG-A",
      exitAt: entry + (60 + ((d * 53) % 240)) * M,
      exitMethod: auto ? "AUTO" : methods[(d + 2) % 5], exitActor: auto ? "Hệ thống" : "KIOSK-CỔNG-B",
      autoClose: auto as Session["autoClose"], reason: em === "MANUAL" ? "Sinh viên quên điện thoại" : undefined,
    });
  }
  out.push({ id: "s-v2", subjectType: "VISITOR", subjectId: "v2", name: visitors[1].name, code: visitors[1].ref, entryAt: NOW - 25 * H, entryMethod: "MANUAL", entryActor: "Trần Minh Quân", exitAt: NOW - 23 * H, exitMethod: "MANUAL", exitActor: "Trần Minh Quân", reason: "Giảng viên khách mời" });
  return out.sort((a, b) => b.entryAt - a.entryAt);
}

export function seedKiosks(): Kiosk[] {
  return [
    { id: "k1", code: "KIOSK-CỔNG-A", name: "Cổng chính – lối vào", mode: "ENTRY", status: "ACTIVE", lastSeen: NOW - 20_000, camera: "OK", version: "1.4.2" },
    { id: "k2", code: "KIOSK-CỔNG-B", name: "Cổng chính – lối ra", mode: "EXIT", status: "ACTIVE", lastSeen: NOW - 45_000, camera: "OK", version: "1.4.2" },
    { id: "k3", code: "KIOSK-TẦNG-2", name: "Sảnh tầng 2", mode: "AUTO", status: "ACTIVE", lastSeen: NOW - 3 * H, camera: "UNAVAILABLE", version: "1.3.9" },
    { id: "k4", code: "KIOSK-CŨ-01", name: "Thiết bị thử nghiệm", mode: "AUTO", status: "REVOKED", lastSeen: NOW - 20 * 24 * H, camera: "OK", version: "1.2.0" },
  ];
}

export function seedShifts(): Shift[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  const at = (day: number, h: number) => monday.getTime() + day * 24 * H + h * H;
  const out: Shift[] = [];
  for (let d = -7; d < 14; d++) {
    out.push({ id: `sh-${d}-m`, name: "Ca sáng", start: at(d, 7), end: at(d, 12), status: "ACTIVE", staff: d % 2 ? [ME_LIBRARIAN] : ["u-lb-1"] });
    out.push({ id: `sh-${d}-a`, name: "Ca chiều", start: at(d, 12), end: at(d, 17), status: d === 3 ? "CANCELLED" : "ACTIVE", staff: d % 2 ? ["u-lb-2"] : [ME_LIBRARIAN, "u-lb-2"], cancelReason: d === 3 ? "Thư viện bảo trì hệ thống điện" : undefined });
    if (d % 7 === 4) out.push({ id: `sh-${d}-n`, name: "Ca tối – mùa thi", start: at(d, 17), end: at(d, 23), status: "ACTIVE", staff: ["u-lb-1"] });
    if (d % 7 === 5) out.push({ id: `sh-${d}-o`, name: "Ca qua đêm – ôn thi", start: at(d, 22), end: at(d + 1, 6), status: "ACTIVE", staff: [ME_LIBRARIAN] });
  }
  return out;
}

export type Config = {
  hours: { day: string; closed: boolean; open: string; close: string }[];
  capacity: number;
  warnPct: number;
  enforce: boolean;
  maxStayHours: number | null;
  cooldownSec: number;
  modelVersion: string;
  maxDistance: string;
  minGap: string;
  minLiveness: string;
};

export const seedConfig = (): Config => ({
  hours: ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"].map((day, i) => ({ day, closed: i === 6, open: i === 5 ? "08:00" : "07:00", close: i === 5 ? "17:00" : "21:30" })),
  capacity: 30,
  warnPct: 80,
  enforce: true,
  maxStayHours: 8,
  cooldownSec: 10,
  modelVersion: "",
  maxDistance: "",
  minGap: "",
  minLiveness: "",
});
