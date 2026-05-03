English description: Step-by-step guide for wrapping https://vnseea.vn/ in a Capacitor WebView app and preparing Android and iOS builds.

# Hướng Dẫn Làm App WebView Cho `https://vnseea.vn/`

## Mục tiêu

Tạo một app mobile dạng `WebView` để mở website đang chạy thật:

- `https://vnseea.vn/`

Hướng dẫn này đi theo hướng:

- dùng `Capacitor`
- app mở `URL` online
- ưu tiên `Android` trước
- làm `iOS` sau nếu có `Mac`

## Cách làm nên dùng

Không nên nhét phần app mobile vào trong code PHP hiện tại.

Nên tạo một project riêng chỉ để làm native shell, ví dụ:

- `D:\Duong\src\mobile-webview-vnseea`

App chỉ nên biết một URL cố định, ví dụ:

- `https://vnseea.vn/?source=app`

Anh vẫn có thể dùng thẳng:

- `https://vnseea.vn/`

Nhưng thêm `?source=app` sẽ tiện hơn về sau nếu muốn tách vài hành vi riêng cho app.

## Trước khi bắt đầu

Phải chắc chắn website chạy ổn trên trình duyệt điện thoại trước.

Hãy test các luồng sau trên máy thật:

1. Đăng nhập và đăng xuất.
2. Mở feed, profile, messages, settings.
3. Upload ảnh từ camera và từ thư viện.
4. Mở link ngoài như Facebook, YouTube, Zalo, Maps.
5. Mở trang thanh toán rồi quay lại.
6. Tải file nếu app của anh có nhu cầu đó.

Nếu web đang lỗi trên Chrome mobile hoặc Safari mobile thì bọc `WebView` xong vẫn lỗi như cũ.

## Yêu cầu môi trường

### Chung

Cài:

- `Node.js 22+`
- `Git`

Kiểm tra:

```powershell
node -v
npm -v
git --version
```

### Android

Cài:

- `Android Studio`
- Android SDK

### iOS

Cài:

- `macOS`
- `Xcode`

Không thể build iOS thật từ Windows nếu không có Mac.

## Bước 1: Tạo project mobile mới

Mở PowerShell và chạy:

```powershell
mkdir D:\Duong\src\mobile-webview-vnseea
cd D:\Duong\src\mobile-webview-vnseea
npm init -y
```

Cài Capacitor:

```powershell
npm install @capacitor/core
npm install -D @capacitor/cli
npm install @capacitor/android
```

Nếu có Mac và muốn làm luôn iOS:

```powershell
npm install @capacitor/ios
```

## Bước 2: Khởi tạo Capacitor

Chạy:

```powershell
npx cap init
```

Khi được hỏi, điền ví dụ như sau:

- App name: `VNSEEA`
- App ID: `com.vnseea.app`
- Web directory: `www`

Sau bước này, project sẽ có file config của Capacitor.

## Bước 3: Tạo web assets tối thiểu

Tạo thư mục:

```powershell
mkdir www
```

Tạo file `www/index.html` với nội dung:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VNSEEA</title>
  <meta http-equiv="refresh" content="0;url=https://vnseea.vn/?source=app">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
      background: #ffffff;
      color: #111111;
    }
  </style>
</head>
<body>
  Đang mở VNSEEA...
</body>
</html>
```

Tạo file `www/offline.html`:

```html
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mất kết nối</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: Arial, sans-serif;
      background: #ffffff;
      color: #111111;
      text-align: center;
    }
    .box {
      max-width: 420px;
    }
    a {
      color: #0b57d0;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>Không có kết nối mạng</h1>
    <p>Vui lòng kiểm tra mạng rồi mở lại app.</p>
    <p><a href="https://vnseea.vn/?source=app">Thử lại</a></p>
  </div>
</body>
</html>
```

## Bước 4: Cấu hình Capacitor

Tạo hoặc sửa file `capacitor.config.ts`:

```ts
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vnseea.app',
  appName: 'VNSEEA',
  webDir: 'www',
  server: {
    allowNavigation: ['vnseea.vn', '*.vnseea.vn'],
    errorPath: 'offline.html',
  },
  android: {
    backgroundColor: '#ffffff',
  },
  ios: {
    backgroundColor: '#ffffff',
  },
}

export default config
```

## Bước 5: Thêm platform native

### Android

```powershell
npx cap add android
```

### iOS

Chỉ chạy trên Mac:

```bash
npx cap add ios
```

## Bước 6: Đồng bộ project

```powershell
npx cap sync
```

Chạy lại lệnh này mỗi khi anh đổi:

- `www/index.html`
- `www/offline.html`
- `capacitor.config.ts`
- icon, splash, plugin

## Bước 7: Mở Android Studio

```powershell
npx cap open android
```

Trong Android Studio:

1. Chờ Gradle sync xong.
2. Chọn máy ảo hoặc máy thật.
3. Bấm `Run`.

Nếu app mở được và load `https://vnseea.vn/?source=app` thì shell cơ bản đã chạy.

## Bước 8: Thiết lập Android cơ bản

Trong Android Studio, chỉnh các mục tối thiểu:

1. Tên app.
2. Icon app.
3. Màu splash screen.
4. Package name nếu cần đổi.
5. Version code và version name.

Những thứ tối thiểu để có thể phát hành:

- icon app
- splash screen
- release keystore
- signed release build

## Bước 9: Test trên máy Android thật

Phải test trên máy Android thật, không chỉ test emulator.

Test các luồng sau:

1. Mở app.
2. Đăng nhập.
3. Mở nhiều trang bên trong app.
4. Dùng nút back của Android.
5. Upload ảnh từ camera.
6. Upload ảnh từ thư viện.
7. Mở link ngoài.
8. Mở trang thanh toán rồi quay lại.
9. Chuyển qua lại giữa Wi-Fi và 4G.
10. Tắt hẳn app rồi mở lại.

Các lỗi thường gặp của WebView:

- nút upload không mở được bộ chọn file
- link ngoài bị mở trong app thay vì mở bằng trình duyệt
- callback thanh toán bị kẹt
- cookie đăng nhập không giữ được
- một số tài nguyên bị chặn

## Bước 10: Build Android bản release

Trong Android Studio:

1. Vào `Build`.
2. Chọn `Generate Signed App Bundle / APK`.
3. Chọn `Android App Bundle`.
4. Tạo hoặc dùng keystore có sẵn.
5. Build bản `release`.

Dùng:

- `AAB` để upload Google Play
- `APK` chỉ để test nhanh

## Bước 11: Đẩy lên Google Play Internal Testing

Lúc đầu nên dùng `Internal testing`, không nên đẩy thẳng production.

Chuẩn bị trước:

1. Tên app.
2. Mô tả ngắn.
3. Mô tả đầy đủ.
4. URL privacy policy.
5. Icon app.
6. Screenshot điện thoại.
7. Feature graphic.
8. Email liên hệ.
9. Form Data safety.

Upload file `AAB` vào:

- `Google Play Console -> Internal testing`

Đây là đường đi nhanh và an toàn nhất.

## Bước 12: Làm iOS sau

Khi có Mac, làm tiếp như sau:

1. Clone project mobile shell sang máy Mac.
2. Chạy `npm install`.
3. Chạy `npx cap add ios` nếu chưa add.
4. Chạy `npx cap sync`.
5. Chạy `npx cap open ios`.
6. Mở Xcode.
7. Chọn signing team.
8. Build lên iPhone thật.
9. Archive.
10. Upload lên TestFlight.

## Bước 13: Các cải tiến nên làm sau khi shell chạy ổn

Sau khi app chạy được, anh có thể làm thêm:

1. Detect `?source=app` ở website.
2. Chỉnh khoảng cách header cho máy có notch.
3. Ép một số domain mở bằng browser ngoài.
4. Thêm pull-to-refresh nếu cần.
5. Làm trang offline đẹp hơn.
6. Thêm JS bridge với native nếu cần sau này.

## Những chỉnh sửa nên làm ở web `https://vnseea.vn/`

Để WebView đỡ lỗi, nên kiểm tra và chỉnh ở web PHP:

1. Mọi trang đều có `viewport` mobile chuẩn.
2. File input hoạt động tốt trên mobile.
3. Không phụ thuộc hoàn toàn vào `window.open`.
4. Không dùng hover desktop cho các thao tác quan trọng.
5. Cookie đăng nhập giữ domain ổn định.
6. Redirect sau login và payment nên ở cùng domain nếu có thể.
7. Nếu cần, detect `source=app` để ẩn hoặc đơn giản hóa vài thành phần nặng.

## Cấu trúc project nên dùng

Nên để project này nằm ngoài repo PHP:

```text
mobile-webview-vnseea/
  android/
  ios/
  www/
    index.html
    offline.html
  capacitor.config.ts
  package.json
```

## Xử lý lỗi nhanh

### App mở lên nhưng trắng màn hình

Kiểm tra:

- website có mở được trên điện thoại không
- SSL có hợp lệ không
- domain có bị chặn bởi cấu hình WebView không

### Đăng nhập không giữ được

Kiểm tra:

- cookie domain
- secure cookie flags
- redirect chain sau login

### Upload không hoạt động

Kiểm tra:

- `<input type="file">`
- quyền truy cập camera hoặc thư viện
- hành vi bộ chọn file trên máy thật

### Thanh toán bị vỡ flow

Kiểm tra:

- return URL
- hành vi popup
- chỗ nào cần mở bằng browser ngoài

### Giao diện bị như desktop

Kiểm tra:

- viewport meta
- CSS responsive
- container nào đang ép width desktop

## Kế hoạch làm trong 1 ngày

Nếu mục tiêu là đi thật nhanh trong 1 ngày:

1. Tạo Capacitor shell.
2. Trỏ vào `https://vnseea.vn/?source=app`.
3. Chạy được trên máy Android thật.
4. Sửa 3 lỗi mobile browser lớn nhất trên web.
5. Build signed `AAB`.
6. Upload lên Google Play Internal Testing.

Không nên hứa production public ngay trong ngày đầu.

## Bước tiếp theo sau WebView

Khi sau này anh thay dần PHP bằng Nuxt hoặc React Native:

1. Cố giữ nguyên public mobile URL nếu được.
2. Để app WebView tiếp tục load URL đó.
3. Thay phần code phía sau URL từ PHP sang Nuxt.
4. Chỉ cần update app nếu thay đổi hành vi native.

## Tài liệu chính thức

- Capacitor install: `https://capacitorjs.com/docs/getting-started`
- Capacitor config: `https://capacitorjs.com/docs/config`
- Capacitor environment setup: `https://capacitorjs.com/docs/getting-started/environment-setup`
