# Hướng dẫn thiết lập Bunny cho VNSEEA

Tài liệu này liệt kê các bước làm trên **bunny.net**, **DNS**, **server** và **trang admin VNSEEA** để bật:

- **Bunny CDN (Pull Zone)** – phát ảnh, avatar và video hiện có từ máy chủ Bunny gần người xem (giai đoạn A, dùng được ngay).
- **Bunny Stream** – upload video mới thẳng lên Bunny, tự encode ra HLS nhiều chất lượng (giai đoạn B; có thể điền sẵn thông tin, nhưng **giữ công tắc tắt** cho tới khi bản giai đoạn B được deploy).

Mọi thứ đều bật/tắt được trong admin. Tắt là hệ thống quay về chạy local như cũ ngay lập tức.

> Giao diện Bunny thay đổi theo thời gian, tên nút có thể khác đôi chút so với tài liệu này. Mỗi phần đều có bước **Kiểm tra** để biết đã cấu hình đúng hay chưa.

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

### 2.4 Hostname riêng `cdn.vnseea.vn` (khuyến nghị)

1. Pull Zone → **General → Hostnames → Add Custom Hostname**: nhập `cdn.vnseea.vn`.
2. Tại nhà cung cấp DNS, tạo bản ghi:

   | Loại | Tên | Giá trị |
   |---|---|---|
   | CNAME | `cdn` | `vnseea-media.b-cdn.net` |

3. Đợi DNS có hiệu lực (thường vài phút), quay lại Bunny bấm bật **SSL miễn phí** cho `cdn.vnseea.vn`.

Nếu chưa muốn dùng hostname riêng, có thể dùng thẳng `vnseea-media.b-cdn.net` ở các bước sau.

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

## 3. Bunny Stream (chuẩn bị cho giai đoạn B)

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

### 3.4 Lấy thông tin của từng thư viện

Thư viện → **API**, ghi lại (làm cho cả 2 thư viện):

| Thông tin | Dạng |
|---|---|
| Video Library ID | Một dãy số, ví dụ `123456` |
| API Key | Chuỗi dài, **bí mật** |
| Read-Only API Key | Chuỗi dài, **bí mật**. Dùng để xác thực webhook |
| CDN Hostname | `vz-xxxxxxxx-xxx.b-cdn.net` |
| Token Authentication Key | Chỉ thư viện `vnseea-chat` (mục 3.3), **bí mật** |

> Không gửi các key bí mật qua chat hay email. Dán thẳng vào trang admin ở bước 3.6.

### 3.5 Webhook

Để trống ở bước này. Bản cập nhật giai đoạn B sẽ cung cấp URL webhook để điền vào mục **Webhook URL** của từng thư viện.

### 3.6 Điền vào admin VNSEEA

**Admin → Cài đặt → Cấu hình tải tệp lên → mục "Bunny CDN & Bunny Stream"**

1. Thẻ **"Thư viện công khai (bài viết, reels, story)"**: điền Library ID, API Key, Read-Only API Key, CDN Hostname của `vnseea-public`.
2. Thẻ **"Thư viện riêng tư (video tin nhắn)"**: điền thông tin của `vnseea-chat`, thêm **Token Authentication Key**.
   - **Thời hạn link video tin nhắn**: giữ `21600` (6 giờ).
3. Ô key bí mật được lưu khi rời khỏi ô. Sau khi lưu, ô tự để trống và chỉ hiện "Đã lưu (…4 ký tự cuối)". Key được mã hoá trong database và không bao giờ gửi xuống app hay web.
4. Thẻ **"Bunny Stream cho video mới"**:
   - **Không nén trên máy với video dài hơn (giây)**: giữ `180`.
   - Hai dòng trạng thái phải báo **"đã đủ cấu hình"** cho cả 2 thư viện.
   - **Giữ công tắc "Upload video mới lên Bunny Stream" TẮT** cho tới khi bản giai đoạn B được deploy.

---

## 4. Checklist tóm tắt

- [ ] Tài khoản Bunny: 2FA, nạp tiền, tự động nạp, cảnh báo chi tiêu
- [ ] Pull Zone `vnseea-media` trỏ về `https://media.vnseea.vn`, bật Asia & Oceania
- [ ] Cache theo query string bật; Origin Shield (khuyến nghị); CORS
- [ ] DNS CNAME `cdn.vnseea.vn` → `vnseea-media.b-cdn.net`, bật SSL
- [ ] `curl` kiểm tra ảnh (200, lần 2 HIT) và video (206)
- [ ] `NUXT_IMAGE_EXTRA_DOMAINS` trong `client/.env` (production và v2), deploy lại web
- [ ] Admin: điền hostname CDN, bật công tắc, thấy thông báo xanh
- [ ] Hai thư viện Stream `vnseea-public` và `vnseea-chat`, encode 360p–1080p
- [ ] `vnseea-chat`: bật token authentication cho file video, kiểm tra link không ký bị 403
- [ ] Admin: điền thông tin 2 thư viện, cả hai báo "đã đủ cấu hình", công tắc Stream vẫn TẮT

---

## Tài liệu tham khảo

- TUS Resumable Uploads: <https://bunny.net/docs/stream/tus-resumable-uploads>
- Stream webhooks: <https://docs.bunny.net/stream/webhooks>
- Stream security options: <https://bunny.net/docs/stream/security-options>
- CDN token authentication: <https://bunny.net/docs/cdn/security/token-authentication/advanced>
