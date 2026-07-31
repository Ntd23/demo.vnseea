<!-- English description: Defines manual QA coverage for messages and Redis-backed online presence. -->

# Test Case Messages

## Phạm vi

- Context: `client/src/messages`
- Route chính: `/messages`
- Baseline PHP:
  - `themes/wowonder/layout/messages/content.phtml`
  - `xhr/messages.php`
  - `xhr/chat.php`
- API bridge đang dùng:
  - `GET /_api/messages/conversations`
  - `GET /_api/messages/thread`
  - `POST /_api/messages/send`
  - `POST /_api/messages/multi`
  - `POST /_api/messages/record/upload`
  - `POST /_api/messages/typing`
  - `POST /_api/messages/read`
  - `POST /_api/messages/delete`
  - `POST /_api/messages/presence`
  - `GET /_api/messages/group/details`
  - `GET /_api/messages/group/candidates`
  - `POST /_api/messages/group/members`
  - `GET /_api/messages/group/participants`
  - `POST /_api/messages/group/create`
- Presence Redis:
  - Local: `vnseea:local:presence:user:{userId}`
  - Production: `vnseea:prod:presence:user:{userId}`
- Phạm vi lưu trữ:
  - Nội dung message, session, call state và unread counter vẫn lưu trong MySQL.
  - Redis giữ online presence có TTL; Socket.IO chỉ broadcast các lần chuyển online/offline.

## Chuẩn bị

- Đăng nhập bằng session PHP hợp lệ.
- Có ít nhất:
  - 1 hội thoại 1:1
  - 1 group chat
  - 2 user để test typing, realtime và online presence
- Chuẩn bị:
  - 1 file hợp lệ để gửi
  - quyền microphone để test record
  - 1 ảnh JPG hoặc PNG để test avatar nhóm
- Viewport:
  - desktop `1440x900`
  - mobile `390x844`
- Redis chạy tại `127.0.0.1:6379`, database `0`.
- Nên đăng nhập User A và User B bằng hai browser profile khác nhau.

## Test Cases Hiện Có

| ID | Route | Cách test | Kỳ vọng |
| --- | --- | --- | --- |
| `MSG-001` | `/messages` | Hard reload route trên desktop. | Layout split-view đúng: trái là search + tabs + list, phải là thread/composer. |
| `MSG-002` | `/messages` | Mở Network rồi reload. | Inbox đi qua `/_api/messages/conversations`, thread đi qua `/_api/messages/thread`, không gọi raw PHP từ presentation. |
| `MSG-003` | `/messages` | Chuyển 3 tab `Send multiple`, `Users`, `Groups`. | Cả 3 tab còn hoạt động, không mất flow multi hay group. |
| `MSG-004` | `/messages` | Tìm theo tên hoặc preview. | Danh sách bên trái lọc đúng theo query. |
| `MSG-005` | `/messages` | Chọn 1 user chat. | Thread thật được tải, composer hỗ trợ `text`, `file`, `record`. |
| `MSG-006` | `/messages` | Gửi `text-only` trong 1:1. | Gọi `/_api/messages/send`, message mới xuất hiện cuối thread, inbox preview được refresh. |
| `MSG-007` | `/messages` | Gửi `file-only` trong 1:1. | `/_api/messages/send` đi multipart đúng, bubble render file hoặc media đúng loại. |
| `MSG-008` | `/messages` | Ghi âm rồi gửi `record-only` trong 1:1. | Upload qua `/_api/messages/record/upload`, sau đó gửi qua `/_api/messages/send`, thread render audio player. |
| `MSG-009` | `/messages` | Nhập text rồi ghi âm, gửi `text+record`. | Flow thành công, không trộn `file + record`. |
| `MSG-010` | `/messages` | Chọn file rồi bắt đầu ghi âm. | File bị clear trước khi ghi âm. |
| `MSG-011` | `/messages` | Ghi âm xong rồi chọn file. | Record draft bị clear, composer chỉ giữ file. |
| `MSG-012` | `/messages` | User A mở thread với user B, A bắt đầu nhập. | User B thấy typing indicator dạng `...` trong thread và ở row tab `Users`. |
| `MSG-013` | `/messages` | User A dừng nhập, blur input, đổi thread hoặc gửi tin. | User B mất typing indicator. |
| `MSG-014` | `/messages?tab=group` | Mở group thread rồi nhập. | Group không hiện typing indicator. |
| `MSG-015` | `/messages?tab=multi` | Chọn nhiều user, gửi `text-only`. | Gọi `/_api/messages/multi`, feedback đúng theo response thật. |
| `MSG-016` | `/messages?tab=multi` | Chọn nhiều user, gửi `file-only`. | Multi-send thành công với file. |
| `MSG-017` | `/messages?tab=multi` | Chọn nhiều user, gửi `record-only`. | Upload record trước rồi `multi_send` thật. |
| `MSG-018` | `/messages?tab=group` | Mở info panel của group do bạn sở hữu. | Panel hiển thị member roster thật từ `/_api/messages/group/details`, không còn card hardcode. |
| `MSG-019` | `/messages?tab=group` | Tìm user trong ô mời ở info panel rồi bấm `Add`. | Gọi `/_api/messages/group/candidates` và `/_api/messages/group/members`, backend trả success, candidate biến khỏi list. |
| `MSG-020` | `/messages?tab=group` | Bấm `Kick` ở một thành viên. | Gọi `/_api/messages/group/members` với action remove, member list và count được refresh từ backend. |
| `MSG-021` | `/messages?tab=group` | Đăng nhập bằng account không phải owner rồi mở info panel group. | Không gọi `/_api/messages/group/candidates`, không hiện ô mời hay nút `Kick`. |
| `MSG-022` | `/messages` | Bấm nút tạo nhóm mới. | Mở modal riêng đúng shell phtml: có tên nhóm, ô search member, selected list, avatar upload. Không còn phụ thuộc recipient đang chọn ở tab multi. |
| `MSG-023` | `/messages` | Mở modal tạo nhóm nhưng chưa gõ ô search. | Không gọi `/_api/messages/group/participants`. |
| `MSG-024` | `/messages` | Trong modal tạo nhóm, nhập từ khóa tìm người. | Gọi `/_api/messages/group/participants`, candidate list hiển thị đúng từ `xhr/chat.php?s=get_parts`. |
| `MSG-025` | `/messages` | Bấm chọn 1 candidate trong modal tạo nhóm. | Candidate được thêm vào selected list, counter tăng, candidate biến khỏi danh sách search. |
| `MSG-026` | `/messages` | Bấm bỏ 1 member đã chọn trong modal tạo nhóm. | Member bị xóa khỏi selected list, counter giảm. |
| `MSG-027` | `/messages` | Tạo nhóm với tên dưới 4 ký tự. | Modal hiển thị đúng error text backend từ `xhr/chat.php?s=create_group`. |
| `MSG-028` | `/messages` | Tạo nhóm khi chưa chọn member nào. | Modal hiển thị lỗi bridge rằng cần ít nhất 1 thành viên. |
| `MSG-029` | `/messages` | Upload avatar sai loại trong modal tạo nhóm. | Modal hiển thị đúng error text backend, không đóng modal. |
| `MSG-030` | `/messages` | Tạo nhóm thành công với tên, member, avatar hợp lệ. | Gọi `/_api/messages/group/create`, modal đóng, form reset sạch, tab chuyển sang `Groups`, inbox refresh, thread group mới được mở ngay. |
| `MSG-031` | `/messages` | Bấm `Load more` trong thread có lịch sử dài. | Gọi thread với `beforeId`, message cũ prepend lên đầu mà không trùng ID. |
| `MSG-032` | `/messages` | Có tin nhắn mới từ user khác khi socket đang sống. | Inbox preview và active thread refresh mà không cần hard reload. |
| `MSG-033` | `/messages` | Tắt realtime service rồi gửi/nhận tin. | Message mới vẫn cập nhật bằng polling fallback; typing 1:1 không còn realtime. |
| `MSG-034` | `/messages` | Test trên mobile: chọn contact rồi quay lại. | Flow mobile vẫn là list -> thread -> back, không làm vỡ desktop layout. |
| `MSG-035` | `/messages` | Từ chối quyền microphone rồi bấm ghi âm. | Composer hiển thị lỗi quyền microphone rõ ràng, không crash. |

## Redis Presence

### Health Và Key

```powershell
redis-cli PING
curl.exe http://127.0.0.1:3000/_api/health/redis
redis-cli --scan --pattern "vnseea:local:presence:user:*"
```

| ID | Status | Cách test | Kỳ vọng |
| --- | --- | --- | --- |
| `MSG-PRES-001` | [ ] | Chạy `PING` và Redis health endpoint. | `PONG`; health có `ok: true`, `configured: true`, `status: "ready"`. |
| `MSG-PRES-002` | [ ] | User A đăng nhập và mở route protected, sau đó scan key. | Có key `vnseea:local:presence:user:{userAId}`. |
| `MSG-PRES-003` | [ ] | Chạy `GET` key User A. | JSON có `status: "online"`, `device: "web"` và không chứa token/message. |
| `MSG-PRES-004` | [ ] | Chạy `TTL` key User A. | TTL lớn hơn `0`, không vượt quá `75` giây và không trả `-1`. |
| `MSG-PRES-005` | [ ] | Kiểm tra TTL mỗi 5 giây trong ít nhất 35 giây. | TTL giảm rồi tăng lại sau heartbeat khoảng 25 giây. |

### UI Online

| ID | Status | Cách test | Kỳ vọng |
| --- | --- | --- | --- |
| `MSG-PRES-006` | [ ] | Giữ User A online, User B reload `/messages`. | User A được hiển thị online trong inbox/follow relationship. |
| `MSG-PRES-007` | [ ] | User B mở thread với User A. | Online state đúng sau client navigation và hard reload. |
| `MSG-PRES-008` | [ ] | A và B cùng group, B mở thông tin group. | Thành viên A được hiển thị online. |
| `MSG-PRES-009` | [ ] | B xem group conversation khi A online. | Group phản ánh có thành viên online theo roster backend. |
| `MSG-PRES-010` | [ ] | Lặp lại ở desktop và mobile. | Online indicator không gây overflow hoặc chặn thao tác chat. |

### Offline Và TTL

| ID | Status | Cách test | Kỳ vọng |
| --- | --- | --- | --- |
| `MSG-PRES-011` | [ ] | User A logout, sau đó chạy `EXISTS` key A. | Key bị xóa, `EXISTS` trả `0`. |
| `MSG-PRES-012` | [ ] | User A mở hai tab protected rồi đóng một tab. | Key vẫn tồn tại do còn tab thứ hai. |
| `MSG-PRES-013` | [ ] | Đóng tab protected cuối cùng. | Beacon cố gắng xóa key; nếu beacon không chạy thì key hết hạn tối đa 75 giây. |
| `MSG-PRES-014` | [ ] | Kill browser hoặc ngắt mạng không logout. | Key tự hết hạn tối đa 75 giây. |
| `MSG-PRES-015` | [ ] | Sau khi key hết hạn, User B reload inbox. | API không lỗi; trạng thái fallback về status/`lastseen` PHP/MySQL. |

### Hạ Tầng Và Fallback

| ID | Status | Cách test | Kỳ vọng |
| --- | --- | --- | --- |
| `MSG-PRES-016` | [ ] | Khi key A tồn tại, restart Nuxt rồi reload inbox B. | Key không mất do restart Nuxt; B vẫn đọc được presence Redis. |
| `MSG-PRES-017` | [ ] | Dừng Redis rồi reload `/messages` và để heartbeat chạy. | Inbox/thread không 500/504; presence fallback PHP/MySQL, health Redis trả 503. |
| `MSG-PRES-018` | [ ] | Khởi động lại Redis, chờ heartbeat. | Health trở lại ready và key presence được tạo lại mà không restart Nuxt. |
| `MSG-PRES-019` | [ ] | Chạy `redis-cli MONITOR`, reload inbox nhiều user. | Inbox dùng một `MGET`, không có một `GET` riêng cho từng user. |
| `MSG-PRES-020` | [ ] | Kiểm tra key local và production. | Local chỉ dùng `vnseea:local:*`, production chỉ dùng `vnseea:prod:*`. |

### API Và Bảo Mật

| ID | Status | Cách test | Kỳ vọng |
| --- | --- | --- | --- |
| `MSG-PRES-021` | [ ] | User đăng nhập gọi `POST /_api/messages/presence` với `online`. | Trả `{ "ok": true }`, key current user được tạo/gia hạn. |
| `MSG-PRES-022` | [ ] | Gọi endpoint khi chưa đăng nhập. | Bị chặn theo PHP session; không tạo key. |
| `MSG-PRES-023` | [ ] | Gửi `offline` kèm `userId` của người khác. | Server bỏ qua `userId` body và chỉ dùng current user từ PHP session. |
| `MSG-PRES-024` | [ ] | Kiểm tra browser Network và client source. | Browser chỉ gọi `/_api/*`; không lộ `REDIS_URL`, port hoặc credential Redis. |

### Socket.IO Realtime

| ID | Status | Cách test | Kỳ vọng |
| --- | --- | --- | --- |
| `MSG-PRES-025` | [ ] | Mở `/messages` bằng User B, giữ User A offline rồi đăng nhập User A ở browser khác. | Row của User A chuyển online ngay qua `message:presence`, không chờ interval 30 giây. |
| `MSG-PRES-026` | [ ] | Giữ hai browser mở, logout User A. | Row User A trên `/messages` của User B chuyển offline ngay khi endpoint offline xóa key Redis. |
| `MSG-PRES-027` | [ ] | Lặp lại `MSG-PRES-025` và `MSG-PRES-026` trong `ChatWidget`. | Dot online trong widget cập nhật ngay và mini chat dùng cùng trạng thái contact. |
| `MSG-PRES-028` | [ ] | User B chỉ có A trong danh sách đang theo dõi; cho User C đổi online/offline. | B không nhận event presence của C; event chỉ phát vào room `presence:{userId}` đã subscribe. |
| `MSG-PRES-029` | [ ] | Đổi bộ lọc/tag để danh sách contact đang theo dõi thay đổi. | Socket thay danh sách room; room cũ được leave và room mới được join, không tích lũy subscription cũ. |
| `MSG-PRES-030` | [ ] | Theo dõi Network/Socket.IO qua nhiều heartbeat 25 giây của cùng một user vẫn online. | TTL Redis được gia hạn nhưng không broadcast online lặp lại khi trạng thái không đổi. |
| `MSG-PRES-031` | [ ] | Kill browser User A để không có offline beacon, chờ quá 75 giây. | Key Redis tự hết hạn; refresh fallback tối đa 30 giây trên `/messages` đưa A về offline. |
| `MSG-PRES-032` | [ ] | Dừng realtime relay, đổi trạng thái A rồi khởi động lại relay. | Presence API vẫn trả thành công; Redis vẫn đúng; UI hội tụ lại bằng refresh fallback và lần socket reconnect tiếp theo. |
| `MSG-PRES-033` | [ ] | Gọi internal presence publish không có/sai `x-realtime-secret`, sau đó gửi `userId` hoặc `online` sai kiểu. | Relay trả lần lượt `401` và `400`, không phát event cho client. |

## Kiểm Tra Tĩnh

```powershell
cd client
corepack pnpm exec tsc --noEmit
node --test scripts/message-realtime-server.test.mjs
node --check ecosystem.config.cjs
rg -n "recipient_is_typing|remove_typing|upload_record|multi_send|send_message" src/messages server/api/messages
rg -n "group_chat\\s*\"?,?\\s*\\{\\s*type:\\s*\"create\"" src/messages server/api/messages
rg -n "group/participants|group/create" src/messages server/api/messages
git diff --check
```

Kỳ vọng:

- Runtime active không còn dùng selected recipients của tab multi để tạo group.
- Create-group flow active dùng `xhr/chat.php` bridge qua `/_api/messages/group/participants` và `/_api/messages/group/create`.
- Add/kick group hiện có không bị ảnh hưởng.
- Redis presence đọc theo batch và không thay thế dữ liệu message/session trong MySQL.

Không chạy `nuxt build` khi dev server của project đang hoạt động. Khi cần test production build, dừng dev server trước rồi chạy:

```powershell
cd client
corepack pnpm build
```

## Ghi Chú

- `pagehide`/`sendBeacon` chỉ là best-effort; TTL 75 giây mới là cơ chế dọn offline chính.
- Socket.IO broadcast chỉ tối ưu độ trễ UI; Redis TTL và inbox refresh vẫn là lớp phục hồi bắt buộc.
