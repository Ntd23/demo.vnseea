# Auth Test Cases

Mục tiêu của context `auth` là dùng backend PHP làm source of truth cho session web, token xác nhận, reset password và logout. Các ca test dưới đây nên được chạy trên `https://demo.vnseea.test:8443` để cookie backend hoạt động đúng domain.

## Setup

1. Chạy `npm run dev` trong `client`.
2. Mở DevTools:
   - `Network`
   - `Application > Cookies`
3. Xóa cookie `user_id` trước mỗi vòng test độc lập.
4. Với các flow cần email hoặc SMS, chuẩn bị sẵn:
   - 1 tài khoản active
   - 1 tài khoản bật 2FA nếu cần test `confirm-login`
   - 1 tài khoản chưa active nếu cần test `confirm-account`

## Login

### AUTH-LOGIN-001
- Route: `/welcome`
- Input: account hợp lệ + password đúng
- Kỳ vọng:
  - gọi `POST /_api/auth/login`
  - backend trả `access_token`
  - browser đi qua `/api/v2/endpoints/set-browser-cookie.php?access_token=...`
  - redirect về `/home`
  - cookie `user_id` xuất hiện

### AUTH-LOGIN-002
- Route: `/welcome`
- Input: password sai
- Kỳ vọng:
  - `POST /_api/auth/login`
  - UI hiện lỗi backend như `Password is incorrect`
  - không tạo cookie `user_id`
  - không redirect

### AUTH-LOGIN-003
- Route: `/welcome`
- Input: account bật 2FA
- Kỳ vọng:
  - `POST /_api/auth/login`
  - chuyển sang `/confirm-login?userId=...`
  - chưa tạo cookie `user_id`

## Confirm Login

### AUTH-CONFIRM-LOGIN-001
- Route: `/confirm-login?userId=...`
- Input: mã xác nhận hợp lệ
- Kỳ vọng:
  - gọi `POST /_api/auth/confirm-login`
  - backend trả `access_token`
  - browser đi qua `set-browser-cookie.php`
  - redirect về `/home`
  - cookie `user_id` xuất hiện

### AUTH-CONFIRM-LOGIN-002
- Route: `/confirm-login?userId=...`
- Input: mã sai
- Kỳ vọng:
  - UI hiện lỗi xác nhận
  - không redirect
  - không tạo cookie `user_id`

## Register

### AUTH-REGISTER-001
- Route: `/register`
- Input: dữ liệu hợp lệ, backend cho active ngay
- Kỳ vọng:
  - gọi `POST /_api/auth/register`
  - backend trả `access_token`
  - browser đi qua `set-browser-cookie.php`
  - redirect về `/home`

### AUTH-REGISTER-002
- Route: `/register`
- Input: dữ liệu hợp lệ, backend yêu cầu verify
- Kỳ vọng:
  - gọi `POST /_api/auth/register`
  - chuyển sang `/confirm-account?userId=...`
  - không tự login trước khi verify

### AUTH-REGISTER-003
- Route: `/register`
- Input: username trùng hoặc email trùng
- Kỳ vọng:
  - UI hiện lỗi backend thật
  - không redirect

## Confirm Account

### AUTH-CONFIRM-ACCOUNT-001
- Route: `/confirm-account?userId=...`
- Input: mã verify email/SMS đúng
- Kỳ vọng:
  - gọi `POST /_api/auth/confirm-account`
  - backend trả `access_token`
  - browser đi qua `set-browser-cookie.php`
  - redirect về `/home`

### AUTH-CONFIRM-ACCOUNT-002
- Route: `/confirm-account?userId=...`
- Input: mã sai
- Kỳ vọng:
  - hiện lỗi backend
  - không redirect

## Forgot Password

### AUTH-FORGOT-001
- Route: `/forgot-password`
- Input: email hợp lệ
- Kỳ vọng:
  - gọi `POST /_api/auth/forgot-password`
  - backend gửi email
  - UI báo gửi thành công

### AUTH-FORGOT-002
- Route: `/forgot-password`
- Input: số điện thoại hợp lệ
- Kỳ vọng:
  - gọi `POST /_api/auth/forgot-password`
  - backend gửi SMS
  - chuyển sang `/confirm-reset-sms?userId=...`

### AUTH-FORGOT-003
- Route: `/forgot-password`
- Input: email hoặc phone không tồn tại
- Kỳ vọng:
  - UI hiện lỗi backend
  - không redirect

## Confirm Reset SMS

### AUTH-CONFIRM-RESET-SMS-001
- Route: `/confirm-reset-sms?userId=...`
- Input: mã SMS đúng
- Kỳ vọng:
  - gọi `POST /_api/auth/confirm-reset-sms`
  - chuyển sang `/reset-password?code=...&email=...`

### AUTH-CONFIRM-RESET-SMS-002
- Route: `/confirm-reset-sms?userId=...`
- Input: mã SMS sai
- Kỳ vọng:
  - UI hiện lỗi backend
  - không redirect

## Reset Password

### AUTH-RESET-001
- Route: `/reset-password?code=...&email=...`
- Input: email đúng + password mới hợp lệ
- Kỳ vọng:
  - gọi `POST /_api/auth/reset-password`
  - backend cập nhật password
  - redirect về `/welcome`

### AUTH-RESET-002
- Route: `/reset-password?code=...&email=...`
- Input: token sai hoặc hết hạn
- Kỳ vọng:
  - UI hiện lỗi backend
  - không redirect

## Logout

### AUTH-LOGOUT-001
- Bối cảnh: user đang login
- Action: bấm logout trong menu
- Kỳ vọng:
  - browser đi qua `/index.php?link1=logout`
  - backend xóa cookie `user_id` và app session
  - redirect về `/welcome`

### AUTH-LOGOUT-002
- Sau khi logout:
  - truy cập `/`
  - truy cập `/home`
  - truy cập `/messages`
- Kỳ vọng:
  - bị đưa về `/welcome`

## Route Access

### AUTH-GUARD-001
- Khi đã login:
  - vào `/welcome`
  - vào `/register`
  - vào `/forgot-password`
  - vào `/confirm-login`
  - vào `/confirm-account`
  - vào `/confirm-reset-sms`
  - vào `/reset-password`
- Kỳ vọng:
  - SSR không render guest page
  - bị chuyển sang `/home`

### AUTH-GUARD-002
- Khi chưa login:
  - vào các route protected như `/`, `/home`, `/messages`
- Kỳ vọng:
  - bị chuyển sang `/welcome`

## Ghi chú

- Nếu `register` hoặc `forgot-password` lỗi gửi mail, kiểm tra SMTP/backend PHP trước khi kết luận lỗi frontend.
- Nếu SMS flow lỗi, kiểm tra cấu hình SMS server trước.
- Nếu một flow hoạt động ở `demo.vnseea.test:8443` nhưng không hoạt động tương tự ở `127.0.0.1:3000`, ưu tiên nghi ngờ domain/cookie/session hơn là logic auth.
