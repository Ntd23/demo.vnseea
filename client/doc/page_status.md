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
- `[x]` `P-24` `/blogs` — Danh sách blogs
- `[x]` `P-25` `/create-blog` — Viết blog
- `[x]` `P-26` `/read-blog/{slug}` — Đọc blog
- `[x]` `P-27` `/events` — Sự kiện
- `[x]` `P-28` `/events/create-event` — Tạo sự kiện
- `[x]` `P-29` `/events/{id}` — Chi tiết sự kiện
- `[x]` `P-30` `/jobs` — Việc làm
- `[x]` `P-31` `/funding` + `/create_funding` + `/show_fund/{id}` — Crowdfunding
- `[x]` `P-32` `/live` — Live Streaming
- `[x]` `P-33` `/watch` — Xem Video
- `[x]` `P-34` `/setting` — Cài đặt
- `[x]` `P-14` `/checkout` — Thanh toán
- `[x]` `P-15` `/orders` — Đơn hàng (người mua)
- `[x]` `P-16` `/order/{id}` — Chi tiết đơn hàng
- `[x]` `P-17` `/customer_order/{id}` — Đơn hàng (người bán)
- `[x]` `P-18` `/create-group` — Tạo nhóm
- `[x]` `P-19` `/g/{group_name}` — Trang nhóm
- `[x]` `P-20` `/group-setting/{group}` — Cài đặt nhóm
- `[x]` `P-21` `/create-page` — Tạo trang
- `[x]` `P-22` `/p/{page_name}` — Trang fanpage
- `[x]` `P-23` `/page-setting/{page}` — Cài đặt page

## Các page phụ

- `[x]` `P-35` `/search` — Tìm kiếm
- `[x]` `P-36` `/hashtag/{tag}` — Hashtag
- `[x]` `P-37` `/explore` — Khám phá
- `[x]` `P-38` `/saved-posts` — Bài đã lưu
- `[x]` `P-39` `/poke` — Poke
- `[x]` `P-40` `/memories` — Memories
- `[x]` `P-41` `/games` — Games
- `[x]` `P-42` `/go-pro` — Go Pro
- `[x]` `P-43` `/forum` — Forum
- `[x]` `P-44` `/directory` — Directory
- `[x]` `P-45` `/wallet` — Wallet
- `[x]` `P-46` `/withdrawal` — Withdrawal


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
- `blogs` — đã hoàn thiện UI danh sách, bộ lọc và pagination
- `create-blog` — đã hoàn thiện UI form viết blog, tags, thumbnail và preview
- `read-blog/{slug}` — đã hoàn thiện UI đọc blog, author/meta, react/share, comments và related blogs
- `events` — đã hoàn thiện UI danh sách sự kiện, tabs, bộ lọc và RSVP mock
- `events/create-event` — đã hoàn thiện UI form tạo sự kiện, thời gian, địa điểm, ảnh bìa và preview
- `events/{id}` — đã hoàn thiện UI chi tiết sự kiện, action bar, invite friends, attendees và owner actions
- `jobs` — đã hoàn thiện UI danh sách việc làm, filter ngành/địa điểm/loại hình, chi tiết job, apply form và đăng job mới
- `funding` / `create_funding` / `show_fund/{id}` — đã hoàn thiện UI crowdfunding, search/filter, tạo campaign, chi tiết progress, donate mock, donors list và owner actions
- `live` — đã hoàn thiện UI live streaming, Go Live mock, live player, stream list, like/mute/viewer state và live chat mock
- `watch` — đã hoàn thiện UI xem video, player mock/Plyr-ready, search/filter, video info, comments, related videos và like/share mock
- `setting` / `setting/{page}` — đã hoàn thiện UI cài đặt dạng 22 sub-pages, form fields, toggles, lists, danger zone và mock save actions
- `games` — đã hoàn thiện UI danh sách game, tab game của tôi/mới/phổ biến, search/filter, play game mock, score session, leaderboard và achievements
- `go-pro` — đã hoàn thiện UI so sánh packages, billing monthly/yearly, chọn plan, thanh toán mock, feature matrix và subscription history
- `forum` — đã hoàn thiện UI sections list, threads, search/filter, thread detail, post reply mock và tạo thread mock
- `directory` — đã hoàn thiện UI 12 sub-categories, search/filter, category sidebar, featured shortcuts và route nhanh tới từng module
- `wallet` — đã hoàn thiện UI xem số dư, nạp tiền, gửi tiền, validation số dư và lịch sử giao dịch mock
- `withdrawal` — đã hoàn thiện UI yêu cầu rút tiền, payment info, validation số dư/tối thiểu và lịch sử withdrawal mock
- `checkout` — đã hoàn thiện UI/responsive
- `search` — đã hoàn thiện UI tìm kiếm tổng hợp users/pages/groups/posts, filter theo loại, sort mock, empty state và header search link tới route `/search`
- `hashtag/{tag}` — đã hoàn thiện UI feed hashtag, lọc bài viết theo tag từ mock social data, empty state, hashtag liên quan/gợi ý và link trực tiếp từ tag chip trong post
- `explore` — đã hoàn thiện UI khám phá với recommended posts/users/pages, bộ lọc theo loại nội dung, hashtag trending và nối route từ mobile menu
- `saved-posts` — đã hoàn thiện UI danh sách bài đã lưu, summary cards, bỏ lưu từng bài hoặc toàn bộ, empty state và route điều hướng từ sidebar/mobile menu
- `poke` — đã hoàn thiện UI danh sách poke, card kết nối, nút chọc lại và nối route đúng `/poke` từ sidebar/mobile menu
- `memories` — đã hoàn thiện UI ngày này năm trước, wrapper memory card, nút chia sẻ lại và nối route từ điều hướng hệ thống

### Đang làm / cần chốt lại
- `reels` — đã bắt đầu UI theo ảnh gợi ý, cần review/hoàn thiện thêm nếu bạn muốn chốt

### Chưa làm
- toàn bộ page còn lại trong checklist
