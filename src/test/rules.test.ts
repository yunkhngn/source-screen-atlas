import { describe, expect, it } from "vitest";
import { canAccess, qrRemaining, validatePassword, validateShift } from "@/lib/rules";

describe("business rules", () => {
  it("QR is valid for 30 seconds then expires", () => {
    expect(qrRemaining(0, 0)).toBe(30);
    expect(qrRemaining(0, 29_000)).toBe(1);
    expect(qrRemaining(0, 30_000)).toBe(0);
  });
  it("password must be 12–64 characters", () => {
    expect(validatePassword("a".repeat(11))).not.toBeNull();
    expect(validatePassword("a".repeat(12))).toBeNull();
    expect(validatePassword("a".repeat(65))).not.toBeNull();
  });
  it("shift max 24 hours and end after start", () => {
    const s = new Date(2026, 10, 6, 22);
    expect(validateShift(s, new Date(2026, 10, 7, 6))).toBeNull();
    expect(validateShift(s, new Date(2026, 10, 7, 23))).not.toBeNull();
    expect(validateShift(s, s)).not.toBeNull();
  });
  it("role-based access follows router _canAccess", () => {
    expect(canAccess("LIBRARIAN", "/admin/accounts")).toBe(false);
    expect(canAccess("ADMIN", "/staff/occupants")).toBe(true);
    expect(canAccess("ADMIN", "/librarian/shifts")).toBe(false);
    expect(canAccess("STUDENT", "/staff/history")).toBe(false);
  });
});
