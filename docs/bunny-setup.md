# Hướng dẫn thiết lập Bunny cho VNSEEA

Tài liệu này liệt kê các bước làm trên **bunny.net**, **DNS**, **server** và **trang admin VNSEEA** để bật:

- **Bunny CDN (Pull Zone)** – phát ảnh, avatar và video hiện có từ máy chủ Bunny gần người xem (giai đoạn A, dùng được ngay).
- **Bunny Stream** – upload video mới thẳng lên Bunny, tự encode ra HLS nhiều chất lượng: video tin nhắn (giai đoạn B, mục 4) và video bài viết, reels, tin (giai đoạn C, mục 5). Mỗi giai đoạn có công tắc riêng; có thể điền sẵn thông tin nhưng **giữ công tắc tắt** cho tới khi bản tương ứng được deploy.

Mọi thứ đều bật/tắt được trong admin. Tắt là hệ thống quay về chạy local như cũ ngay lập tức.

> Giao diện Bunny thay đổi theo thời gian, tên nút có thể khác đôi chút so với tài liệu này. Mỗi phần đều có bước **Kiểm tra** để biết đã cấu hình đúng hay chưa.

> ⚠️ **Không dùng tên miền mặc định `*.b-cdn.net` để phát media.** DNS của VNPT và Viettel chặn mọi tên miền `*.b-cdn.net`: VNPT trả "không tồn tại", Viettel trả `127.0.0.1`. Phần lớn người dùng trong nước để DNS mặc định của nhà mạng, nên họ sẽ không xem được ảnh và video. Upload vẫn chạy bình thường vì API của Bunny ở tên miền khác (`bunnycdn.com`), nên lỗi này dễ bị bỏ sót.
>
> Tên miền riêng của mình (ví dụ `cdn.vnseea.vn`) **trỏ CNAME** sang `*.b-cdn.net` thì vẫn phân giải bình thường qua DNS của nhà mạng (đã kiểm chứng trên VNPT ngày 04/10/2026). Vì vậy Pull Zone (mục 2.4) và **cả 2 thư viện Stream** (mục 3.5) đều phải dùng tên miền riêng.

---

## 0. Chuẩn bị

- [ ] Quyền sửa DNS của tên miền `vnseea.vn`.
- [ ] Tài khoản admin VNSEEA có quyền vào **Cài đặt → Cấu hình tải tệp lên**.
- [ ] Quyền SSH vào server để sửa file `client/.env` của web và chạy deploy.
- [ ] Một URL ảnh thật và một URL video thật trên `https://media.vnseea.vn/upload/...` để kiểm tra.

---

## 1. Tạo tài khoản Bunny

1. Đăng ký tại <https://bunny.net>, xác thực email.
2. **Account → Security**: bật xác thực hai lớp (2FA).
3. **Billing**: nạp tiền (Bunny trả trước) và bật **tự động nạp** để dịch vụ không bị ngắt khi hết tiền.
4. **Billing**: đặt cảnh báo chi tiêu (spending alert) theo ngân sách tháng.

---

## 2. Bunny CDN cho media hiện có (giai đoạn A)

### 2.1 Tạo Pull Zone

**CDN → Pull Zones → Add Pull Zone**

| Trường | Giá trị |
|---|---|
| Name | `vnseea-media` → hostname mặc định `vnseea-media.b-cdn.net` |
| Origin type | Origin URL |
| Origin URL | `https://media.vnseea.vn` |
| Tier | **Standard** (nhiều điểm phát ở châu Á; "Volume" rẻ hơn nhưng ít điểm phát hơn) |
| Pricing zones | **Bật Asia & Oceania** (bắt buộc cho người dùng Việt Nam). Các vùng khác bật tuỳ nhu cầu. |

### 2.2 Cấu hình cache

Trong Pull Zone vừa tạo → **Caching**:

- **Cache expiration time**: chọn tôn trọng `Cache-Control` của origin (origin đang trả `max-age` 30 ngày).
- **Query string**: giữ **bật** chế độ cache theo query string (vary cache by query string). Hệ thống dùng `?cache=...` để buộc tải lại ảnh mới.
- (Khuyến nghị) **Origin Shield**: bật, chọn vị trí gần Việt Nam (ví dụ Singapore). Bunny sẽ gom các lần lấy file về origin, giảm tải cho VPS.

### 2.3 CORS

**Headers**: bật thêm CORS header cho các đuôi `jpg, jpeg, png, gif, webp, mp4, mov, m4a, mp3` để web phát được ảnh và video từ domain CDN.

### 2.4 Hostname riêng `cdn.vnseea.vn` (bắt buộc)

1. Pull Zone → **General → Hostnames → Add Custom Hostname**: nhập `cdn.vnseea.vn`.
2. Tại nhà cung cấp DNS, tạo bản ghi:

   | Loại | Tên | Giá trị |
   |---|---|---|
   | CNAME | `cdn` | `vnseea-media.b-cdn.net` |

3. Đợi DNS có hiệu lực (thường vài phút), quay lại Bunny bấm bật **SSL miễn phí** cho `cdn.vnseea.vn`.

Không dùng thẳng `vnseea-media.b-cdn.net` ở các bước sau: người dùng VNPT và Viettel sẽ không tải được (xem cảnh báo ở đầu tài liệu).

### 2.5 Kiểm tra Pull Zone

Thay đường dẫn bằng một ảnh và một video thật:

```bash
# Ảnh: lần 1 trả 200; chạy lần 2 phải thấy header "CDN-Cache: HIT"
curl -sI https://cdn.vnseea.vn/upload/photos/2026/10/<ten-anh>.jpg | grep -iE "^HTTP|cdn-cache"

# Video: phải trả 206 (hỗ trợ tua)
curl -sI -r 0-1 https://cdn.vnseea.vn/upload/videos/2026/10/<ten-video>.mp4 | grep -iE "^HTTP|content-range"
```

### 2.6 Cho web Nuxt chấp nhận domain CDN (làm TRƯỚC khi bật trong admin)

Web xử lý ảnh qua `_ipx` và chỉ cho phép các domain đã khai báo lúc build.

1. SSH vào server, mở `client/.env` của **production** (`/home/vnseea/main/client/.env`) và của **v2**.
2. Thêm dòng (liệt kê mọi hostname CDN sẽ dùng, cách nhau bằng dấu phẩy):

   ```env
   NUXT_IMAGE_EXTRA_DOMAINS=cdn.vnseea.vn,vnseea-media.b-cdn.net
   ```

3. Deploy lại web (merge vào `main` hoặc chạy lại pipeline deploy) để web được build lại.

**Kiểm tra:** mở trang web, ảnh vẫn hiển thị bình thường.

### 2.7 Bật CDN trong admin VNSEEA

**Admin → Cài đặt → Cấu hình tải tệp lên → mục "Bunny CDN & Bunny Stream" → thẻ "Bunny CDN cho ảnh và video hiện có"**

1. **Hostname CDN**: `cdn.vnseea.vn` (không cần `https://`).
2. Gạt công tắc **Phát media qua Bunny CDN** sang bật.
3. Tải lại trang admin: phải thấy thông báo xanh **"Đang phát media qua https://cdn.vnseea.vn"**.
   - Thông báo đỏ: hostname trống hoặc sai.
   - Thông báo vàng: môi trường đó chưa có media origin dùng chung (`MEDIA_BASE_URL`), nên CDN chưa áp dụng.

**Kiểm tra:** trên app và web, mở một ảnh và xem link: phải bắt đầu bằng `https://cdn.vnseea.vn/upload/...`. Trong Bunny → Pull Zone → **Statistics**, tỉ lệ cache hit nên dần lên trên 90%.

**Quay lui:** gạt công tắc tắt. Link media quay về `media.vnseea.vn` ngay, không cần deploy.

---

## 3. Bunny Stream (giai đoạn B: video tin nhắn)

### 3.1 Tạo 2 thư viện video

**Stream → Add Video Library**, tạo 2 thư viện:

| Thư viện | Dùng cho | Quyền xem |
|---|---|---|
| `vnseea-public` | Bài viết, reels, story | Công khai |
| `vnseea-chat` | Video trong tin nhắn | Riêng tư, chỉ xem bằng link có chữ ký |

Khi tạo, chọn vùng lưu trữ chính gần Việt Nam (ví dụ Singapore). Bật thêm vùng sao lưu tuỳ ngân sách.

### 3.2 Cấu hình encode (làm cho cả 2 thư viện)

Thư viện → **Encoding**:

- **Resolutions**: bật `360p, 480p, 720p, 1080p`. Tắt 1440p/2160p để tiết kiệm lưu trữ.
- **Giữ file gốc**: tắt (nếu không có nhu cầu tải lại bản gốc), để không phải trả tiền lưu thêm một bản.
- **MP4 fallback**: tạm tắt. Ứng dụng và web phát bằng HLS.

### 3.3 Bảo mật cho thư viện `vnseea-chat`

Thư viện `vnseea-chat` → **Security → Token Authentication**:

1. Bật xác thực token cho **file video** (CDN / phát trực tiếp), không chỉ cho trang embed.
2. Sao chép **Token Authentication Key**.
3. Không cần dùng trình phát embed của Bunny.

**Kiểm tra** (sau khi có ít nhất một video trong thư viện): mở link `https://<cdn-hostname-thư-viện>/<video-id>/playlist.m3u8` **không kèm token**. Link phải bị từ chối (HTTP 403).

Thư viện `vnseea-public` **không** bật token authentication.

Ở mục **Security** của **cả 2 thư viện**:

- **Tắt** "Block direct URL file access". Bunny **bật sẵn** mục này khi tạo thư viện, nên phải vào tắt.
  - Khi mục này bật, Bunny chặn mọi request không có header Referer. App iOS và Android phát video không gửi Referer, nên video trong app bị lỗi 403 dù link đã ký đúng.
  - Web vẫn phát được vì trình duyệt có gửi Referer. Vì vậy lỗi này dễ bị bỏ sót nếu chỉ thử trên web.
- **Không** bật DRM (MediaCage). Ứng dụng và web phát thẳng file HLS, không qua trình phát embed của Bunny.
- Nếu điền **Allowed domains**, phải có `vnseea.vn` và domain v2. Để trống cũng được.

### 3.4 Lấy thông tin của từng thư viện

Thư viện → **API**, ghi lại (làm cho cả 2 thư viện):

| Thông tin | Dạng |
|---|---|
| Video Library ID | Một dãy số, ví dụ `123456` |
| API Key | Chuỗi dài, **bí mật** |
| Read-Only API Key | Chuỗi dài, **bí mật**. Dùng để xác thực webhook |
| CDN Hostname mặc định | `vz-xxxxxxxx-xxx.b-cdn.net`. Chỉ dùng làm đích CNAME ở mục 3.5, **không** điền vào admin |
| Token Authentication Key | Chỉ thư viện `vnseea-chat` (mục 3.3), **bí mật** |

> Không gửi các key bí mật qua chat hay email. Dán thẳng vào trang admin ở bước 3.7.

### 3.5 Tên miền riêng cho 2 thư viện (bắt buộc)

Mỗi thư viện Stream có một Pull Zone riêng với hostname mặc định `vz-xxxxxxxx-xxx.b-cdn.net`, mà DNS của VNPT và Viettel chặn (xem cảnh báo ở đầu tài liệu). Gắn cho mỗi thư viện một tên miền con của `vnseea.vn`:

| Thư viện | Tên miền riêng |
|---|---|
| `vnseea-public` | `stream.vnseea.vn` |
| `vnseea-chat` | `chat-stream.vnseea.vn` |

1. **Bunny**: mở Pull Zone của thư viện. Vào **Stream → thư viện → API**, bấm vào CDN Hostname, hoặc vào **CDN → Pull Zones** và tìm Pull Zone có hostname trùng CDN Hostname của thư viện. Sau đó vào **General → Hostnames → Add hostname**, nhập tên miền riêng.
2. **DNS** (nhà cung cấp tên miền `vnseea.vn`, hiện là PA Vietnam), tạo bản ghi cho từng thư viện:

   | Loại | Tên | Giá trị | TTL |
   |---|---|---|---|
   | CNAME | `stream` | CDN Hostname mặc định của `vnseea-public` (`vz-….b-cdn.net`) | 3600 hoặc thấp hơn |
   | CNAME | `chat-stream` | CDN Hostname mặc định của `vnseea-chat` (`vz-….b-cdn.net`) | 3600 hoặc thấp hơn |

   Giá trị phải là **CNAME**, không dùng bản ghi A trỏ thẳng IP: Bunny chọn máy chủ gần người xem qua DNS của `b-cdn.net`.
3. Đợi DNS có hiệu lực (thường vài phút), quay lại Bunny bấm **Verify & Activate SSL** cho từng tên miền (chứng chỉ Let's Encrypt miễn phí).
4. Token Authentication của `vnseea-chat` gắn với Pull Zone, không gắn với tên miền, nên link có chữ ký dùng được ngay trên tên miền mới; không cần đổi key.

**Kiểm tra** (thay `<video-id>` bằng một video đã encode trong thư viện `vnseea-public`):

```bash
# DNS của VNPT phải trả về CNAME và IP, không được NXDOMAIN
dig @203.162.4.191 stream.vnseea.vn +short
dig @203.162.4.191 chat-stream.vnseea.vn +short

# Playlist công khai phải trả 200 qua tên miền mới
curl -sI https://stream.vnseea.vn/<video-id>/playlist.m3u8 | grep -iE "^HTTP"
```

Nếu muốn web tối ưu được ảnh bìa từ hai tên miền này, thêm chúng vào `NUXT_IMAGE_EXTRA_DOMAINS` (mục 2.6), ví dụ `NUXT_IMAGE_EXTRA_DOMAINS=cdn.vnseea.vn,stream.vnseea.vn,chat-stream.vnseea.vn`. Video vẫn phát được trên web khi chưa thêm.

### 3.6 Webhook

Webhook báo cho VNSEEA biết khi nào Bunny encode xong, để tin nhắn chuyển từ "Đang xử lý video" sang phát được.

Ở **cả 2 thư viện** → mục **Webhook URL**, dán:

```
https://vnseea.vn/requests.php?f=bunny_stream_webhook&s=events
```

URL này cũng hiện sẵn trong admin (thẻ "Bunny Stream cho video mới", ô "Webhook URL") để sao chép.

- Webhook được xác thực bằng **Read-Only API Key** của thư viện. Nếu điền sai key đó trong admin, mọi webhook bị từ chối (HTTP 401).
- Nếu webhook bị lỡ, server vẫn tự hỏi Bunny khi có người mở hội thoại (tối đa 30 giây một lần cho mỗi video). Video vẫn chuyển sang phát được, chỉ chậm hơn.

### 3.7 Điền vào admin VNSEEA

**Admin → Cài đặt → Cấu hình tải tệp lên → mục "Bunny CDN & Bunny Stream"**

1. Thẻ **"Thư viện công khai (bài viết, reels, story)"**: điền Library ID, API Key, Read-Only API Key của `vnseea-public`. Ô **CDN Hostname** điền `stream.vnseea.vn` (mục 3.5), **không** điền `vz-….b-cdn.net`.
2. Thẻ **"Thư viện riêng tư (video tin nhắn)"**: điền thông tin của `vnseea-chat`, thêm **Token Authentication Key**. Ô **CDN Hostname** điền `chat-stream.vnseea.vn`.
   - **Thời hạn link video tin nhắn**: giữ `21600` (6 giờ).
3. Ô key bí mật được lưu khi rời khỏi ô. Sau khi lưu, ô tự để trống và chỉ hiện "Đã lưu (…4 ký tự cuối)". Key được mã hoá trong database và không bao giờ gửi xuống app hay web.
4. Thẻ **"Bunny Stream cho video mới"**:
   - **Không nén trên máy với video dài hơn (giây)**: `1200` (20 phút). Nén trên iPhone rất nhanh (video 5 phút mất khoảng 45 giây) và giảm dung lượng 4–10 lần. Đo ngày 02/10/2026: video 5 phút gửi file gốc 444 MB mất 15,5 phút upload, nén còn 123 MB; video chat 6,3 phút từ 779 MB còn 74 MB, tổng thời gian từ khoảng 26 phút còn khoảng 6 phút.
   - Hai dòng trạng thái phải báo **"đã đủ cấu hình"** cho cả 2 thư viện.
   - **Giữ cả 2 công tắc TẮT**: "Upload video tin nhắn mới lên Bunny Stream" cho tới bước 4.5, "Upload video bài viết, reels, tin mới lên Bunny Stream" cho tới bước 5.5.

---

## 4. Bật giai đoạn B: video tin nhắn qua Bunny Stream

Làm sau khi xong mục 3. Trong giai đoạn B, chỉ **video gửi trong tin nhắn từ app** đi qua Bunny Stream. Web vẫn upload video lên server như cũ, nhưng **phát được** video Bunny. Bài viết, reels và story để giai đoạn C.

### 4.1 Tạo bảng trong database

Chạy file `database/migrations/20261002_bunny_stream_uploads.sql` trên database **production** và **v2**. Deploy không tự chạy migration.

File chỉ tạo bảng mới `Wo_VnseeaMediaUploads` (`CREATE TABLE IF NOT EXISTS`), không sửa bảng cũ. Chạy lại nhiều lần cũng không sao.

Nếu chưa có bảng này, server không cấp vé upload Bunny và app tự upload lên server như cũ.

### 4.2 Deploy backend và web

Merge nhánh vào `main` của `demo.vnseea`. Workflow deploy lên v2 rồi production. Web có thêm thư viện `hls.js`, và deploy tự chạy `pnpm install --frozen-lockfile` nên không cần làm gì thêm.

### 4.3 Kiểm tra kết nối

Admin → mục "Bunny CDN & Bunny Stream" → bấm **"Kiểm tra kết nối Bunny Stream"**. Kết quả mong đợi:

- "Thư viện công khai: kết nối API thành công."
- "Thư viện riêng tư: kết nối API thành công."
- Nếu có dòng đỏ "CDN Hostname đang là ….b-cdn.net", thư viện đó chưa dùng tên miền riêng: làm lại mục 3.5 và 3.7.
- Mỗi thư viện có thêm một dòng thử phát video. Lần đầu dòng này báo "chưa có video đã encode để thử phát". Kiểm tra lại ở bước 4.6 (thư viện riêng tư) và 5.6 (thư viện công khai).

### 4.4 Build app mới

Phần app chỉ thay đổi JavaScript, không thêm thư viện native. App bản cũ vẫn chạy bình thường: chúng upload lên server như trước và vẫn phát được video Bunny do app mới gửi.

### 4.5 Bật công tắc

Thẻ **"Bunny Stream cho video mới"** → bật **"Upload video tin nhắn mới lên Bunny Stream"**. App đọc cấu hình này mỗi 5 phút, nên có thể phải mở lại app để áp dụng ngay.

### 4.6 Thử nghiệm

1. Từ app mới, gửi một video **ngắn** (dưới ngưỡng "Không nén trên máy", mặc định 20 phút). App nén trên máy (cạnh dài tối đa 1080) rồi mới upload.
2. Gửi một video **dài hơn ngưỡng**. App bỏ qua bước nén và upload file gốc theo từng phần 8 MB. Mạng chập chờn thì app tự thử lại (tối đa 5 lần) và tải tiếp từ phần đang dở. App bị tắt giữa chừng thì phải gửi lại từ đầu.
3. Ngay sau khi gửi, bong bóng chat hiện **"Đang xử lý video"**. Khi Bunny encode xong, video phát được. Video ngắn thường mất dưới 1 phút; video dài lâu hơn.
4. Trong Bunny → thư viện `vnseea-chat` → **Videos**, thấy video mới.
5. Mở hội thoại đó trên web, bằng **Chrome** và **Safari**. Bong bóng hiện ảnh bìa; bấm vào thì video phát và tua được.
6. Bấm lại **"Kiểm tra kết nối Bunny Stream"**. Dòng của thư viện riêng tư phải báo "link có chữ ký phát được, link không chữ ký bị chặn".
   - Nếu báo "link có chữ ký bị từ chối (HTTP 403)", kiểm tra trước tiên mục "Block direct URL file access" (mục 3.3) đã tắt chưa, sau đó mới kiểm tra Token Authentication Key.
7. Thu hồi một video thử nghiệm. Video đó biến mất khỏi thư viện Bunny. Nếu video đã được chuyển tiếp sang hội thoại khác, Bunny vẫn giữ video đó.

### 4.7 Quay lui

Tắt công tắc ở bước 4.5. Video mới lại upload lên server như cũ. Video đã gửi qua Bunny vẫn xem được, miễn là vẫn giữ nguyên thông tin thư viện trong admin.

---

## 5. Bật giai đoạn C: video bài viết, reels và tin qua Bunny Stream

Làm sau khi giai đoạn B chạy ổn. Video bài viết, reel và tin **đăng từ app** đi qua thư viện `vnseea-public`. Web vẫn upload lên server như cũ nhưng phát được video Bunny.

Cách hoạt động:

- Bấm **Đăng** xong, màn hình đóng ngay. Feed hiện thanh **"Đang tải video lên… %"**, rồi **"Đang xử lý video"**. Người dùng vẫn lướt app bình thường.
- Bài, reel và tin **chỉ được tạo khi video đã phát được**: server tự tải thử đoạn đầu của từng chất lượng H.264 trên CDN, vì Bunny có thể báo encode xong vài chục giây trước khi CDN phát được (nhất là khi bật Premium Encoding). Sau 5 phút vẫn chưa tải được thì server vẫn đăng, để bài không bị kẹt. Người khác không bao giờ thấy video chưa phát được. Follower nhận thông báo lúc bài lên.
- Người đăng nhận thông báo (kèm push) khi bài đã lên, hoặc khi video lỗi và phải đăng lại.
- Video ngắn hơn ngưỡng "Không nén trên máy" (mặc định 20 phút) được nén trên máy về 1080p (cạnh dài 1920). Video dài hơn gửi file gốc.
- App bắt đầu nén và upload ngay khi chọn video, trong lúc người dùng còn viết nội dung.
- Xoá bài, xoá tin, hoặc tin hết 24 giờ thì video trên Bunny cũng bị xoá, để không tốn tiền lưu trữ.

### 5.1 Kiểm tra thư viện `vnseea-public`

- **Security**: **không** bật token authentication; **tắt** "Block direct URL file access" (xem mục 3.3).
- **Webhook URL** đã dán (mục 3.6).
- **Tên miền riêng** `stream.vnseea.vn` đã gắn và điền vào admin (mục 3.5, 3.7).
- **Encoding**: 360p–1080p (mục 3.2).

### 5.2 Cập nhật bảng trong database

Chạy `database/migrations/20261003_bunny_stream_publish_uploads.sql` trên database **production** và **v2**, **trước khi deploy**. Chạy lại nhiều lần cũng không sao.

File này thêm cột vào bảng `Wo_VnseeaMediaUploads` có từ giai đoạn B. Khi chưa chạy, server không cấp vé upload cho bài viết, reels và tin; app tự upload lên server như cũ, và admin hiện cảnh báo đỏ.

### 5.3 Deploy backend và web

Merge nhánh vào `main` của `demo.vnseea`. Deploy tự khởi động lại worker push (`vnseea-push-worker`). Worker này giờ làm thêm việc bảo trì Bunny mỗi phút:

- Đăng các bài, reel, tin bị lỡ webhook.
- Xoá video của tin hết hạn, của bài đã xoá, và của các lần upload bị bỏ dở.

**Không cần bật cron.** Cũng **đừng bật `cron-job.php`** chỉ vì Bunny: file này còn tự gia hạn Pro (trừ tiền ví), thu phí gói theo dõi và xoá bài live. Lần chạy đầu sau thời gian dài có thể xử lý dồn một loạt giao dịch.

Nếu đã lỡ chạy migration sau khi deploy, khởi động lại worker một lần: `systemctl restart vnseea-push-worker`.

### 5.4 Build app mới

Chỉ thay đổi JavaScript. App bản cũ vẫn upload video bài viết, reels, tin lên server như trước và vẫn phát được video Bunny.

### 5.5 Bật công tắc

Thẻ **"Bunny Stream cho video mới"** → bật **"Upload video bài viết, reels, tin mới lên Bunny Stream"**. App đọc cấu hình này mỗi 5 phút.

### 5.6 Thử nghiệm

1. **Bài viết, video ngắn** (dưới ngưỡng không nén): bấm Đăng → màn hình đóng ngay, feed hiện thanh tiến độ, rồi "Đang xử lý video". Khi xong, bài hiện ở đầu feed, thanh báo "Đã đăng bài viết", và có thông báo "Video của bạn đã xử lý xong…".
2. Trong lúc bài đang xử lý, dùng **tài khoản khác** xem feed và trang cá nhân của người đăng: chưa thấy bài. Sau khi xong mới thấy, và follower nhận thông báo.
3. **Bài viết, video dài** (trên ngưỡng không nén): như trên, app không nén mà gửi file gốc.
4. **Reel**: thông báo "Đang đăng reel…", rồi reel hiện trong feed khi xong.
5. **Tin (video)**: tin chỉ hiện trong khay tin khi xử lý xong. Thời hạn 24 giờ tính từ lúc tin hiện.
6. Mở bài, reel, tin đó trên web bằng **Chrome** và **Safari**: phát và tua được.
7. Bấm **"Kiểm tra kết nối Bunny Stream"**: dòng của thư viện công khai phải báo "video phát được trên app và web".
8. Xoá một bài thử nghiệm và một tin thử nghiệm: video biến mất khỏi thư viện `vnseea-public` (tin hết hạn thì worker xoá trong vòng vài phút).

### 5.7 Quay lui

Tắt công tắc ở bước 5.5. Video mới lại upload lên server như cũ. Bài, reel, tin đã đăng vẫn phát được. Các video đang xử lý vẫn được đăng khi Bunny encode xong, miễn là vẫn giữ nguyên thông tin thư viện trong admin.

---

## 6. Chuyển thư viện Stream đang chạy sang tên miền riêng

Dành cho hệ thống đã bật giai đoạn B, C với CDN Hostname mặc định `vz-….b-cdn.net`. Người dùng VNPT và Viettel hiện **không xem được** video Bunny. Không cần build app mới, không cần tắt công tắc: link phát được tạo mỗi lần đọc dữ liệu, nên sau khi đổi tên miền, mọi bài, reel, tin và tin nhắn cũ đều phát qua tên miền mới.

### 6.1 Gắn tên miền

Làm mục 3.5 cho cả 2 thư viện: thêm hostname trong Bunny, tạo 2 bản ghi CNAME, bật SSL, rồi chạy các lệnh **Kiểm tra** ở mục 3.5. Chỉ sang bước 6.2 khi:

- `dig @203.162.4.191 stream.vnseea.vn +short` và `dig @203.162.4.191 chat-stream.vnseea.vn +short` đều trả về dòng `vz-….b-cdn.net.` kèm địa chỉ IP;
- `https://stream.vnseea.vn/<video-id>/playlist.m3u8` trả `HTTP/2 200` (dùng một video đã đăng);
- trong Bunny, cả 2 hostname đều báo SSL đã bật.

Bước này chưa ảnh hưởng người dùng: hệ thống vẫn dùng hostname cũ.

### 6.2 Đổi trong admin

**Admin → Cài đặt → Cấu hình tải tệp lên → mục "Bunny CDN & Bunny Stream"**:

1. Thẻ **"Thư viện công khai"**: ô **CDN Hostname** đổi thành `stream.vnseea.vn`.
2. Thẻ **"Thư viện riêng tư"**: ô **CDN Hostname** đổi thành `chat-stream.vnseea.vn`.
3. Bấm **"Kiểm tra kết nối Bunny Stream"**. Không còn dòng đỏ "CDN Hostname đang là ….b-cdn.net". Thư viện công khai báo "video phát được trên app và web"; thư viện riêng tư báo "link có chữ ký phát được, link không chữ ký bị chặn".

Worker push đọc lại cấu hình mỗi phút, nên không cần khởi động lại.

### 6.3 Thử nghiệm

1. Trên điện thoại dùng **Wi‑Fi VNPT** (hoặc 4G **Viettel**), để DNS mặc định: mở app, kéo lại feed.
2. Mở một bài video, một reel, một tin và một video tin nhắn **đã đăng trước khi đổi**: phải phát được và tua được.
3. Đăng mới một bài video và gửi một video tin nhắn: phát được.
4. Trên web (Chrome và Safari), mở lại các video đó: phát được.

App đang mở có thể còn giữ link cũ trong bộ nhớ: kéo lại feed, hoặc tắt hẳn app rồi mở lại.

### 6.4 Quay lui

Đổi ô CDN Hostname về `vz-….b-cdn.net` cũ. Không mất dữ liệu nào: chỉ là link phát quay về tên miền cũ.

---

## 7. Checklist tóm tắt

- [ ] Tài khoản Bunny: 2FA, nạp tiền, tự động nạp, cảnh báo chi tiêu
- [ ] Pull Zone `vnseea-media` trỏ về `https://media.vnseea.vn`, bật Asia & Oceania
- [ ] Cache theo query string bật; Origin Shield (khuyến nghị); CORS
- [ ] DNS CNAME `cdn.vnseea.vn` → `vnseea-media.b-cdn.net`, bật SSL
- [ ] `curl` kiểm tra ảnh (200, lần 2 HIT) và video (206)
- [ ] `NUXT_IMAGE_EXTRA_DOMAINS` trong `client/.env` (production và v2), deploy lại web
- [ ] Admin: điền hostname CDN, bật công tắc, thấy thông báo xanh
- [ ] Hai thư viện Stream `vnseea-public` và `vnseea-chat`, encode 360p–1080p
- [ ] `vnseea-chat`: bật token authentication cho file video, kiểm tra link không ký bị 403
- [ ] Cả 2 thư viện: **tắt** "Block direct URL file access" (Bunny bật sẵn khi tạo thư viện)
- [ ] Tên miền riêng `stream.vnseea.vn` và `chat-stream.vnseea.vn`: hostname trong Bunny, CNAME, SSL; `dig @203.162.4.191` trả về IP
- [ ] Admin: điền thông tin 2 thư viện (CDN Hostname là tên miền riêng, không phải `*.b-cdn.net`), cả hai báo "đã đủ cấu hình", công tắc Stream vẫn TẮT
- [ ] Ngưỡng "Không nén trên máy với video dài hơn (giây)": `1200`
- [ ] Webhook URL dán vào cả 2 thư viện
- [ ] Migration `20261002_bunny_stream_uploads.sql` đã chạy trên production và v2
- [ ] Deploy backend + web; nút "Kiểm tra kết nối" báo 2 thư viện kết nối API thành công
- [ ] Build app mới; bật "Upload video tin nhắn mới lên Bunny Stream"
- [ ] Thử video ngắn và dài từ app; web phát được trên Chrome và Safari; dòng kiểm tra link có chữ ký báo thành công
- [ ] Giai đoạn C: migration `20261003_bunny_stream_publish_uploads.sql` đã chạy trên production và v2 **trước** deploy
- [ ] Deploy (worker push tự khởi động lại); **không** bật `cron-job.php`
- [ ] Build app mới; bật "Upload video bài viết, reels, tin mới lên Bunny Stream"
- [ ] Thử bài viết (ngắn, dài), reel, tin; tài khoản khác chỉ thấy bài sau khi xử lý xong; web phát được; dòng kiểm tra thư viện công khai báo thành công
- [ ] Thử phát trên Wi‑Fi VNPT và 4G Viettel với DNS mặc định

---

## Tài liệu tham khảo

- TUS Resumable Uploads: <https://bunny.net/docs/stream/tus-resumable-uploads>
- Stream webhooks: <https://docs.bunny.net/stream/webhooks>
- Stream security options: <https://bunny.net/docs/stream/security-options>
- CDN token authentication: <https://bunny.net/docs/cdn/security/token-authentication/advanced>
- Custom hostname cho Pull Zone: <https://bunny.net/docs/cdn/custom-hostname>
- SSL cho custom hostname: <https://bunny.net/docs/cdn/ssl-setup>
