import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as m from "./mock";
import type { Role } from "./rules";

type Enrollment = { status: "NONE" | "ENROLLED" | "CONSENT_REQUIRED"; at?: number; samples?: number; policy?: string };

type State = {
  userId: string | null;
  accounts: m.Account[];
  visitors: m.Visitor[];
  sessions: m.Session[];
  kiosks: m.Kiosk[];
  shifts: m.Shift[];
  config: m.Config;
  enrollment: Enrollment;
  lastUpdate: number;
  login: (identifier: string, password: string) => "OK" | "INVALID" | "LOCKED";
  demoLogin: (role: Role, mustChange?: boolean) => void;
  logout: () => void;
  clearMustChange: () => void;
  recordEntry: (p: { subjectType: "STUDENT" | "VISITOR"; subjectId: string; method: m.Method; actor: string; reason?: string }) => string | null;
  recordExit: (subjectId: string, method: m.Method, actor: string, reason?: string) => string | null;
  addVisitor: (name: string, ref: string) => m.Visitor;
  upsertAccount: (a: m.Account) => void;
  upsertKiosk: (k: m.Kiosk) => void;
  upsertShift: (s: m.Shift) => void;
  setConfig: (c: m.Config) => void;
  setEnrollment: (e: Enrollment) => void;
};

const seed = () => {
  const accounts = m.seedAccounts();
  const visitors = m.seedVisitors();
  return { accounts, visitors, sessions: m.seedSessions(accounts, visitors), kiosks: m.seedKiosks(), shifts: m.seedShifts(), config: m.seedConfig(), enrollment: { status: "NONE" } as Enrollment, lastUpdate: Date.now() };
};

export const DEMO_PASSWORD = "ThuVien@2026";

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      userId: null,
      ...seed(),
      login: (identifier, password) => {
        const id = identifier.trim().toLowerCase();
        const a = get().accounts.find((x) => x.code.toLowerCase() === id || x.email.toLowerCase() === id);
        if (!a || password !== DEMO_PASSWORD) return "INVALID";
        if (a.status === "LOCKED") return "LOCKED";
        set({ userId: a.id });
        return "OK";
      },
      demoLogin: (role, mustChange) => {
        const id = role === "ADMIN" ? m.ME_ADMIN : role === "LIBRARIAN" ? m.ME_LIBRARIAN : m.ME_STUDENT;
        set((s) => ({ userId: id, accounts: s.accounts.map((a) => (a.id === id ? { ...a, mustChange: !!mustChange } : a)) }));
      },
      logout: () => set({ userId: null }),
      clearMustChange: () => set((s) => ({ accounts: s.accounts.map((a) => (a.id === s.userId ? { ...a, mustChange: false } : a)) })),
      recordEntry: ({ subjectType, subjectId, method, actor, reason }) => {
        const s = get();
        if (s.sessions.some((x) => x.subjectId === subjectId && !x.exitAt)) return "Người này đang ở trong thư viện.";
        const open = s.sessions.filter((x) => !x.exitAt).length;
        if (s.config.enforce && open >= s.config.capacity) return "Thư viện đã đạt sức chứa tối đa.";
        const who = subjectType === "STUDENT" ? s.accounts.find((a) => a.id === subjectId) : undefined;
        const v = subjectType === "VISITOR" ? s.visitors.find((x) => x.id === subjectId) : undefined;
        if (!who && !v) return "Không tìm thấy đối tượng.";
        const sess: m.Session = { id: `s-${Date.now()}`, subjectType, subjectId, name: who?.name ?? v!.name, code: who?.code ?? v!.ref, entryAt: Date.now(), entryMethod: method, entryActor: actor, reason };
        set({ sessions: [sess, ...s.sessions], lastUpdate: Date.now() });
        return null;
      },
      recordExit: (subjectId, method, actor, reason) => {
        const s = get();
        const open = s.sessions.find((x) => x.subjectId === subjectId && !x.exitAt);
        if (!open) return "Người này hiện không ở trong thư viện.";
        set({ sessions: s.sessions.map((x) => (x.id === open.id ? { ...x, exitAt: Date.now(), exitMethod: method, exitActor: actor, reason: reason ?? x.reason } : x)), lastUpdate: Date.now() });
        return null;
      },
      addVisitor: (name, ref) => {
        const v = { id: `v-${Date.now()}`, name, ref, createdAt: Date.now() };
        set((s) => ({ visitors: [v, ...s.visitors] }));
        return v;
      },
      upsertAccount: (a) => set((s) => ({ accounts: s.accounts.some((x) => x.id === a.id) ? s.accounts.map((x) => (x.id === a.id ? a : x)) : [a, ...s.accounts] })),
      upsertKiosk: (k) => set((s) => ({ kiosks: s.kiosks.some((x) => x.id === k.id) ? s.kiosks.map((x) => (x.id === k.id ? k : x)) : [k, ...s.kiosks] })),
      upsertShift: (sh) => set((s) => ({ shifts: s.shifts.some((x) => x.id === sh.id) ? s.shifts.map((x) => (x.id === sh.id ? sh : x)) : [...s.shifts, sh] })),
      setConfig: (config) => set({ config }),
      setEnrollment: (enrollment) => set({ enrollment }),
    }),
    { name: "library-access-demo", storage: createJSONStorage(() => sessionStorage), partialize: (s) => ({ userId: s.userId }) },
  ),
);

export const useMe = () => useApp((s) => s.accounts.find((a) => a.id === s.userId) ?? null);
export const useOpenSessions = () => {
  const sessions = useApp((s) => s.sessions);
  return sessions.filter((x) => !x.exitAt);
};
