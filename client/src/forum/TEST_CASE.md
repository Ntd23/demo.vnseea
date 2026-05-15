English description: Manual QA checklist for the backend-backed forum context.

# TEST CASE - Forum

## FORUM-001 - Hard reload `/forum`
- Mở `/forum` bằng reload trình duyệt.
- Kỳ vọng gọi `/_api/forum`, hiển thị section và forum thật từ PHP.

## FORUM-002 - Section order
- So sánh với `themes/wowonder/layout/forum/forum.phtml`.
- Kỳ vọng header, ô tìm kiếm, danh sách section/forum theo đúng thứ tự phtml.

## FORUM-003 - Search forum
- Nhập từ khóa tìm kiếm forum.
- Kỳ vọng URL có `q`, backend lọc bằng `Wo_GetForumSec`.

## FORUM-004 - Open forum
- Bấm một forum trong danh sách.
- Kỳ vọng điều hướng sang URL forum backend tương ứng, không mở panel mock.

## FORUM-005 - Create thread CTA
- Với user có quyền forum, kiểm tra nút tạo thread.
- Kỳ vọng nút trỏ đến flow tạo thread backend với `fid` của forum đầu tiên.

## FORUM-006 - Empty state
- Tìm từ khóa không có forum.
- Kỳ vọng empty state chuẩn, không có thread giả.

## FORUM-007 - Responsive
- Kiểm tra mobile và desktop.
- Kỳ vọng bảng forum chuyển thành list dễ đọc, không vỡ cột.
