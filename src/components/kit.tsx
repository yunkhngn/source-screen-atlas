import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, useState } from "react";
import { ChevronLeft, ChevronRight, Inbox, Loader2, AlertTriangle, Eye, EyeOff, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const btnVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/85",
  accent: "bg-yellow text-foreground hover:bg-yellow/80",
  outline: "border border-input bg-card text-foreground hover:bg-secondary",
  ghost: "text-foreground hover:bg-secondary",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  soft: "bg-secondary text-foreground hover:bg-surface",
};
const btnSizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base", xl: "h-16 px-8 text-lg" };

export function Btn({ variant = "primary", size = "md", loading, className, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof btnVariants; size?: keyof typeof btnSizes; loading?: boolean }) {
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={cn("inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", btnVariants[variant], btnSizes[size], className)}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-border bg-card shadow-soft", className)}>{children}</div>;
}

const tones = {
  neutral: "bg-secondary text-foreground",
  success: "bg-mint-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-pink-soft text-destructive",
  info: "bg-sky-soft text-info",
  brand: "bg-yellow-soft text-foreground",
};
export type Tone = keyof typeof tones;
export function Badge({ tone = "neutral", children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string | null; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="size-3.5" />{error}</span> : hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn("h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-yellow disabled:bg-secondary", className)} />;
}

export function PasswordInput(p: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...p} type={show ? "text" : "password"} className="pr-11" />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function Select({ className, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cn("h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-yellow", className)}>{children}</select>;
}

export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className="min-h-20 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-yellow" />;
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-xl bg-secondary p-1">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={cn("rounded-lg px-3.5 py-1.5 text-sm font-medium transition", value === o.value ? "bg-card shadow-soft" : "text-muted-foreground hover:text-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, crumbs, actions, sub }: { title: string; crumbs?: string[]; actions?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {crumbs && <div className="mb-1 text-xs text-muted-foreground">{crumbs.join("  /  ")}</div>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <div className="mt-1 text-sm text-muted-foreground">{sub}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const statBg = { white: "bg-card", yellow: "bg-yellow", mint: "bg-mint", pink: "bg-pink", sky: "bg-sky" };
export function Stat({ label, value, sub, icon, color = "white" }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; color?: keyof typeof statBg }) {
  return (
    <div className={cn("rounded-2xl border border-border p-5 shadow-soft", statBg[color])}>
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        {icon && <span className="grid size-9 place-items-center rounded-xl bg-card/70">{icon}</span>}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs opacity-75">{sub}</div>}
    </div>
  );
}

export function Empty({ title, desc, icon, action }: { title: string; desc?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-yellow-soft">{icon ?? <Inbox className="size-6" />}</div>
      <div className="font-medium">{title}</div>
      {desc && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children, title }: { tone?: "info" | "warning" | "success" | "danger"; title?: string; children: ReactNode }) {
  const bg = { info: "bg-sky-soft", warning: "bg-warning-soft", success: "bg-mint-soft", danger: "bg-pink-soft" }[tone];
  const fg = { info: "text-info", warning: "text-warning", success: "text-success", danger: "text-destructive" }[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl p-3.5 text-sm", bg)}>
      {tone === "info" ? <Info className={cn("mt-0.5 size-4 shrink-0", fg)} /> : <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", fg)} />}
      <div>{title && <div className="font-medium">{title}</div>}<div className="text-foreground/80">{children}</div></div>
    </div>
  );
}

export function Pager({ page, total, perPage, onPage }: { page: number; total: number; perPage: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm">
      <span className="text-muted-foreground">{total === 0 ? "0 kết quả" : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} trên ${total}`}</span>
      <div className="flex items-center gap-1">
        <button aria-label="Trang trước" disabled={page <= 1} onClick={() => onPage(page - 1)} className="grid size-8 place-items-center rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronLeft className="size-4" /></button>
        {Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5).map((p) => (
          <button key={p} onClick={() => onPage(p)} className={cn("size-8 rounded-lg text-sm", p === page ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>{p}</button>
        ))}
        <button aria-label="Trang sau" disabled={page >= pages} onClick={() => onPage(page + 1)} className="grid size-8 place-items-center rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronRight className="size-4" /></button>
      </div>
    </div>
  );
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            {head.map((h, i) => <th key={i} className="whitespace-nowrap bg-secondary/60 px-5 py-3 font-medium first:rounded-l-xl last:rounded-r-xl">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => <td className={cn("whitespace-nowrap px-5 py-3.5", className)}>{children}</td>;

export function Modal({ open, onOpenChange, title, desc, children, footer, wide }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; desc?: ReactNode; children?: ReactNode; footer?: ReactNode; wide?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("rounded-2xl border-border bg-card", wide ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {desc && <DialogDescription>{desc}</DialogDescription>}
        </DialogHeader>
        {children && <div className="space-y-4">{children}</div>}
        {footer && <DialogFooter className="gap-2">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export function Confirm({ open, onOpenChange, title, desc, confirmLabel, onConfirm, danger, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; desc: ReactNode; confirmLabel: string; onConfirm: () => void; danger?: boolean; children?: ReactNode }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} desc={desc} footer={<><Btn variant="outline" onClick={() => onOpenChange(false)}>Hủy</Btn><Btn variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Btn></>}>
      {children}
    </Modal>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const parts = name.split(" ");
  const init = (parts[parts.length - 1]?.[0] ?? "") + (parts[0]?.[0] ?? "");
  const colors = ["bg-yellow", "bg-pink", "bg-mint", "bg-sky"];
  const c = colors[name.length % 4];
  return <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold", c, className)}>{init.toUpperCase()}</span>;
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center rounded-xl bg-primary">
        <span className="absolute left-1.5 top-1.5 size-3 rounded-full bg-yellow" />
        <span className="absolute bottom-1.5 right-1.5 size-3 rounded-full bg-pink" />
        <span className="absolute bottom-1.5 left-1.5 size-2 rounded-full bg-mint" />
      </span>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-semibold">Cổng Thư Viện</div>
          <div className="text-[11px] text-muted-foreground">Quản lý ra vào</div>
        </div>
      )}
    </div>
  );
}

export function Deco() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="blob absolute -left-24 -top-24 size-80 bg-yellow opacity-70" />
      <div className="blob absolute -right-20 top-1/3 size-64 rotate-45 bg-pink opacity-60" />
      <div className="blob absolute -bottom-28 left-1/3 size-72 -rotate-12 bg-mint opacity-60" />
      <div className="absolute bottom-16 right-24 size-24 rounded-full bg-sky opacity-70" />
    </div>
  );
}
