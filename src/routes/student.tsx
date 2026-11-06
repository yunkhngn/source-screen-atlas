import { createFileRoute, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, QrCode, History, UserRound } from "lucide-react";
import { useMe } from "@/lib/store";
import { canAccess } from "@/lib/rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student")({ component: StudentShell });

const TABS = [
  { to: "/student/home", label: "Trang chủ", icon: Home },
  { to: "/student/qr", label: "Mã QR", icon: QrCode },
  { to: "/student/history", label: "Lịch sử", icon: History },
  { to: "/student/account", label: "Tài khoản", icon: UserRound },
] as const;

function StudentShell() {
  const me = useMe();
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (!me) return <Navigate to="/login" />;
  if (me.mustChange) return <Navigate to="/first-password-change" />;
  if (!canAccess(me.role, path)) return <Navigate to="/forbidden" />;
  return (
    <div className="flex min-h-screen justify-center bg-surface sm:py-8">
      <div className="relative flex w-full max-w-[390px] flex-col overflow-hidden bg-background sm:min-h-[844px] sm:rounded-[2.5rem] sm:border-8 sm:border-primary sm:shadow-pop">
        <div className="flex-1 overflow-y-auto pb-24"><Outlet /></div>
        <nav className="absolute inset-x-0 bottom-0 grid grid-cols-4 border-t border-border bg-card px-2 pb-4 pt-2">
          {TABS.map((t) => {
            const active = path.startsWith(t.to) || (t.to === "/student/home" && path.startsWith("/student/face"));
            return (
              <Link key={t.to} to={t.to} className="flex flex-col items-center gap-1 py-1 text-[11px]">
                <span className={cn("grid h-8 w-14 place-items-center rounded-full transition", active ? "bg-yellow" : "")}><t.icon className="size-5" strokeWidth={active ? 2.2 : 1.75} /></span>
                <span className={active ? "font-semibold" : "text-muted-foreground"}>{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
