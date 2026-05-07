English description: Test cases for the lightbox bounded context, covering the shared media viewer used by photos and feed media surfaces.

# Test Case Lightbox

## Phạm vi

- Context: `client/src/lightbox`
- Màn hình sử dụng:
  - `/photos`
  - các feed/gallery screen có mở `LightboxModal`
- Điểm vào chính:
  - `presentation/components/LightboxModal.vue`
- Ngoài phạm vi:
  - Story viewer
  - Reels viewer

## Môi trường

- Nuxt direct: `http://127.0.0.1:3000`
- Laragon proxy: `http://demo.vnseea.test:8080`
- Nguồn session backend: PHP browser cookies
- Dữ liệu đầu vào: media item từ feed/photos page, không gọi bridge riêng

## Smoke

| ID | Status | Case | Entry | Kỳ vọng |
| --- | --- | --- | --- | --- |
| `LIGHTBOX-SMOKE-001` | `[ ]` | Mở lightbox từ `/photos` | Click một ảnh bất kỳ | Viewer mở được, không lỗi modal, không trắng phần media. |
| `LIGHTBOX-SMOKE-002` | `[ ]` | Đóng lightbox | `Esc`, click close, hoặc đổi `open` state | Viewer đóng sạch, không kẹt overlay. |

## Truy cập và điều hướng

| ID | Status | Case | Điều kiện | Kỳ vọng |
| --- | --- | --- | --- | --- |
| `LIGHTBOX-ROUTE-001` | `[ ]` | Điều hướng item bằng nút trái/phải | Có từ 2 media item trở lên | Item hiện tại đổi đúng, counter cập nhật đúng. |
| `LIGHTBOX-ROUTE-002` | `[ ]` | Điều hướng item bằng phím `ArrowLeft` `ArrowRight` | Desktop, lightbox đang mở | Item đổi đúng và không scroll nền phía sau. |

## Dữ liệu và hiển thị

| ID | Status | Case | Entry | Kỳ vọng |
| --- | --- | --- | --- | --- |
| `LIGHTBOX-API-001` | `[ ]` | Ảnh trong lightbox | Mở image item | Viewer hiển thị đúng `src`/`alt`, không thay bằng placeholder hoặc avatar fallback khi item có ảnh thật. |
| `LIGHTBOX-API-002` | `[ ]` | Video trong lightbox | Mở video item | Viewer hiển thị video player thật, không render thành ảnh tĩnh. |
| `LIGHTBOX-API-003` | `[ ]` | Thông tin item | Mở item có title/author/caption | Side panel hiển thị đúng metadata nhận từ nơi gọi, không lặp action box hoặc chrome dư. |

## UI và UX

| ID | Status | Case | Viewport | Kỳ vọng |
| --- | --- | --- | --- | --- |
| `LIGHTBOX-UI-001` | `[ ]` | Layout desktop | `>= 1024px` | Viewer media là trọng tâm, panel phụ chỉ giữ thông tin và action cần thiết, không lặp nút share/download ở nhiều khu vực. |
| `LIGHTBOX-UI-002` | `[ ]` | Thumbnail strip | `>= 1024px` | Click thumbnail đổi đúng item, thumbnail active highlight đúng. |
| `LIGHTBOX-UI-003` | `[ ]` | Layout mobile | `390x844` | Viewer và panel stack được, action vẫn bấm được, media không bị crop vô nghĩa. |

## Lệnh kiểm tra

```powershell
cd client
npm run build
```

## Ghi chú

- Lightbox không có bridge riêng; testcase phải xác nhận dữ liệu đầu vào đến từ context gọi nó như `/photos` hoặc `FeedPostCard`.
- Nếu vẫn còn action top bar và action side panel lặp lại cùng chức năng, đánh fail `LIGHTBOX-UI-001`.
