English description: Manual QA checklist for the backend-backed wallet route and wallet API bridge.

# TEST CASE - Wallet

## Phạm vi

Route chính: `/wallet`

API bridge bắt buộc:

- `GET /_api/wallet`
- `POST /_api/settings/points-transfer`
- `GET /_api/wallet/recipient-search`
- `GET /_api/settings/points-qr`
- `GET /_api/settings/points-qr-image`
- `GET /_api/wallet/topup-link`
- `POST /_api/wallet/bank-transfer`

## Trường hợp kiểm thử

| ID | Màn hình/API | Điều kiện | Bước kiểm thử | Kết quả mong đợi | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| WALLET-001 | `/wallet` | Đã đăng nhập bằng cookie PHP hợp lệ | Hard reload trang | Trang hiển thị header nhỏ, card số dư, CTA gửi tiền/nạp tiền/QR, lịch sử giao dịch theo dữ liệu backend | [ ] |
| WALLET-002 | `GET /_api/wallet` | Tài khoản có giao dịch | Gọi endpoint trong Network tab | Response có `balance`, `currencySymbol`, `transactions`, `topupMethods`, không có dữ liệu mock | [ ] |
| WALLET-003 | `/wallet` | Tài khoản chưa có giao dịch | Mở trang | Khu lịch sử hiển thị empty state, không hiện transaction giả | [ ] |
| WALLET-004 | Chuyển VNSEEA | Có đủ điểm và có người nhận | Bấm `Chuyển VNSEEA`, nhập số nguyên dương, tìm user, chọn người nhận, gửi | API gọi `POST /_api/settings/points-transfer` với `requestId`; số dư/lịch sử refresh sau khi thành công | [ ] |
| WALLET-005 | Gửi tiền lỗi thiếu người nhận | Modal gửi tiền đang mở | Nhập amount nhưng không chọn người nhận, bấm gửi | Hiển thị lỗi validation, không gọi submit backend | [ ] |
| WALLET-006 | Gửi tiền lỗi amount | Modal gửi tiền đang mở | Nhập amount bằng 0 hoặc vượt số dư | Hiển thị lỗi validation, không gọi submit backend | [ ] |
| WALLET-007 | Search recipient | Có ít nhất một user khác | Nhập từ khóa >= 2 ký tự | Gọi `GET /_api/wallet/recipient-search`, danh sách người nhận lấy từ backend thật | [ ] |
| WALLET-008 | QR nhận VNSEEA | Đã đăng nhập | Bấm CTA QR | Modal hiển thị ảnh QR canonical `POINTS|to=...|points=...|amount=...` từ `points-qr-code` | [ ] |
| WALLET-009 | Nạp tiền PayPal/link | Backend bật PayPal | Bấm nạp tiền, chọn PayPal, nhập amount, submit | Gọi `GET /_api/wallet/topup-link`; nếu backend trả URL thì redirect ra URL đó | [ ] |
| WALLET-010 | Bank transfer upload | Có ảnh biên lai | Chọn method bank transfer, nhập amount, upload ảnh, submit | Gọi `POST /_api/wallet/bank-transfer`, backend tạo receipt chờ duyệt | [ ] |
| WALLET-011 | Bank transfer lỗi validation | Không chọn ảnh hoặc amount sai | Submit form bank transfer | Hiển thị lỗi validation từ Nuxt bridge/backend | [ ] |
| WALLET-012 | Responsive desktop | Viewport >= 1280px | Mở trang | Card, CTA và bảng giao dịch căn giữa, không tràn layout | [ ] |
| WALLET-013 | Responsive mobile | Viewport 390px | Mở trang và mở modal gửi tiền/QR | Nội dung stack đúng, modal dùng được, không bị overflow ngang | [ ] |

## Kiểm tra hồi quy

- [ ] `rg -n "useMockWalletData|mock" client/src/wallet` không còn import runtime active.
- [ ] Không gọi PHP trực tiếp từ `.vue`; chuyển VNSEEA đi qua `/_api/settings/points-transfer`.
- [ ] Không sửa `route-registry.ts`, `tokens.css`, `server/utils/**`.
