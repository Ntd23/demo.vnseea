English description: Manual QA cases for the backend-backed messages bounded context, including inbox, user/group/page threads, multi-send, media attachments, and group creation.

# Test Case Messages

## Phạm vi

- Context: `client/src/messages`
- Route chính: `/messages`
- API bridge: `/_api/messages/conversations`, `/_api/messages/thread`, `/_api/messages/send`, `/_api/messages/multi`, `/_api/messages/read`, `/_api/messages/delete`, `/_api/messages/group`
- Baseline phtml: `themes/wowonder/layout/messages/content.phtml`

## Chuẩn bị

- Đăng nhập bằng session PHP hợp lệ.
- Tài khoản test có ít nhất một hội thoại user, một group chat và một page chat nếu muốn kiểm đủ 3 loại thread.
- Chuẩn bị một ảnh nhỏ hoặc file hợp lệ để test gửi đính kèm.
- Viewport cần kiểm: desktop `1440x900`, mobile `390x844`.

## Test cases

| ID | Màn hình | Route | Cách test | Kỳ vọng |
| --- | --- | --- | --- | --- |
| `MSG-001` | Desktop | `/messages` | Hard reload route. | Layout dạng split-view giống phtml: cột trái search/action/tabs/list có divider dọc, vùng giữa rộng nền trắng có empty illustration và composer đáy; cột info chỉ mở khi bấm thông tin. Không gọi mock endpoint. |
| `MSG-002` | Desktop | `/messages` | Mở Network và reload. | Danh sách hội thoại lấy từ `/_api/messages/conversations`; route cũ `messages/inbox` chỉ còn là alias tương thích. |
| `MSG-003` | Desktop | `/messages` | Chuyển tab `Gửi nhiều người`, `Người dùng`, `Nhóm`. | Tab multi hiện danh sách user nhận được từ backend; tab user hiện user/page chat; tab group chỉ hiện group chat. |
| `MSG-004` | Desktop | `/messages` | Tìm kiếm theo tên hoặc preview. | Danh sách bên trái được lọc đúng, không làm mất thread đang mở hoặc vỡ panel phải. |
| `MSG-005` | Desktop | `/messages` | Chọn một user chat. | Thread tải từ `/_api/messages/thread`; header, avatar, trạng thái và info panel đổi theo contact đã chọn. |
| `MSG-006` | Desktop | `/messages` | Gửi tin nhắn text. | Composer gọi `/_api/messages/send`; message mới xuất hiện cuối thread; inbox được refresh để cập nhật preview. |
| `MSG-007` | Desktop | `/messages` | Gửi tin nhắn có file/ảnh. | `/_api/messages/send` gửi multipart; bubble hiển thị media đúng loại ảnh/video/audio/file nếu backend trả media. |
| `MSG-008` | Desktop | `/messages` | Bấm `Tải tin nhắn cũ`. | API gọi lại thread với `beforeId`; tin nhắn cũ chèn lên đầu và không bị trùng ID. |
| `MSG-009` | Desktop | `/messages` | Bấm `Đánh dấu đã đọc`. | Gọi `/_api/messages/read`; unread count trong inbox giảm theo phản hồi backend. |
| `MSG-010` | Desktop | `/messages` | Mở một user/page chat rồi bấm `Xóa`. | Gọi `/_api/messages/delete`; hội thoại biến khỏi danh sách hoặc trạng thái được refresh từ backend. |
| `MSG-011` | Desktop | `/messages?tab=multi` | Chọn nhiều user, nhập text rồi gửi. | Gọi `/_api/messages/multi`; trạng thái success/partial/error theo đúng phản hồi PHP `messages&s=multi_send`. |
| `MSG-012` | Desktop | `/messages?tab=multi` | Chọn nhiều user, nhập tên nhóm từ nút `Chat nhóm mới`, submit. | Gọi `/_api/messages/group`; danh sách group được refresh từ backend và không tạo group local-only. |
| `MSG-013` | Mobile | `/messages` | Hard reload, chọn contact, mở info. | UI stack theo mobile, không ép 3 cột ngang; composer vẫn dùng được và không che nội dung thread. |
| `MSG-014` | Mobile | `/messages?tab=multi` | Vào tab gửi nhiều, chọn ít nhất một người nhận, bấm `Mở khung soạn`, gửi text hoặc file. | Mobile không tự ẩn list trước khi chọn người nhận; composer mở ở màn hình riêng, nút quay lại đưa về list, payload vẫn đi qua `/_api/messages/multi`. |
| `MSG-015` | Desktop/Mobile | `/messages` | Tắt mạng hoặc dùng session hết hạn rồi thao tác gửi/xóa/tạo group. | Hiện toast lỗi i18n, không thêm dữ liệu giả vào UI. |

## Kiểm tra tĩnh

```powershell
cd client
rg -n "mock|fallback|messageOne|messageTwo|contactName|Van Nguyen" src/messages server/api/messages app/pages/messages.vue -g "!TEST_CASE.md" -g "!README.md"
```

Kỳ vọng không có mock/fallback runtime active trong context messages.
