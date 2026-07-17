<!-- English description: Defines the Redis adoption tasks, boundaries, key conventions, and rollout checks for this project. -->

# Các task cần dùng Redis

## Mục tiêu

Redis trong project này dùng cho dữ liệu tạm thời cần tốc độ cao, thao tác atomic hoặc phải dùng chung giữa nhiều PHP/Nuxt/Node instance. MySQL vẫn là nguồn dữ liệu chính cho dữ liệu nghiệp vụ.

## Hiện trạng trong repo

- `nodejs/main.js` đã hỗ trợ `socket.io-redis` khi cấu hình `redis = Y`, nhưng đang kết nối cứng tới `localhost` và chỉ dùng Redis làm Socket.IO adapter.
- `nodejs/package.json` đang dùng `socket.io-redis@5.4.0` cùng Socket.IO 2.x.
- `assets/includes/functions_general.php::cache()` đang cache user/group bằng file trong thư mục `cache/`, không dùng chung được giữa nhiều app server.
- `client/server/api/messages/_presence.ts` lưu presence bằng `Map` trong RAM với TTL 70 giây. Dữ liệu mất khi restart và không đồng bộ giữa nhiều Nuxt instance.
- `client/src/messages/application/composables/useMessageCalls.ts` polling trạng thái cuộc gọi mỗi 2 giây và cuộc gọi đến mỗi 5 giây.
- `client/src/notifications/application/stores/useNotificationCenterStore.ts` fallback polling thông báo mỗi 10 giây.
- `api/v2/endpoints/get-general-data.php` đang tính lại nhiều badge như tin nhắn, thông báo và lời mời từ database.

## Quy tắc sử dụng

Nên dùng Redis khi task cần ít nhất một trong các đặc điểm sau:

- Trạng thái ngắn hạn có TTL.
- Counter hoặc lock phải cập nhật atomic.
- Dữ liệu phải được chia sẻ giữa nhiều process hoặc nhiều server.
- Sự kiện realtime cần phát tới đúng user/room.
- Kết quả đọc nhiều nhưng ít thay đổi và có thể tái tạo từ MySQL.

Không dùng Redis làm nơi lưu duy nhất cho dữ liệu cần tồn tại lâu dài hoặc cần audit.

## P0 - Cần triển khai trước

| Task | Redis primitive | TTL đề xuất | Nguồn dữ liệu chính / fallback |
| --- | --- | --- | --- |
| Tạo Redis client dùng chung cho PHP, Nuxt server và Node realtime | Connection pool/singleton | Không áp dụng | Nếu Redis lỗi, request không quan trọng phải fallback về MySQL; timeout kết nối tối đa 100-300 ms |
| Đồng bộ Socket.IO khi chạy nhiều Node instance | Pub/Sub adapter | Theo connection | Socket.IO chạy một instance vẫn phải hoạt động khi Redis tạm lỗi |
| Presence online/offline của chat | `SET ... EX`, `DEL` | 70-90 giây | Fallback về `lastseen` trong MySQL |
| Trạng thái ringing/busy/accepted/ended của cuộc gọi | String/Hash + Pub/Sub hoặc Streams + lock `SET NX EX` | 60-120 giây | Bảng call trong MySQL vẫn lưu lịch sử và trạng thái cuối |
| Badge chưa đọc: message, notification, friend request, group request | Hash/counter atomic | 5-15 phút hoặc rebuild khi miss | Có thể đếm lại từ MySQL khi cache miss hoặc counter lệch |
| Rate limit cho auth và endpoint nhạy cảm | `INCR` + `EXPIRE` hoặc Lua script | Theo cửa sổ giới hạn | Khi Redis lỗi phải áp dụng policy rõ ràng theo endpoint, không âm thầm bỏ bảo vệ auth |

### Checklist hạ tầng Redis

- [ ] Thêm biến môi trường `REDIS_URL`, `REDIS_PREFIX`, `REDIS_CONNECT_TIMEOUT_MS` và `REDIS_COMMAND_TIMEOUT_MS`.
- [ ] Không hardcode `localhost`, port hoặc password trong source.
- [ ] Tạo client singleton riêng cho PHP, Nitro server và Node realtime; browser không được kết nối trực tiếp Redis.
- [ ] Thêm health check gồm trạng thái kết nối, latency `PING` và lỗi gần nhất.
- [ ] Dùng prefix tách môi trường để staging không đọc key production.
- [ ] Có circuit breaker hoặc thời gian backoff để Redis lỗi không kéo theo 504 hàng loạt.
- [ ] Log cache hit/miss, timeout, reconnect và số connection; không log token hoặc nội dung tin nhắn.

### Presence và realtime message

Các file liên quan:

- `client/server/api/messages/_presence.ts`
- `client/server/api/messages/presence.post.ts`
- `client/src/messages/application/composables/useMessageRealtime.ts`
- `nodejs/main.js`

Task cần làm:

- [ ] Thay `Map<number, PresenceRecord>` bằng key Redis dùng chung giữa các Nuxt instance.
- [ ] Client gửi heartbeat khoảng 20-30 giây; server gia hạn TTL thay vì ghi dữ liệu vĩnh viễn.
- [ ] Logout hoặc đóng phiên chủ động xóa presence; mất mạng thì TTL tự hết.
- [ ] Phát sự kiện presence qua Socket.IO để UI không phải polling từng user.
- [ ] Không dùng sự kiện `unload` làm cơ chế chính vì browser/mobile không đảm bảo gửi được.

Key đề xuất:

```text
vnseea:{env}:presence:user:{userId} = {"status":"online","device":"web"}
TTL = 75 seconds
```

### Cuộc gọi audio/video

Các file liên quan:

- `client/src/messages/application/composables/useMessageCalls.ts`
- `client/server/api/messages/calls/*`
- `nodejs/main.js`

Task cần làm:

- [ ] Tạo lock theo caller và callee để hai request không tạo hai cuộc gọi song song.
- [ ] Phát `call:incoming`, `call:answered`, `call:declined`, `call:ended` qua realtime thay cho polling 2/5 giây.
- [ ] Giữ polling chậm làm fallback khi socket bị ngắt, không dùng polling làm luồng chính.
- [ ] Dùng idempotency key cho create/answer/end để retry mạng không tạo hoặc kết thúc trùng.
- [ ] TTL tự dọn ringing/busy nếu app bị kill giữa cuộc gọi.

Key đề xuất:

```text
vnseea:{env}:lock:call:user:{userId}
vnseea:{env}:call:{callId}:state
vnseea:{env}:idempotency:call:{requestId}
```

### Unread counters và navigation badges

Các file liên quan:

- `api/v2/endpoints/get-general-data.php`
- `client/server/api/navigation/general.get.ts`
- `client/src/navigation/application/stores/useNavigationGeneralStore.ts`
- `client/src/notifications/application/stores/useNotificationCenterStore.ts`

Task cần làm:

- [ ] Lưu counter theo user trong Redis Hash.
- [ ] Tăng counter sau khi transaction MySQL tạo message/notification thành công.
- [ ] Giảm hoặc đặt về 0 khi mark read đã commit thành công.
- [ ] Phát sự kiện `messages:count`, `notification:counts-changed` sau khi cập nhật counter.
- [ ] Khi key không tồn tại, rebuild counter từ MySQL rồi ghi lại Redis.
- [ ] Thêm job đối soát định kỳ để sửa counter lệch.

```text
vnseea:{env}:unread:user:{userId}
fields: messages, notifications, friend_requests, group_requests
```

### Rate limiting

Các endpoint cần ưu tiên:

- [ ] Login, register, forgot password, reset password, OTP và two-factor.
- [ ] Gửi message, comment, reaction, follow, invite và report.
- [ ] Upload ảnh/video/audio và tạo LiveKit call.
- [ ] Search, mention suggestions, nearby search và public API dễ bị crawl.
- [ ] Payment callback chỉ dùng Redis làm lớp chống burst; idempotency bền vững vẫn phải ở MySQL.

Key phải gắn với route và subject phù hợp, ví dụ user ID, IP hoặc cả hai:

```text
vnseea:{env}:rate:{route}:{subject}:{window}
```

## P1 - Cache và xử lý nền

| Task | TTL đề xuất | Invalidate khi |
| --- | --- | --- |
| Thay file cache user/group bằng Redis cache adapter | 3-5 phút | Update profile, follow, block, group member hoặc permission |
| Cache config chung, currency, category, language metadata | 10-30 phút | Admin thay setting hoặc deploy dữ liệu mới |
| Cache first page của feed phổ biến | 15-30 giây | Có post mới, xóa post hoặc thay quyền riêng tư; key phải chứa user/audience |
| Cache profile/page/group summary | 1-5 phút | Thay profile, cover, counters hoặc membership |
| Cache danh mục forum/movie/job/product | 5-15 phút | Admin hoặc owner tạo/sửa/xóa nội dung |
| Cache search suggestions và hashtag trending | 30-120 giây | Có thể để TTL tự hết |
| Cache geocoding/reverse geocoding | 1-7 ngày | Key theo tọa độ đã làm tròn hoặc place ID |

### Chuyển file cache PHP sang Redis

File liên quan: `assets/includes/functions_general.php`.

- [ ] Giữ nguyên contract `cache($id, $folder, $type, $data)` để giảm phạm vi sửa code cũ.
- [ ] Thêm adapter Redis phía sau contract hiện tại.
- [ ] Trong giai đoạn rollout, cho phép cấu hình `file`, `redis` hoặc `redis_with_file_fallback`.
- [ ] Dùng serializer thống nhất; tránh PHP object không tương thích giữa version deploy.
- [ ] Không dùng wildcard `KEYS` để xóa cache production; dùng key cụ thể, tag/version hoặc `SCAN` ngoài request.

### Background jobs

Redis queue phù hợp cho các task không cần hoàn tất trong request HTTP:

- [ ] Gửi push notification, email và webhook.
- [ ] Tạo thumbnail video, transcode media và xử lý FFmpeg.
- [ ] Fan-out notification tới nhiều thành viên/follower.
- [ ] Cập nhật analytics, trending và aggregate counters.
- [ ] Dọn dữ liệu tạm, cache cũ và phiên realtime hết hạn.

Yêu cầu queue:

- [ ] Chọn một cơ chế duy nhất cho worker, ví dụ Redis Streams hoặc một queue library tương thích stack hiện tại.
- [ ] Có retry với exponential backoff, max attempts và dead-letter queue.
- [ ] Mỗi job có idempotency key để worker chạy lại không tạo dữ liệu trùng.
- [ ] Dữ liệu nghiệp vụ phải commit MySQL trước khi publish job; task quan trọng nên dùng outbox để tránh mất job.

## P2 - Tối ưu sau khi P0/P1 ổn định

- [ ] Cache kết quả nearby/map theo geohash, radius và filter.
- [ ] Sorted Set cho trending posts, hashtags, movies, jobs và forum topics.
- [ ] Counter tạm cho views/likes/analytics rồi flush theo batch về MySQL.
- [ ] Cache kết quả danh sách public có traffic lớn như events, products, funding và offers.
- [ ] Cache response sitemap/public content nếu quá trình sinh dữ liệu tốn nhiều query.

## Session và token

Session hiện tại vẫn phải được lưu trong bảng session của MySQL để quản lý và audit.

- [ ] Có thể cache ánh xạ `hash(token) -> user/session` trong 1-5 phút để giảm query xác thực.
- [ ] Khi logout, xóa session DB trước rồi xóa cache và phát event revoke.
- [ ] Không đặt raw access token trong key Redis hoặc log.
- [ ] Danh sách revoke ngắn hạn có thể dùng Redis TTL, nhưng không thay thế thao tác revoke trong MySQL.

## Lock và idempotency nghiệp vụ

Redis lock chỉ là lớp chặn cạnh tranh nhanh, không thay thế transaction/unique constraint trong MySQL.

Các luồng nên có lock:

- [ ] Chuyển VNSEEA/points và cập nhật wallet.
- [ ] Tạo order, checkout, funding donation và payment callback.
- [ ] Trừ tiền quảng cáo theo click/view.
- [ ] Follow/join/invite/reaction khi client retry liên tục.
- [ ] Publish post/story/event khi upload hoặc request bị gửi lặp.

Luồng `assets/includes/vnseea_points_transfer.php` đã có idempotency bền vững; không được thay bảng request hiện tại bằng Redis.

## Dữ liệu không được chỉ lưu trong Redis

- User, page, group và quyền thành viên.
- Post, comment, message, notification và lịch sử cuộc gọi.
- Product, order, job application, funding và event.
- Wallet, points, payment transaction và audit log.
- Trạng thái duyệt, block, report và các quyết định phân quyền.

Pub/Sub cũng không bảo đảm lưu sự kiện. Sự kiện bắt buộc xử lý phải có bản ghi MySQL/outbox hoặc Redis Streams với consumer acknowledgement.

## Quy ước key

```text
vnseea:{environment}:{context}:{entity}:{id}[:{variant}]
```

Ví dụ:

```text
vnseea:prod:cache:user:123
vnseea:prod:cache:group:456
vnseea:prod:presence:user:123
vnseea:prod:unread:user:123
vnseea:prod:rate:auth-login:ip-sha256:202607171030
vnseea:prod:lock:payment:provider:transaction-id
vnseea:prod:idempotency:message:request-uuid
```

Không đưa email, số điện thoại, access token hoặc nội dung riêng tư trực tiếp vào key. Khi cần định danh, dùng ID nội bộ hoặc hash SHA-256.

## Chính sách vận hành

- [ ] Tách Redis cache/presence khỏi Redis queue nếu có thể vì eviction policy và yêu cầu persistence khác nhau.
- [ ] Cache/presence có thể dùng `allkeys-lru` hoặc policy phù hợp dung lượng; queue/idempotency quan trọng không được bị eviction tùy ý.
- [ ] Bật ACL, password mạnh, network private và TLS nếu kết nối qua mạng không tin cậy.
- [ ] Đặt `maxmemory`, theo dõi memory fragmentation, evictions, blocked clients và slow commands.
- [ ] Không expose port Redis ra Internet.
- [ ] Chốt yêu cầu persistence: cache không cần backup; queue/idempotency cần AOF hoặc nguồn bền vững khác.
- [ ] Có dashboard và alert cho latency, connection, hit rate, memory, eviction và replication lag.

## Thứ tự rollout

1. Hoàn thiện Redis client, cấu hình, health check, metrics và fallback.
2. Chuyển presence sang Redis và kiểm tra với ít nhất hai Nuxt instance.
3. Hoàn thiện Socket.IO adapter và thay call polling bằng realtime event có fallback.
4. Thêm rate limit cho auth, upload, message và call.
5. Thêm unread counters kèm cơ chế rebuild/đối soát.
6. Chuyển file cache user/group sang Redis adapter.
7. Bổ sung cache cho general data, feed và các danh mục đọc nhiều.
8. Triển khai queue cho media, push/email và fan-out notification.
9. Chỉ triển khai trending/analytics batch sau khi các luồng trên ổn định.

## Tiêu chí hoàn thành

- [ ] Chạy hai instance Nuxt/Node vẫn thấy presence, notification và call giống nhau.
- [ ] Restart một instance không làm mất trạng thái đang còn TTL ở instance khác.
- [ ] Redis ngắt tạm thời không làm login toàn site, đọc profile hoặc luồng thanh toán bị sai dữ liệu.
- [ ] Không còn request polling dày gây 504 ở presence/call khi realtime hoạt động.
- [ ] Counter unread có thể rebuild từ MySQL và không âm.
- [ ] Mọi lock đều có TTL và chỉ owner của lock được release.
- [ ] Cache personalized có user ID, privacy version và filter trong key.
- [ ] Có test cache hit/miss, expiry, invalidation, reconnect, duplicate request và Redis outage.
- [ ] Có số liệu trước/sau về P95 latency, query count, polling request rate và Redis hit rate.
