import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, MoreHorizontal, Lock, Unlock, KeyRound, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useApp, useMe } from "@/lib/store";
import { ROLE_LABEL, validatePassword, type Role } from "@/lib/rules";
import type { Account } from "@/lib/mock";
import { Avatar, Badge, Btn, Card, Confirm, Empty, Field, Input, Modal, Notice, PageHeader, Pager, PasswordInput, Select, Table, Td } from "@/components/kit";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_desk/admin/accounts")({
  head: () => ({ meta: [{ title: "Tài khoản — Quản trị" }, { name: "description", content: "Quản lý tài khoản sinh viên và nhân viên." }, { property: "og:title", content: "Quản lý tài khoản" }, { property: "og:description", content: "Tạo, sửa, khóa tài khoản." }] }),
  component: Accounts,
});

const empty: Account = { id: "", code: "", name: "", email: "", role: "STUDENT", status: "ACTIVE" };

function Accounts() {
  const me = useMe()!;
  const { accounts, sessions, upsertAccount } = useApp();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Account | null>(null);
  const [form, setForm] = useState<Account>(empty);
  const [pw, setPw] = useState("");
  const [mustChange, setMustChange] = useState(true);
  const [errs, setErrs] = useState<Record<string, string | null>>({});
  const [lock, setLock] = useState<Account | null>(null);
  const [reset, setReset] = useState<Account | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [resetErr, setResetErr] = useState<string | null>(null);

  const list = accounts.filter((a) => (role === "ALL" || a.role === role) && (status === "ALL" || a.status === status) && [a.code, a.name, a.email].some((x) => x.toLowerCase().includes(q.toLowerCase())));
  const isNew = edit?.id === "";
  const open = (a: Account) => { setEdit(a); setForm(a); setPw(""); setErrs({}); setMustChange(true); };

  const save = () => {
    const e: Record<string, string | null> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên.";
    if (!/^[A-Za-z0-9]{3,}$/.test(form.code)) e.code = "Mã tài khoản gồm chữ và số, tối thiểu 3 ký tự.";
    else if (accounts.some((a) => a.code.toLowerCase() === form.code.toLowerCase() && a.id !== form.id)) e.code = "Mã tài khoản đã tồn tại.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email không hợp lệ.";
    else if (accounts.some((a) => a.email.toLowerCase() === form.email.toLowerCase() && a.id !== form.id)) e.email = "Email đã được sử dụng.";
    if (isNew) e.pw = validatePassword(pw);
    if (!isNew && edit!.role === "STUDENT" && form.role !== "STUDENT" && sessions.some((s) => s.subjectId === form.id && !s.exitAt)) e.role = "Sinh viên đang ở trong thư viện. Hãy ghi nhận ra trước khi đổi vai trò.";
    if (!isNew && edit!.role === "ADMIN" && form.role !== "ADMIN" && accounts.filter((a) => a.role === "ADMIN" && a.status === "ACTIVE").length <= 1) e.role = "Không thể đổi vai trò của quản trị viên đang hoạt động cuối cùng.";
    setErrs(e);
    if (Object.values(e).some(Boolean)) return;
    upsertAccount({ ...form, id: form.id || `u-${Date.now()}`, mustChange: isNew ? mustChange : form.mustChange });
    toast.success(isNew ? "Đã tạo tài khoản" : "Đã lưu thay đổi");
    setEdit(null);
  };

  const doLock = () => {
    const a = lock!;
    if (a.status === "ACTIVE" && a.role === "ADMIN" && accounts.filter((x) => x.role === "ADMIN" && x.status === "ACTIVE").length <= 1) { toast.error("Không thể khóa quản trị viên đang hoạt động cuối cùng."); return setLock(null); }
    if (a.id === me.id) { toast.error("Bạn không thể tự khóa tài khoản của mình."); return setLock(null); }
    upsertAccount({ ...a, status: a.status === "ACTIVE" ? "LOCKED" : "ACTIVE" });
    toast.success(a.status === "ACTIVE" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
    setLock(null);
  };

  return (
    <>
      <PageHeader title="Tài khoản" crumbs={["Quản trị", "Tài khoản"]} actions={<Btn onClick={() => open(empty)}><Plus className="size-4" /> Tạo tài khoản</Btn>} />
      <Card>
        <div className="flex flex-wrap gap-3 p-5">
          <div className="relative w-80"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Tìm theo mã, tên hoặc email" className="pl-9" /></div>
          <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="w-44"><option value="ALL">Mọi vai trò</option><option value="STUDENT">Sinh viên</option><option value="LIBRARIAN">Thủ thư</option><option value="ADMIN">Quản trị viên</option></Select>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-44"><option value="ALL">Mọi trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="LOCKED">Đã khóa</option></Select>
        </div>
        {list.length === 0 ? <Empty title="Không tìm thấy tài khoản" /> : (
          <div className="px-5">
            <Table head={["Mã tài khoản", "Họ và tên", "Email", "Vai trò", "Trạng thái", ""]}>
              {list.slice((page - 1) * 10, page * 10).map((a) => (
                <tr key={a.id} className="hover:bg-secondary/40">
                  <Td className="font-medium">{a.code}</Td>
                  <Td><div className="flex items-center gap-3"><Avatar name={a.name} className="size-8" />{a.name}</div></Td>
                  <Td className="text-muted-foreground">{a.email}</Td>
                  <Td><Badge tone={a.role === "ADMIN" ? "brand" : a.role === "LIBRARIAN" ? "info" : "neutral"} dot={false}>{ROLE_LABEL[a.role]}</Badge></Td>
                  <Td>{a.status === "ACTIVE" ? <Badge tone="success">Đang hoạt động</Badge> : <Badge tone="danger">Đã khóa</Badge>}</Td>
                  <Td className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-lg p-1.5 hover:bg-secondary" aria-label="Thao tác"><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => open(a)}><Pencil className="size-4" /> Xem và chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setReset(a); setResetPw(""); setResetErr(null); }}><KeyRound className="size-4" /> Đặt lại mật khẩu</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLock(a)}>{a.status === "ACTIVE" ? <><Lock className="size-4" /> Khóa tài khoản</> : <><Unlock className="size-4" /> Mở khóa</>}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Td>
                </tr>
              ))}
            </Table>
          </div>
        )}
        <Pager page={page} total={list.length} perPage={10} onPage={setPage} />
      </Card>

      <Modal open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={isNew ? "Tạo tài khoản" : "Chi tiết tài khoản"} wide footer={<><Btn variant="outline" onClick={() => setEdit(null)}>Hủy</Btn><Btn onClick={save}>{isNew ? "Tạo tài khoản" : "Lưu thay đổi"}</Btn></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Họ và tên" error={errs.name}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Mã tài khoản" error={errs.code}><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: SV2201234" /></Field>
          <Field label="Email" error={errs.email}><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Vai trò" error={errs.role}><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}><option value="STUDENT">Sinh viên</option><option value="LIBRARIAN">Thủ thư</option><option value="ADMIN">Quản trị viên</option></Select></Field>
          {isNew && <Field label="Mật khẩu ban đầu" error={errs.pw} hint="Từ 12 đến 64 ký tự"><PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} /></Field>}
          {!isNew && <Field label="Trạng thái"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Account["status"] })}><option value="ACTIVE">Đang hoạt động</option><option value="LOCKED">Đã khóa</option></Select></Field>}
        </div>
        {isNew ? (
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={mustChange} onCheckedChange={(v) => setMustChange(!!v)} /> Yêu cầu đổi mật khẩu ở lần đăng nhập đầu</label>
        ) : <Notice tone="warning">Thay đổi vai trò hoặc trạng thái có thể kết thúc các phiên đăng nhập đang hoạt động của tài khoản này.</Notice>}
        {isNew && <p className="text-xs text-muted-foreground">Hệ thống không gửi mật khẩu qua email. Hãy trao mật khẩu ban đầu trực tiếp cho người dùng.</p>}
      </Modal>

      <Confirm open={!!lock} onOpenChange={(o) => !o && setLock(null)} danger={lock?.status === "ACTIVE"} title={lock?.status === "ACTIVE" ? "Khóa tài khoản?" : "Mở khóa tài khoản?"} confirmLabel={lock?.status === "ACTIVE" ? "Khóa" : "Mở khóa"} onConfirm={doLock}
        desc={lock && (lock.status === "ACTIVE" ? <>Tài khoản <b>{lock.name}</b> sẽ không thể đăng nhập. Nếu người này đang ở trong thư viện, lượt hiện tại không tự động kết thúc.</> : <>Tài khoản <b>{lock.name}</b> sẽ có thể đăng nhập lại.</>)} />

      <Modal open={!!reset} onOpenChange={(o) => !o && setReset(null)} title="Đặt lại mật khẩu" desc={reset && <>Đặt mật khẩu mới cho <b>{reset.name}</b>. Người dùng sẽ phải đổi mật khẩu ở lần đăng nhập tiếp theo.</>}
        footer={<><Btn variant="outline" onClick={() => setReset(null)}>Hủy</Btn><Btn onClick={() => { const e = validatePassword(resetPw); setResetErr(e); if (e) return; upsertAccount({ ...reset!, mustChange: true }); toast.success("Đã đặt lại mật khẩu"); setReset(null); }}>Đặt lại</Btn></>}>
        <Field label="Mật khẩu mới" error={resetErr} hint="Từ 12 đến 64 ký tự"><PasswordInput value={resetPw} onChange={(e) => setResetPw(e.target.value)} /></Field>
        {reset?.status === "LOCKED" && <Notice tone="warning">Tài khoản đang bị khóa. Đặt lại mật khẩu không tự động mở khóa.</Notice>}
      </Modal>
    </>
  );
}
