import { createFileRoute, Link, Navigate, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Users, PenLine, UserRoundPlus, History, CalendarClock, BookOpenText, UserCog, MonitorSmartphone, CalendarRange, BarChart3, Settings2, PanelLeftClose, PanelLeftOpen, LogOut, KeyRound, UserRound, ChevronDown,
} from "lucide-react";
import { useApp, useMe } from "@/lib/store";
import { canAccess, ROLE_LABEL, fmtTime } from "@/lib/rules";
import { Avatar, Confirm, Logo } from "@/components/kit";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_desk")({ component: DeskLayout });

const staffOps = [
  { to: "/staff/occupants", label: "Người đang trong thư viện", icon: Users },
  { to: "/staff/manual-access", label: "Ghi nhận thủ công", icon: PenLine },
  { to: "/staff/visitors", label: "Khách ngoài", icon: UserRoundPlus },
  { to: "/staff/history", label: "Lịch sử ra vào", icon: History },
] as const;

const NAV = {
  LIBRARIAN: [
    { group: "Vận hành", items: [{ to: "/librarian/overview", label: "Tổng quan", icon: LayoutDashboard }, ...staffOps] },
    { group: "Cá nhân", items: [{ to: "/librarian/shifts", label: "Ca trực của tôi", icon: CalendarClock }, { to: "/librarian/rules", label: "Quy định thư viện", icon: BookOpenText }] },
  ],
  ADMIN: [
    { group: "Vận hành", items: [{ to: "/admin/overview", label: "Tổng quan", icon: LayoutDashboard }, ...staffOps] },
    {
      group: "Quản trị",
      items: [
        { to: "/admin/accounts", label: "Tài khoản", icon: UserCog },
        { to: "/admin/kiosks", label: "Thiết bị Kiosk", icon: MonitorSmartphone },
        { to: "/admin/shifts", label: "Phân ca nhân viên", icon: CalendarRange },
        { to: "/admin/analytics", label: "Thống kê", icon: BarChart3 },
        { to: "/admin/config", label: "Cấu hình hệ thống", icon: Settings2 },
      ],
    },
  ],
};

function DeskLayout() {
  const me = useMe();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logout = useApp((s) => s.logout);
  const lastUpdate = useApp((s) => s.lastUpdate);
  const navigate = useNavigate();

  if (!me) return <Navigate to="/login" />;
  if (me.mustChange) return <Navigate to="/first-password-change" />;
  if (!canAccess(me.role, path)) return <Navigate to="/forbidden" />;
  const nav = NAV[me.role as "ADMIN" | "LIBRARIAN"];

  return (
    <div className="flex min-h-screen w-full gap-3 p-3">
      <aside className={cn("sticky top-3 flex h-[calc(100vh-1.5rem)] shrink-0 flex-col rounded-3xl bg-sidebar transition-all", collapsed ? "w-[76px]" : "w-[264px]")}>
        <div className="flex h-16 items-center justify-between px-5">
          <Logo compact={collapsed} />
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {nav.map((g) => (
            <div key={g.group}>
              {!collapsed && <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</div>}
              <div className="space-y-0.5">
                {g.items.map((it) => {
                  const active = path === it.to || path.startsWith(it.to + "/");
                  return (
                    <Link key={it.to} to={it.to} title={it.label} className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", active ? "font-semibold text-foreground before:absolute before:-left-3 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-primary [&>svg]:text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground", collapsed && "justify-center")}>
                      <it.icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                      {!collapsed && <span className="truncate">{it.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <button onClick={() => setCollapsed(!collapsed)} className="m-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary" aria-label="Thu gọn thanh bên">
          {collapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /> Thu gọn</>}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-3 z-10 flex h-16 items-center justify-between rounded-3xl bg-card px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" /><span className="size-2 rounded-full bg-success" /></span> Đã kết nối · cập nhật lúc {fmtTime(lastUpdate)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary">
              <Avatar name={me.name} />
              <div className="text-left leading-tight">
                <div className="text-sm font-medium">{me.name}</div>
                <div className="text-xs text-muted-foreground">{ROLE_LABEL[me.role]}</div>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuItem onClick={() => navigate({ to: "/staff/profile" })}><UserRound className="size-4" /> Hồ sơ tài khoản</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/staff/change-password" })}><KeyRound className="size-4" /> Đổi mật khẩu</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLogoutOpen(true)} className="text-destructive"><LogOut className="size-4" /> Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-7">
          <Outlet />
        </main>
      </div>

      <Confirm open={logoutOpen} onOpenChange={setLogoutOpen} title="Đăng xuất?" desc="Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng hệ thống." confirmLabel="Đăng xuất" onConfirm={() => { logout(); navigate({ to: "/login" }); }} />
    </div>
  );
}
