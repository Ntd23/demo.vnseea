English description: Manual QA checklist for backend-backed realtime notifications and header counters.

# TEST CASE - Notifications

## NOTI-001 - Reload không mất badge

- Đăng nhập và vào `/home`.
- Reload cứng trang.
- Kỳ vọng badge chuông, lời mời kết bạn, lời mời nhóm chat và tin nhắn lấy từ `/_api/navigation/general`, không bị về `0` sai dữ liệu.

## NOTI-002 - Dropdown notification hiển thị đủ type backend

- Tạo hoặc chuẩn bị các notification từ backend: like/reaction, comment/reply, share, mention, follow, story view, event, group/page, blog/forum, job, funding, wallet/bank, order/checkout, admin notification.
- Mở dropdown chuông.
- Kỳ vọng mỗi item dùng `type_text`, `url`, `icon`, `notifier`, `time_text` từ backend, không có text mock hoặc fallback giả.

## NOTI-003 - Mark read và delete

- Mở dropdown chuông khi có notification chưa đọc.
- Kỳ vọng `/_api/notifications/read` đánh dấu đã xem và badge cập nhật.
- Bấm xóa một notification.
- Kỳ vọng `/_api/notifications/delete` được gọi, item biến mất và badge giảm đúng nếu item chưa đọc.

## NOTI-004 - Realtime notification chung

- Mở user B trên web.
- Từ user A tạo hành động có gọi `Wo_RegisterNotification()` như comment, mention, donate funding, apply job hoặc send money.
- Kỳ vọng user B nhận socket event, Nuxt refetch `/_api/notifications` và `/_api/navigation/general`, badge/list cập nhật không cần reload.

## NOTI-005 - Friend request dropdown

- Từ user A gửi lời mời/follow request tới user B.
- Kỳ vọng header user B tăng badge request realtime.
- Mở dropdown request.
- Kỳ vọng list lấy từ `fetch=friend_requests`, hiển thị avatar, tên, username và nút accept/decline.
- Accept hoặc decline phải gọi `/_api/navigation/requests/action` và badge cập nhật.

## NOTI-006 - Group chat request count

- Tạo lời mời nhóm chat cho user B.
- Kỳ vọng header user B tăng badge request.
- Mở dropdown request.
- Kỳ vọng item nhóm chat hiển thị cùng list request và action accept/decline cập nhật count.

## NOTI-007 - Message badge realtime

- User A gửi tin nhắn cho user B khi user B đang mở web.
- Kỳ vọng badge message trên header user B cập nhật qua socket/polling.
- Bấm icon message phải đi tới `/messages`; không yêu cầu thread realtime trong pass này.

## NOTI-008 - Sound toggle

- Mở dropdown notification.
- Bấm nút âm thanh.
- Kỳ vọng gọi `/_api/notifications/sound`, backend cập nhật `notifications_sound`, UI đổi trạng thái bật/tắt âm.

## NOTI-009 - Marketplace/order notification realtime

- User A mua sản phẩm, thêm tracking, đổi trạng thái đơn hoặc gửi review.
- Kỳ vọng owner/buyer nhận realtime event, sau đó Nuxt refetch notification thật từ backend.
- Kỳ vọng dropdown hiển thị `new_orders`, `added_tracking`, `status_changed`, `new_review` bằng text/url/icon backend.

## NOTI-010 - Memory và video-ready notification

- Tạo điều kiện có memory trong ngày hoặc upload video cần xử lý ffmpeg.
- Kỳ vọng notification `memory` và `admin_notification/type2=ffmpeg` xuất hiện trong dropdown khi backend tạo.
- Nếu user đang mở web, badge cập nhật realtime hoặc bằng polling khi realtime service không chạy.

## NOTI-011 - Fallback khi realtime service tắt

- Tắt service `vnseea-realtime` hoặc bỏ `NUXT_PUBLIC_REALTIME_URL`.
- Reload trang.
- Kỳ vọng UI không crash, dropdown vẫn tải được danh sách và badge refresh bằng polling khoảng 30 giây.

## NOTI-012 - Static boundary

- Chạy kiểm tra import legacy:
  `Select-String -Path client/src/feed/application/composables/useHashtagData.ts -Pattern "types/community|types/checkout"`
- Kỳ vọng không còn import tới legacy `client/types/*`.
- Kiểm tra component notification/header chỉ gọi store hoặc `/_api/*`, không gọi raw PHP endpoint.
