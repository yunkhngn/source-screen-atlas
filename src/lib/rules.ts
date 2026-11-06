// Business rules mirrored from the source repository (DESIGN_SYSTEM.md + router.dart).
export type Role = "STUDENT" | "LIBRARIAN" | "ADMIN";

export const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Sinh viên",
  LIBRARIAN: "Thủ thư",
  ADMIN: "Quản trị viên",
};

export const QR_VALIDITY_SECONDS = 30;
export const SHIFT_MAX_HOURS = 24;
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 64;
export const PASSWORD_MAX_BYTES = 72;
export const ENROLL_MIN_IMAGES = 3;
export const ENROLL_MAX_IMAGES = 5;

export function canAccess(role: Role, path: string): boolean {
  if (path.startsWith("/admin/")) return role === "ADMIN";
  if (path.startsWith("/librarian/")) return role === "LIBRARIAN";
  if (path.startsWith("/staff/")) return role === "LIBRARIAN" || role === "ADMIN";
  if (path.startsWith("/student/")) return role === "STUDENT";
  return true;
}

export function homeFor(role: Role): string {
  return role === "ADMIN" ? "/admin/overview" : role === "LIBRARIAN" ? "/librarian/overview" : "/student/home";
}

export function qrRemaining(issuedAt: number, now: number): number {
  return Math.max(0, QR_VALIDITY_SECONDS - Math.floor((now - issuedAt) / 1000));
}

export function validatePassword(pw: string, current?: string): string | null {
  if (pw.length < PASSWORD_MIN || pw.length > PASSWORD_MAX) return `Mật khẩu cần từ ${PASSWORD_MIN} đến ${PASSWORD_MAX} ký tự.`;
  if (new TextEncoder().encode(pw).length > PASSWORD_MAX_BYTES) return "Mật khẩu quá dài khi mã hóa. Hãy dùng ít ký tự có dấu hơn.";
  if (current !== undefined && pw === current) return "Mật khẩu mới phải khác mật khẩu hiện tại.";
  return null;
}

export function validateShift(start: Date, end: Date): string | null {
  if (end.getTime() <= start.getTime()) return "Thời gian kết thúc phải sau thời gian bắt đầu.";
  if (end.getTime() - start.getTime() > SHIFT_MAX_HOURS * 3600_000) return `Ca trực không được dài quá ${SHIFT_MAX_HOURS} giờ.`;
  return null;
}

export const pad = (n: number) => String(n).padStart(2, "0");
export const fmtDate = (d: Date | number) => {
  const x = new Date(d);
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
};
export const fmtTime = (d: Date | number) => {
  const x = new Date(d);
  return `${pad(x.getHours())}:${pad(x.getMinutes())}`;
};
export const fmtDateTime = (d: Date | number) => `${fmtTime(d)} · ${fmtDate(d)}`;
export const fmtDuration = (ms: number) => {
  const m = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(m / 60);
  return h ? `${h} giờ ${pad(m % 60)} phút` : `${m} phút`;
};
