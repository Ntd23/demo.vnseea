

# Socket.IO, WebSocket và WebRTC trong Message Context

- **HTTP/REST**: lấy dữ liệu chuẩn, ghi dữ liệu vào PHP/MySQL và làm đường dự phòng.
- **Socket.IO/WebSocket**: đẩy sự kiện nhẹ cần phản hồi ngay, như typing, presence, tin nhắn mới và cuộc gọi đến.
- **WebRTC/LiveKit**: truyền audio/video thời gian thực.

## 1. 

> WebSocket là kết nối full-duplex, giữ lâu dài giữa client và server. Socket.IO là thư viện event-based, chạy trên WebSocket khi có thể, bổ sung reconnect, rooms, acknowledgements và fallback transport. WebRTC dùng để truyền media peer-to-peer hoặc qua SFU; nó không tự tìm peer nên cần signaling server. Trong Vnseea, Socket.IO dùng cho signaling, notification và đồng bộ trạng thái; PHP/MySQL vẫn là source of truth; LiveKit/WebRTC dùng cho audio/video call.

tại sao không dùng Socket.IO cho tất cả:

> Socket event có thể bị bỏ lỡ lúc reconnect, bị lặp hoặc đến sai thứ tự. Những thao tác nghiệp vụ quan trọng như gửi tin nhắn, tạo call, chấp nhận call và xoá message vẫn cần HTTP/PHP transaction để dữ liệu bền vững. Socket chỉ đẩy invalidation/event để UI cập nhật nhanh; client refetch từ REST khi cần.

## 2. Bốn công nghệ khác nhau thế nào?

| Nội dung | HTTP/REST | WebSocket | Socket.IO | WebRTC |
| --- | --- | --- | --- | --- |
| Kết nối | Request/response, thường đóng sau response | Kết nối dài hạn, hai chiều | Lớp protocol/event trên transport, thường là WebSocket | Kết nối media/data giữa peers hoặc qua SFU |
| Dữ liệu phù hợp | CRUD, auth, source of truth | Event nhẹ, realtime | Chat event, rooms, reconnect, presence | Audio, video, screen share, data channel |
| Tự reconnect | Không | Phải tự viết | Có sẵn | Phải xử lý signaling và ICE retry |
| Rooms | Không có | Phải tự tạo | Có <code>socket.join(room)</code> | Không phải room của Socket.IO; LiveKit có Room riêng |
| Lưu vào DB | Có thể | Không nên coi là source of truth | Không nên coi là source of truth | Không |
| Chạy qua proxy | HTTP reverse proxy | Cần header <code>Upgrade</code> | Cần proxy <code>/socket.io/</code> đúng | Cần UDP/TCP cho media server, STUN/TURN khi cần |

### 2.1 WebSocket

WebSocket bắt đầu bằng HTTP handshake có header <code>Upgrade: websocket</code>. Sau khi server chấp nhận, một TCP connection được giữ mở và hai bên đều có thể gửi frame bất kỳ lúc nào.

**Điểm mạnh**:

- Độ trễ thấp hơn polling.
- Server có thể push ngay lập tức.
- Phù hợp với typing, online state, notification, game state và dashboard realtime.

**Điểm yếu**:

- Kết nối có thể rớt bất kỳ lúc nào: đổi mạng, máy ngủ, reverse proxy timeout, deploy hoặc server restart.
- Phải xử lý auth khi connect, reconnect, duplicate event và thứ tự event không bảo đảm giữa các connection khác nhau.
- Đây không phải database, cũng không tự bảo đảm event được xử lý đúng một lần.

### 2.2 Socket.IO không đồng nghĩa với WebSocket

Socket.IO không phải “WebSocket viết cách khác”. Đây là protocol và thư viện riêng. Browser dùng Socket.IO client phải nói chuyện với Socket.IO server, không thể thay bằng WebSocket client thuần tuý.

Socket.IO bổ sung:

- Event có tên, ví dụ <code>socket.emit("message:typing", payload)</code>.
- Rooms, như <code>user:5</code>, <code>presence:5</code> và group room.
- Tự reconnect và backoff.
- Heartbeat/ping-pong.
- Acknowledgement callback khi cần.
- Fallback transport polling trong một số cấu hình.

Trong Vnseea, browser ưu tiên <code>transports: ["websocket"]</code>. Nếu proxy <code>/socket.io/</code> sai, client sẽ không kết nối đúng cách; không nên dựa vào REST polling dày đặc để thay thế lâu dài.

### 2.3 WebRTC

WebRTC là tập API trình duyệt để truyền media có độ trễ thấp. Các thành phần cần nhớ:

- <code>getUserMedia</code>: xin camera/microphone.
- <code>RTCPeerConnection</code>: peer connection và ICE.
- SDP offer/answer: mô tả codec, track và transport.
- ICE candidate: các địa chỉ/đường kết nối có thể thử.
- STUN: giúp tìm public-facing address sau NAT.
- TURN: relay media khi peer-to-peer thất bại do NAT/firewall; cần tính bandwidth và chi phí.

WebRTC **cần signaling**, nhưng không quy định signaling phải là gì. Signaling có thể là Socket.IO, WebSocket thuần, HTTP polling hoặc bất kỳ kênh nào. Trong Vnseea, Socket.IO/PHP notification đẩy event call; LiveKit cấp token/room và xử lý media plane.

### 2.4 LiveKit và SFU

Với call nhiều người, mesh WebRTC không phù hợp: mỗi user phải gửi một uplink cho từng người còn lại. Chi phí upload của mỗi user tăng gần <code>O(n)</code> và tổng số lượng kết nối tăng nhanh.

LiveKit là SFU (Selective Forwarding Unit):

~~~text
User A -- uplink --> LiveKit SFU -- downlink --> User B
User C -- uplink --> LiveKit SFU -- downlink --> User A, User B
~~~

SFU nhận track và chuyển tiếp track thay vì decode/encode lại trong đa số trường hợp. Vì vậy nó phù hợp với group call, adaptive stream và simulcast.

## 3. Kiến trúc hiện tại của Vnseea

~~~text
+----------------------- Browser / Nuxt UI -----------------------+
| Message pages, ChatWidget, typing UI, incoming-call modal       |
+--------------------------+----------------------+---------------+
                           |                      |
                      /_api/* HTTP          Socket.IO /socket.io/
                           |                      |
+--------------------------v----------------------v---------------+
| Nuxt Nitro bridge + notification-server.mjs                      |
| - auth bridge                - rooms user:<id>, presence:<id>   |
| - realtime token endpoint    - event fan-out                    |
+--------------------------+----------------------+---------------+
                           |                      |
                 PHP API / MySQL             LiveKit token / room
                           |                      |
+--------------------------v----------------------v---------------+
| PHP backend is source of truth       LiveKit is media plane      |
| users, messages, group members, calls, permissions               |
+------------------------------------------------------------------+
~~~

### 3.1 Phân vai đúng

| Lớp | Trách nhiệm |
| --- | --- |
| Vue presentation | Render chat, typing, trạng thái ringing và controls call |
| Application composable / VM | Kết nối socket, lên lịch fallback, refetch UI state |
| Repository / Nuxt <code>/_api</code> | Gọi API chuẩn, không gọi raw PHP từ browser |
| PHP + MySQL | Auth, permission, persist message/call/member, source of truth |
| <code>notification-server.mjs</code> | Xác thực socket token, room, fan-out event realtime |
| LiveKit | Audio/video track, room và media connection |

### 3.2 Các file nên nhớ

| Mục đích | File |
| --- | --- |
| Socket relay | <code>client/realtime/notification-server.mjs</code> |
| Cấp realtime token | <code>client/server/api/realtime/token.get.ts</code> |
| Realtime chat/typing/presence | <code>client/src/messages/application/composables/useMessageRealtime.ts</code> |
| Direct/group call state | <code>client/src/messages/application/composables/useMessageCalls.ts</code> |
| LiveKit group room | <code>client/src/messages/application/composables/useGroupCallRoomSession.ts</code> |
| Message repository contract | <code>client/src/messages/domain/repositories/MessagesRepository.ts</code> |
| Call repository contract | <code>client/src/messages/domain/repositories/MessageCallsRepository.ts</code> |
| API repository implementation | <code>client/src/messages/infrastructure/repositories/ApiMessagesRepository.ts</code> |
| PHP group chat endpoint | <code>api/v2/endpoints/group_chat.php</code> |

## 4. Authentication và rooms

### 4.1 Không gửi user ID thuần để xác thực

Sai:

~~~ts
io("/socket.io", { auth: { userId: 5 } })
~~~

Client có thể sửa <code>userId: 5</code> thành bất kỳ ai.

Đúng:

1. Browser đăng nhập qua backend PHP.
2. Browser gọi <code>/_api/realtime/token</code>.
3. Nuxt server xác thực browser session và kiểm tra relay nội bộ qua <code>REALTIME_INTERNAL_URL</code>.
4. Nuxt cấp token có hạn, ký bằng <code>REALTIME_SECRET</code>.
5. Browser đưa token vào Socket.IO <code>auth</code> handshake.
6. Relay verify token rồi mới cho socket join room của user đó.

Một user chỉ được join các room do server quyết định, ví dụ:

~~~text
user:5       # event riêng của user 5
presence:5   # những client đang theo dõi trạng thái online của user 5
~~~

Không được tin <code>recipientId</code>, <code>groupId</code> hay <code>room</code> từ client để join tự do. Client chỉ có thể **yêu cầu**; server phải validate permission trước khi emit/join.

### 4.2 Tại sao có <code>REALTIME_INTERNAL_URL</code>?

Browser kết nối URL public, ví dụ <code>https://domain/socket.io/</code>. Nhưng Nitro server kiểm tra health relay qua loopback/internal URL, ví dụ <code>http://127.0.0.1:3015</code>.

Lý do: Nginx thường chỉ proxy <code>/socket.io/</code>, không proxy <code>/healthz</code> public. Nếu Nitro kiểm tra <code>https://domain/healthz</code>, nó có thể nhận HTML/redirect của Nuxt thay vì relay health và hiểu nhầm realtime đang tắt.

## 5. Flow message và typing

### 5.1 Gửi message

~~~text
Sender UI
  -> POST /_api/messages/...                 # PHP persist message
  -> PHP/MySQL transaction succeeds
  -> PHP/realtime publisher emits invalidation
  -> notification-server fan-out user:<recipientId>
  -> Receiver socket gets event
  -> Receiver refreshes relevant inbox/thread via /_api
  -> UI renders message from canonical backend data
~~~

Nguyên tắc quan trọng: event socket không cần chứa toàn bộ message. Event <code>message:new</code> hoặc invalidation chỉ cần cho biết “có thay đổi”; client refetch từ source of truth. Cách này giảm rủi ro payload stale, sai permission và schema drift.

### 5.2 Typing 1-1

~~~text
User A starts typing
  -> Socket.IO emit message:typing { recipientId: B }
  -> Relay validates A, emits only to room user:B
  -> User B shows "A is typing..."

User A stops / idle timeout
  -> Socket.IO emit message:typing-stop { recipientId: B }
  -> Relay emits only to room user:B
~~~

Typing là **ephemeral state**, không cần persist vào DB khi socket khoẻ. Đây là lý do không nên POST typing mỗi 1-2 giây trong lúc Socket.IO đã kết nối.

Fallback của Vnseea:

- Socket available: typing 1-1 dùng socket, không heartbeat REST.
- Socket unavailable: dùng PHP typing endpoint để UI vẫn hoạt động.
- Group typing hiện dùng PHP fallback, vì relay hiện chỉ fan-out typing theo <code>recipientId</code>, chưa có permission-aware group typing room.

### 5.3 Tại sao phải có TTL cho typing?

Nếu người dùng đóng tab, mất mạng hoặc app crash trước khi gửi <code>typing-stop</code>, bên kia sẽ thấy “đang nhập” mãi. Cần deadline cục bộ, ví dụ 3-8 giây sau event typing cuối cùng, để tự tắt UI.

> Ephemeral event cần có expiration ở receiver. Không được giả định event stop chắc chắn đến được.

## 6. Flow direct call

### 6.1 Tạo và nhận call

~~~text
Caller presses Call
  -> UI shows outgoing ringing immediately
  -> POST /_api/messages/calls/create          # PHP checks permission + stores call
  -> PHP publishes livekit_call_incoming
  -> Socket relay sends it to callee user room
  -> Callee shows incoming-call UI immediately

Callee answers
  -> POST answer / join flow
  -> PHP persists answered state + creates/returns LiveKit payload
  -> PHP publishes livekit_call_answered
  -> Caller gets socket event and obtains LiveKit payload
  -> Both join same LiveKit room; media starts through LiveKit
~~~

### 6.2 Tại sao vẫn polling call khi socket connected?

Không phải để thay socket. Đây là **reconciliation fallback**. Event có thể bị bỏ lỡ nếu relay restart giữa lúc PHP persist và client reconnect, browser vừa sleep, deployment làm mất connection, hoặc có lỗi proxy/firewall/transient network.

Do đó Vnseea dùng:

- Socket event: primary path, hiển thị UI ngay.
- PHP polling khi socket disconnect: nhanh hơn.
- PHP reconciliation khi socket connected: chậm hơn, hiện tại 10 giây, để phát hiện state bị bỏ lỡ.

Không nên polling 1-2 giây vĩnh viễn khi socket khoẻ. Cách đó tạo nhiều request, có thể gây 504 và làm backend quá tải.

### 6.3 Trạng thái call cần idempotent

Một call có thể nhận event lặp hoặc đến không đúng thứ tự. Code phải chịu được:

~~~text
calling -> answered -> ended
calling -> declined
calling -> timed_out
answered -> ended
~~~

<code>answer</code>, <code>decline</code>, <code>end</code> cần idempotent: gọi lại cũng không tạo state mâu thuẫn. Server phải kiểm tra call id, caller/callee, status hiện tại và quyền user.

## 7. WebRTC / LiveKit flow chi tiết

### 7.1 Signaling và media là hai plane khác nhau

~~~text
Control plane / signaling:
Browser <-> Socket.IO + PHP
- incoming call
- answered / declined / closed
- room metadata
- permission

Media plane:
Browser <-> LiveKit SFU
- microphone audio track
- camera video track
- screen share
- subscribe/unsubscribe track
~~~

Nếu call UI đã hiện nhưng media không chạy, cần phân biệt:

1. Signaling problem: không có incoming event, sai call id hoặc không lấy được token.
2. LiveKit/WebRTC problem: token room sai, camera/mic permission, ICE/TURN/firewall, codec hoặc SFU unavailable.

Không nên debug cả hai như một lỗi duy nhất.

### 7.2 Offer, answer và ICE 
- Caller tạo **SDP offer**: “tôi có các codec/track/transport này”.
- Callee tạo **SDP answer**: “tôi chấp nhận và đây là capability của tôi”.
- Hai bên trao đổi **ICE candidates** trong quá trình tìm đường kết nối.
- STUN giúp peer biết public candidate của mình.
- TURN relay media nếu direct peer-to-peer không đi được.

Với LiveKit, SDK và SFU che giấu phần lớn SDP/ICE signaling khỏi application code, nhưng hiểu cơ chế này giúp debug khi call không establish được media connection.

### 7.3 Tại sao HTTPS quan trọng?

<code>navigator.mediaDevices.getUserMedia()</code> thường chỉ hoạt động trong secure context: HTTPS hoặc <code>localhost</code>. Production cần HTTPS hợp lệ; nếu không browser có thể từ chối camera/microphone trước cả khi WebRTC bắt đầu.

## 8. Presence và read state

### 8.1 Presence không phải user record

“Online” là state tạm thời, có thể sai trong khoảng ngắn do browser background, mobile sleep hoặc network delay. Không nên ghi <code>online=true</code> vào user profile và coi đó là sự thật tuyệt đối.

Pattern tốt:

- Relay giữ connection/heartbeat.
- Khi socket connect/disconnect, publish presence event.
- Client theo dõi danh sách user cần thiết qua room <code>presence:&lt;userId&gt;</code>.
- UI hiển thị “active now” theo best-effort.

### 8.2 Read receipt

Read receipt là business state hơn typing, vì nó ảnh hưởng UX và có thể cần lưu:

1. User mở thread và đọc message.
2. POST API đánh dấu message đã đọc hoặc cập nhật <code>last_seen</code>.
3. PHP persist transaction.
4. Push socket invalidation tới sender.
5. Sender refetch hoặc cập nhật read marker.

## 9. Redis dùng ở đâu?

Redis không thay MySQL. Redis hỗ trợ realtime khi hệ thống có nhiều Node relay:

~~~text
Node relay A receives sender socket
  -> Redis Pub/Sub adapter
  -> Node relay B receives event
  -> Node B emits to recipient socket connected on B
~~~

Không có Redis adapter, <code>io.to("user:5")</code> chỉ thấy socket đang kết nối vào **chính process Node hiện tại**. Khi scale 2+ instances, recipient có thể không nhận event.

Redis cũng phù hợp cho:

- Presence TTL.
- Rate limit typing/call event.
- Short-lived idempotency key.
- Pub/Sub realtime fan-out.

Redis không nên là nơi lưu message lịch sử duy nhất. Message, call log, membership và permission vẫn phải nằm trong MySQL/PHP transaction.

## 10. Reconnect, duplicate event và ordering

### 10.1 Phải giả định socket sẽ reconnect

Khi reconnect:

- Socket ID thay đổi.
- Room phải join lại từ server-side auth flow.
- Client phải refresh inbox/thread/presence quan trọng.
- UI phải có fallback để không treo ở state “ringing” cũ.

### 10.2 Event có thể duplicate

Vì reconnect hoặc retry, cùng một event có thể đến nhiều lần. Giải pháp:

- Gắn <code>eventId</code> hoặc version/message id.
- Dedupe theo key trong bộ nhớ có TTL ngắn.
- Action mutation dùng idempotency key.
- UI update có guard: nếu đã có message id hoặc call status cũ hơn thì bỏ qua.

### 10.3 Event có thể out-of-order

Ví dụ client nhận <code>call:ended</code> trước <code>call:answered</code> do reconnect. Server/source of truth cần có <code>updated_at</code>, version hoặc state transition hợp lệ. Client refetch canonical state nếu không chắc chắn.

## 11. Security checklist

- Xác thực socket bằng short-lived signed token, không bằng <code>userId</code> do client tự gửi.
- <code>REALTIME_SECRET</code> không được đưa vào frontend bundle.
- Validate authorization trước mỗi event có side effect: send, typing to user, call, group call và join room.
- Không cho client <code>join(groupId)</code> nếu chưa verify membership ở server.
- Rate limit typing, call create, call invite và message event.
- Giới hạn payload size và validate schema.
- Kiểm tra Origin/CORS đúng domain production.
- Log theo <code>userId</code>, socket id, event name và call id; không log token/raw message nhạy cảm.
- Dùng WSS/HTTPS ở production.
- Thiết lập Nginx <code>Upgrade</code> và <code>Connection: upgrade</code> cho <code>/socket.io/</code>.

## 12. Nginx và environment cần nhớ

Socket.IO proxy mẫu:

~~~nginx
location ^~ /socket.io/ {
    proxy_pass http://127.0.0.1:3015;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_buffering off;
}
~~~

Biến môi trường quan trọng:

~~~dotenv
# Browser kết nối thông qua URL public này.
NUXT_PUBLIC_REALTIME_URL=https://example.com

# Nuxt server kiểm tra relay trực tiếp, không đi qua public proxy.
REALTIME_INTERNAL_URL=http://127.0.0.1:3015

# Phải giống nhau giữa Nuxt token issuer và notification-server.
REALTIME_SECRET=replace-with-long-random-secret

REALTIME_HOST=127.0.0.1
REALTIME_PORT=3015
~~~

Không đưa <code>REALTIME_SECRET</code> vào biến <code>NUXT_PUBLIC_*</code>.

## 13. Cách debug nhanh trong Vnseea

### 13.1 Kiểm tra relay

~~~powershell
curl.exe -i http://127.0.0.1:3015/healthz
curl.exe -i "http://demo.vnseea.test:8080/socket.io/?EIO=4&transport=polling"
~~~

Kết quả mong đợi:

- Health trả JSON <code>{"ok":true}</code>.
- Socket.IO handshake trả <code>200</code> và JSON có <code>sid</code>, <code>upgrades</code>, <code>pingInterval</code>.

### 13.2 DevTools browser

1. Mở Network, lọc <code>socket.io</code>.
2. Connection WebSocket phải có <code>101 Switching Protocols</code> khi proxy/websocket đúng.
3. Mở Frames/Message để xem event đến.
4. Lọc <code>typing</code> và xác nhận typing 1-1 không POST REST liên tục khi socket đã connected.
5. Khi call, xem event <code>livekit_call_incoming</code>, <code>livekit_call_answered</code>, <code>livekit_call_closed</code>.

### 13.3 Phân biệt lỗi theo triệu chứng

| Triệu chứng | Khả năng cao | Kiểm tra đầu tiên |
| --- | --- | --- |
| Socket không connect | Nginx proxy, URL, CORS, token | <code>/socket.io/</code> handshake, Network, relay logs |
| <code>enabled: false</code> từ realtime token | <code>REALTIME_SECRET</code>, health URL sai | <code>REALTIME_INTERNAL_URL</code>, relay <code>/healthz</code> |
| Typing spam request | Socket không connected hoặc fallback luôn bật | Network <code>/_api/*typing</code>, socket status |
| Callee không thấy incoming call | Missed socket event, auth room sai, PHP event không publish | Relay logs, call reconciliation endpoint, call row DB |
| UI call hiện nhưng video không đến | LiveKit token/room/ICE/camera permission | Browser console, LiveKit logs, HTTPS, device permission |
| Chỉ lỗi khi scale 2 Node relay | Không có Redis adapter | Relay instance mapping, Redis Pub/Sub |

## 14. 

### 14.1 “WebSocket khác long polling thế nào?”

Long polling là client gửi HTTP request và server giữ request đó cho đến khi có dữ liệu/timeout, sau đó client lập tức gửi request mới. WebSocket nâng cấp một connection thành kênh full-duplex dài hạn. Long polling dễ triển khai hơn nhưng tốn request/header và latency/reconnect overhead cao hơn.

### 14.2 “Socket.IO có phải WebSocket không?”

Không hoàn toàn. Socket.IO có thể dùng WebSocket transport, nhưng nó có protocol riêng và thêm event, rooms, reconnect, heartbeat, acknowledgements. WebSocket native client không nói trực tiếp với Socket.IO server như một protocol tương thích.

### 14.3 “Tại sao chat vẫn cần REST nếu đã có Socket.IO?”

REST/PHP transaction persist message, validate permission, enforce idempotency và là source of truth. Socket chỉ thông báo nhanh để receiver refresh. Nếu socket event bị mất, user vẫn lấy được data chuẩn qua REST.

### 14.4 “Làm sao đảm bảo user chỉ nhận message của mình?”

Verify auth token ở server, map socket vào room <code>user:&lt;verifiedUserId&gt;</code>, rồi emit đến room đó. Không tin <code>recipientId</code> để cho join room. Permission group phải kiểm tra membership server-side.

### 14.5 “Làm sao xử lý message duplicate?”

Backend cấp message id/idempotency key, client dedupe theo id, mutation server-side idempotent và refetch canonical data nếu event không đầy đủ. Không dựa vào giả định “socket event chỉ đến một lần”.

### 14.6 “Tại sao WebRTC cần STUN/TURN?”

Peer thường nằm sau NAT/firewall. STUN giúp tìm candidate public; TURN relay media khi đường direct không thiết lập được. Không có TURN thì một tỷ lệ user ở mạng doanh nghiệp/CGNAT sẽ không call được.

### 14.7 “Tại sao group video call nên dùng SFU?”

Mesh làm mỗi participant gửi một stream cho tất cả người khác, upload và số kết nối tăng nhanh. SFU nhận một uplink và forward đến nhiều subscribers, phù hợp scale, simulcast và adaptive quality.

### 14.8 “Làm sao handle socket reconnect?”

Reconnect có backoff, cấp lại auth/token nếu cần, join lại rooms từ server-side, refresh state quan trọng, dedupe event và có fallback polling/reconciliation cho business state như call.

### 14.9 “Typing có cần lưu DB không?”

Thường không. Typing là ephemeral state; gửi socket event và receiver dùng TTL để clear. Chỉ fallback REST khi realtime unavailable nếu sản phẩm cần graceful degradation.

### 14.10 “Khi nào dùng Redis với Socket.IO?”

Khi có nhiều realtime Node instances. Redis adapter Pub/Sub fan-out event đến instance đang giữ socket của recipient. Redis cũng phù hợp presence TTL/rate limit, nhưng MySQL vẫn là source of truth cho message và permission.

## 15. Những câu trả lời nên tránh

| Nói sai | Cách nói đúng |
| --- | --- |
| “Socket đảm bảo message đến” | Socket là best-effort realtime transport; persist và reconciliation mới đảm bảo state cuối cùng |
| “WebRTC là WebSocket nhanh hơn” | WebRTC và WebSocket giải quyết bài toán khác nhau; WebRTC cho media/data peer, WebSocket cho signaling/event |
| “Dùng Socket.IO là không cần API” | API vẫn cần cho auth, transaction, history, pagination và permission |
| “Redis là database thay MySQL” | Redis là cache/pubsub/ephemeral state; MySQL là durable source of truth |
| “Disconnect là user offline chắc chắn” | Disconnect chỉ là signal; user có thể reconnect, background, sleep hoặc proxy timeout |

## 16. Checklist trước khi merge một tính năng realtime

- [ ] Backend persist và validate nghiệp vụ trước khi publish event.
- [ ] Event chỉ fan-out tới user/room được phép.
- [ ] UI chịu được duplicate và out-of-order event.
- [ ] Có loading/error/reconnect state.
- [ ] Có TTL cho state tạm thời như typing/presence.
- [ ] Có fallback/reconciliation hợp lý, không polling dày đặc khi socket healthy.
- [ ] Secret không vào client bundle.
- [ ] Nginx WebSocket proxy đã smoke test.
- [ ] Test hai tài khoản, hai trình duyệt và một bên mất mạng/reconnect.
- [ ] Test deployment/restart relay khi có call đang ringing.
- [ ] Nếu multi-instance: Redis adapter đã được test cross-instance.

## 17. Tóm tắt để nhớ trong 30 giây

~~~text
HTTP/PHP/MySQL = durable business truth
Socket.IO      = realtime event, rooms, reconnect, invalidation
WebRTC/LiveKit = audio/video media
Redis          = multi-node fan-out, presence TTL, rate limit

Persist first -> publish event -> receiver refreshes canonical data.
Socket nhanh nhưng có thể mất event; fallback/reconciliation xử lý điều đó.
Không tin room/user id do client tự khai báo.
~~~
