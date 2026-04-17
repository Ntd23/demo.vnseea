# Danh sách toàn bộ page và trạng thái

> Nguồn tổng hợp từ `client/doc/page_feature_audit.md` và trạng thái đã xác nhận trong cuộc trao đổi.

## Trạng thái
- `[x]` = đã xong
- `[ ]` = chưa xong
- `[~]` = đang làm / chưa chốt

---

## Các page chính

- `[x]` `P-01` `/welcome` — Đăng nhập
- `[x]` `P-02` `/register` — Đăng ký
- `[x]` `P-03` `/m` — Quên mật khẩu
- `[x]` `P-04` `/home` — Trang chủ / News Feed
- `[x]` `P-05` `/@{username}` — User Profile / Timeline
- `[x]` `P-06` `/messages` — Tin nhắn (Full page)
- `[~]` `P-07` `/reels` — Short Videos
- `[ ]` `P-08` `/story-content` — Xem Stories
- `[x]` `P-09` `/status/create` — Tạo Story
- `[x]` `P-10` `/products` — Marketplace
- `[x]` `P-11` `/new-product` — Tạo sản phẩm
- `[x]` `P-12` `/edit-product/{id}` — Sửa sản phẩm
- `[x]` `P-13` `/my-products` — Sản phẩm của tôi
- `[x]` `P-14` `/checkout` — Thanh toán
- `[x]` `P-15` `/orders` — Đơn hàng (người mua)
- `[x]` `P-16` `/order/{id}` — Chi tiết đơn hàng
- `[ ]` `P-17` `/customer_order/{id}` — Đơn hàng (người bán)
- `[ ]` `P-18` `/create-group` — Tạo nhóm
- `[ ]` `P-19` `/g/{group_name}` — Trang nhóm
- `[ ]` `P-20` `/group-setting/{group}` — Cài đặt nhóm
- `[ ]` `P-21` `/create-page` — Tạo trang
- `[ ]` `P-22` `/p/{page_name}` — Trang fanpage
- `[ ]` `P-23` `/page-setting/{page}` — Cài đặt page
- `[ ]` `P-24` `/blogs` — Danh sách blogs
- `[ ]` `P-25` `/create-blog` — Viết blog
- `[ ]` `P-26` `/read-blog/{slug}` — Đọc blog
- `[ ]` `P-27` `/events` — Sự kiện
- `[ ]` `P-28` `/events/create-event` — Tạo sự kiện
- `[ ]` `P-29` `/events/{id}` — Chi tiết sự kiện
- `[ ]` `P-30` `/jobs` — Việc làm
- `[ ]` `P-31` `/funding` + `/create_funding` + `/show_fund/{id}` — Crowdfunding
- `[ ]` `P-32` `/live` — Live Streaming
- `[ ]` `P-33` `/watch` — Xem Video
- `[ ]` `P-34` `/setting` — Cài đặt

---

## Các page phụ

- `[ ]` `P-35` `/search` — Tìm kiếm
- `[ ]` `P-36` `/hashtag/{tag}` — Hashtag
- `[ ]` `P-37` `/explore` — Khám phá
- `[ ]` `P-38` `/saved-posts` — Bài đã lưu
- `[ ]` `P-39` `/poke` — Poke
- `[ ]` `P-40` `/memories` — Memories
- `[ ]` `P-41` `/games` — Games
- `[ ]` `P-42` `/go-pro` — Go Pro
- `[ ]` `P-43` `/forum` — Forum
- `[ ]` `P-44` `/directory` — Directory
- `[ ]` `P-45` `/wallet` — Wallet
- `[ ]` `P-46` `/withdrawal` — Withdrawal

---

## Ghi chú trạng thái đã xác nhận

### Đã xong
- `welcome` — đã hoàn thiện UI/responsive
- `register` — đã hoàn thiện UI/responsive
- `forgot-password` — đã hoàn thiện UI/responsive
- `home`
- `@username` / `ProfilePage`
- `messages` — đã hoàn thiện UI/responsive
- `status/create` — đã hoàn thiện UI/responsive
- `products` — đã hoàn thiện UI/responsive
- `new-product` — đã hoàn thiện UI/responsive
- `edit-product` — đã hoàn thiện UI/responsive
- `my-products` — đã hoàn thiện UI/responsive
- `checkout` — đã hoàn thiện UI/responsive

### Đang làm / cần chốt lại
- `reels` — đã bắt đầu UI theo ảnh gợi ý, cần review/hoàn thiện thêm nếu bạn muốn chốt

### Chưa làm
- toàn bộ page còn lại trong checklist
