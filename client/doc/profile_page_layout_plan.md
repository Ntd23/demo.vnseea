# Kế hoạch dựng lại trang Profile theo ảnh mẫu

## Mục tiêu
✅ Dựng lại `client/app/components/pages/ProfilePage.vue` theo đúng bố cục ảnh người dùng gửi.

## Bố cục cần bám sát
✅ 1. Thanh header xanh ở trên cùng.
✅ 2. Khối cover/banner lớn ở đầu trang.
✅ 3. Thanh tab nằm ngay dưới banner.
✅ 4. Cột giữa là feed chính.
✅ 5. Cột phải chỉ chứa các widget phụ như:
   - bản đồ
   - bạn bè / người liên quan
   - thư viện ảnh
   - hộp chat nổi
✅ 6. Không dùng left sidebar riêng biệt nếu ảnh không có.

## Thành phần sẽ chỉnh
✅ `client/app/components/pages/ProfilePage.vue`
✅ `client/app/components/profile/ProfileHero.vue` nếu cần để sát ảnh hơn
✅ `client/app/components/feed/PublisherBox.vue`
✅ `client/app/components/feed/PostCard.vue`
✅ `client/app/components/navigation/RightSidebar.vue` hoặc `NavigationChatWidget` nếu hộp chat chưa giống

## Nguyên tắc triển khai
✅ Ưu tiên bố cục trước, chi tiết sau.
✅ Giữ `main feed` ở giữa rộng hơn cột phải.
✅ Cột phải chỉ dùng cho widget phụ và chat.
✅ Không thêm khối thừa như left sidebar nếu ảnh không có.
✅ Sau khi sửa xong phải kiểm tra lint.
