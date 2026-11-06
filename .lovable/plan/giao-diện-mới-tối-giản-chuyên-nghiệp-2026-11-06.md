# Giao diện mới: Tối giản chuyên nghiệp

Thay toàn bộ phong cách pastel bằng giao diện sạch, nghiêm túc kiểu Linear/Notion. Giữ nguyên mọi màn hình, luồng và quyền theo vai trò.

## Hướng thiết kế
- Màu: nền trắng / xám rất nhạt (#F4F5F7), chữ than đậm (#1F2937), một màu nhấn xanh (#2563EB). Trạng thái dùng xanh lá / cam / đỏ dịu, không còn vàng-hồng-bạc hà.
- Chữ: Sora cho tiêu đề, Manrope cho nội dung; cỡ chữ nhỏ gọn, số liệu dạng tabular.
- Bo góc nhỏ hơn (6–8px), viền mảnh 1px, gần như không đổ bóng.
- Bỏ các hình blob trang trí, logo chấm màu; logo mới dạng biểu tượng đơn sắc + chữ.
- Bảng dày đặc hơn, nhãn trạng thái dạng chữ nhỏ có viền, nút gọn (cao 36px).

## Phạm vi
- Toàn bộ: đăng nhập, cổng demo, admin, thủ thư, sinh viên (khung điện thoại), kiosk, trang hệ thống thiết kế.
- Thanh bên nhân viên: nền xám nhạt, mục đang chọn tô nhẹ + vạch xanh.
- Kiosk: nền trắng, khung quét viền xanh mảnh, chữ lớn rõ ràng.
- Thẻ thống kê: nền trắng, số lớn, không còn khối màu.

## Chi tiết kỹ thuật
- `src/styles.css`: thay token màu (oklch), radius 0.5rem, bỏ biến pastel bằng cách ánh xạ lại `yellow/pink/mint/sky(-soft)` sang tông trung tính/xanh để các trang cũ không vỡ, rồi dọn dần; bỏ `blob`.
- `__root.tsx`: link Google Fonts Sora + Manrope; `--font-sans` Manrope, thêm `--font-display` Sora cho h1–h3.
- `components/kit.tsx`: viết lại Btn, Card, Badge, Stat, Logo, Deco (bỏ), Avatar (đơn sắc), Table, Input.
- Rà `_desk.tsx`, `index.tsx`, `login.tsx`, `kiosk.tsx`, `student*.tsx` để gỡ class pastel/blob trực tiếp.
- Không đổi logic, store, rules hay test.
