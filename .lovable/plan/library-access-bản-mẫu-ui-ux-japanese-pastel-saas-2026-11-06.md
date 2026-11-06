# Library Access — Bản mẫu UI/UX "Japanese Pastel SaaS"

Nguồn đối chiếu: `client/lib/app/routes.dart`, `router.dart`, `features/*/presentation/*_screen.dart`, `DESIGN_SYSTEM.md` của repo yunkhngn/library-system-prm. Bản mẫu chạy độc lập, chỉ có dữ liệu giả, không đụng vào ứng dụng Flutter.

## 1. Tóm tắt hệ thống
Hệ thống quản lý ra/vào và số người đang có mặt cho một thư viện đại học. Sinh viên vào/ra bằng nhận diện khuôn mặt tại kiosk, dùng mã QR 30 giây khi không nhận diện được. Thủ thư có thể ghi nhận thủ công. Quản trị viên quản lý tài khoản, kiosk, ca trực, cấu hình và thống kê. Kiosk đăng nhập dưới dạng thiết bị, không phải một vai trò người dùng.

## 2. Vai trò và quyền (theo `_canAccess`)
```text
/admin/*      -> chỉ ADMIN (Quản trị viên)
/librarian/*  -> chỉ LIBRARIAN (Thủ thư)
/staff/*      -> LIBRARIAN + ADMIN (chung nghiệp vụ)
/student/*    -> chỉ STUDENT (Sinh viên)
/kiosk        -> thiết bị, không cần phiên người dùng
mustChangePassword -> bắt buộc chuyển sang /first-password-change
Truy cập sai quyền  -> /forbidden
```

## 3. Danh mục màn hình (theo source)

**Dùng chung (Auth)**
- AUTH-00 Splash (`splash_screen`) — đang khôi phục phiên
- AUTH-01 Đăng nhập `/login` — mã tài khoản hoặc email, mật khẩu; các trạng thái: sai thông tin, bị khóa, bị giới hạn số lần, mất mạng
- AUTH-02 Đổi mật khẩu lần đầu `/first-password-change` — không bỏ qua được, 12–64 ký tự
- AUTH-03 Đổi mật khẩu `/staff/change-password`
- AUTH-04 Hồ sơ nhân viên `/staff/profile` (chỉ xem)
- AUTH-05 Hết phiên / Không có quyền / Không tìm thấy (`session_status_screen`)
- AUTH-06 Hộp thoại xác nhận đăng xuất

**Sinh viên — mobile 390×844, thanh điều hướng dưới: Trang chủ · Mã QR · Lịch sử · Tài khoản**
- STU-01 Trang chủ `/student/home` — trạng thái trong/ngoài, thời gian đã ở, lối tắt QR, trạng thái khuôn mặt
- STU-02 Mã QR `/student/qr` — đếm ngược 30 giây; đang tạo/còn hiệu lực/hết hạn/lỗi/bị giới hạn; nút "Tạo mã mới"
- STU-03 Lịch sử `/student/history` — lọc theo khoảng ngày, mặc định 30 ngày
- STU-04 Chi tiết lượt `/student/history/:id` — dòng thời gian, phương thức, tự động trả phiên
- STU-05 Tài khoản `/student/account`
- STU-05b Đổi mật khẩu `/student/account/password`, Quy định `/student/account/rules`
- STU-06…11 Đăng ký khuôn mặt `/student/face`: tổng quan → đồng ý sinh trắc (ô đồng ý để trống sẵn) → chuẩn bị/cấp quyền camera → chụp 3–5 ảnh → xử lý/kết quả (các lỗi) → xóa dữ liệu khuôn mặt

**Thủ thư — desktop 1440, thanh bên trái**
- LIB-01 Tổng quan `/librarian/overview` — số người hiện có / sức chứa, cảnh báo gần đầy, giờ cập nhật, thao tác nhanh
- LIB-02 Người đang trong thư viện `/staff/occupants` — tìm kiếm, phân trang, ghi nhận ra thủ công
- LIB-03 Ghi nhận thủ công `/staff/manual-access` — sinh viên/khách, vào/ra, bắt buộc lý do, xem lại trước khi gửi
- LIB-04 Khách ngoài `/staff/visitors` + hộp thoại đăng ký khách
- LIB-05 Chi tiết khách `/staff/visitors/:id` (chỉ xem, không sửa/xóa)
- LIB-06 Lịch sử ra vào `/staff/history` + ngăn kéo chi tiết bên phải
- LIB-07 Ca trực của tôi `/librarian/shifts` — dạng tuần/danh sách, chỉ xem
- LIB-08 Quy định thư viện `/librarian/rules` — chỉ xem

**Quản trị viên — dùng chung giao diện desktop; thanh bên gồm LIB-02→06 cộng thêm:**
- ADM-01 Tổng quan `/admin/overview`
- ADM-02…06 Tài khoản `/admin/accounts`: danh sách, tạo, chi tiết/sửa, khóa/mở khóa, đặt lại mật khẩu (không có xóa)
- ADM-07…10 Thiết bị Kiosk `/admin/kiosks`: danh sách, tạo + mật khẩu hiển thị đúng một lần, chi tiết/sửa, thu hồi, cấp lại mật khẩu
- ADM-11…14 Phân ca `/admin/shifts`: lịch tuần, tạo/sửa ca (tối đa 24 giờ, ca qua đêm), phân công thủ thư, hủy ca (bắt buộc lý do)
- ADM-15–16 Thống kê `/admin/analytics`: lượt ra vào, phương thức, nhận diện (P50/P95, không gọi là "độ chính xác")
- ADM-17–18 Cấu hình `/admin/config`: giờ mở cửa, sức chứa, cảnh báo, thời gian ở tối đa, thời gian chờ giữa hai lần quét, phần nâng cao về nhận diện

**Kiosk — 1280×800, toàn màn hình (`kiosk_screen`, `kiosk_ready_screen`)**
- KSK-01 Cài đặt thiết bị (mã thiết bị và mật khẩu được che)
- KSK-02 Sẵn sàng (chế độ Vào/Ra/Tự động) → KSK-03 Căn khuôn mặt → Đang nhận diện → Thành công/Thất bại → Quét QR dự phòng; các trạng thái đã đầy, ngoài giờ mở cửa, thiết bị bị thu hồi, mất mạng

**Dùng chung:** trạng thái tải, rỗng, lỗi (`state_views`, `async_value_view`), thông báo nhỏ, hộp thoại xác nhận.

**Điểm chênh giữa source và tài liệu:** trong source có `component_gallery_screen` (màn hình dành cho lập trình viên), sẽ được thay bằng trang Hệ thống thiết kế. `placeholder_page` cho thấy có màn hình còn dở trong source; bản mẫu sẽ dựng theo `DESIGN_SYSTEM.md`.

## 4. Kiến trúc thông tin trong bản mẫu
```text
/            -> Cổng demo (chọn 1 trong 4 trải nghiệm, chỉ dành cho người duyệt)
/login, /first-password-change, /session, /forbidden
/librarian/*, /staff/*, /admin/*   (cùng một giao diện desktop, menu đổi theo vai trò)
/student/*   (khung điện thoại + thanh điều hướng dưới)
/kiosk       (toàn màn hình)
/design-system
```
Đăng nhập giả: tài khoản demo theo vai trò. Màn hình đăng nhập không có ô chọn vai trò; nút chọn vai trò chỉ nằm ở Cổng demo.

## 5. Hệ thống thiết kế
- Màu: Than #111111 (chữ, nút chính) · Trắng ấm #F7F3EF (nền) · Trắng #FFFFFF (thẻ) · Vàng #FFE59A (nhấn thương hiệu, mục đang chọn) · Bạc hà #B7E1D1 (thành công) · Hồng #FFB5C1 (nhấn phụ) · Xanh nhạt #A9D3FF (thông tin, biểu đồ). Cảnh báo/lỗi dùng màu đậm hơn kèm biểu tượng và chữ.
- Chữ: Be Vietnam Pro. Bo góc: thẻ 14px, nút 12px hoặc dạng viên thuốc. Bóng đổ nhẹ, viền mảnh, biểu tượng nét Lucide.
- Thành phần: nút, ô nhập, chọn, tìm kiếm, tab, bảng + phân trang, nhãn trạng thái, thẻ chỉ số, biểu đồ, hộp thoại, ngăn kéo, thông báo, trạng thái rỗng/tải/lỗi.
- Họa tiết hình tròn mềm chỉ dùng ở Đăng nhập, Cổng demo và màn hình chờ của Kiosk.

## 6. Thứ tự triển khai
1. Bảng màu, phông chữ, các thành phần dùng chung, dữ liệu giả tiếng Việt (DD/MM/YYYY, giờ 24h), kho trạng thái phiên giả
2. Đăng nhập và các màn hình xác thực, Cổng demo
3. Giao diện desktop + màn hình Thủ thư
4. Màn hình Quản trị viên
5. Ứng dụng Sinh viên trên điện thoại (gồm luồng đăng ký khuôn mặt)
6. Kiosk (mô phỏng nhận diện và QR)
7. Rà soát: mọi màn hình truy cập được, hộp thoại hoạt động, chữ tiếng Việt chính xác

## Chi tiết kỹ thuật
- TanStack Router, mỗi màn hình là một file route; layout routes cho desktop, student, kiosk; có bảo vệ quyền ở phía client mô phỏng `_canAccess`.
- Trạng thái lưu trong bộ nhớ (Zustand hoặc React context) để mô phỏng ghi nhận vào/ra, khóa tài khoản, phân ca; không dùng backend, không dùng Lovable Cloud.
- Camera chỉ là khung mô phỏng, không gọi getUserMedia; biểu đồ dùng Recharts.
- Mỗi route có head() riêng; viết test nhỏ cho các quy tắc: đếm ngược QR 30 giây, ca trực tối đa 24 giờ, mật khẩu 12–64 ký tự, quyền theo vai trò.

## Giới hạn
Đã đọc được repo công khai. Chưa đọc chi tiết từng widget Flutter; khi làm từng màn hình sẽ đối chiếu lại file source tương ứng.
