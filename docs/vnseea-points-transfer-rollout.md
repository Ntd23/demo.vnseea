# Triển khai chuyển VNSEEA chuẩn hóa

## Thứ tự triển khai

1. Backup database staging.
2. Xác nhận `Wo_Users` và `Wo_Payment_Transactions` dùng InnoDB.
3. Chạy `database/migrations/20260713_create_points_transfer_requests.sql`.
4. Deploy PHP service, endpoint `points-transfer`, history overview và QR.
5. Deploy Nuxt, sau đó build App.
6. Chạy integration test bằng hai tài khoản staging riêng.

## Biến môi trường integration test

```bash
export VNSEEA_IT_CONFIRM_STAGING=YES
export VNSEEA_IT_BACKEND_API_BASE=https://staging.example.vn
export VNSEEA_IT_BACKEND_WEB_BASE=https://staging.example.vn
export VNSEEA_IT_NUXT_BASE=https://staging-web.example.vn
export VNSEEA_IT_SERVER_KEY=...
export VNSEEA_IT_USER_A_TOKEN=...
export VNSEEA_IT_USER_B_TOKEN=...
# Chỉ cần khi hostname staging không chứa staging/stage/test/dev.
export VNSEEA_IT_STAGING_HOSTS=staging-api.example.vn,staging-web.example.vn

cd client
corepack pnpm@10.23.0 test:points-transfer:integration
```

Mỗi tài khoản cần ít nhất 4 VNSEEA. Script chuyển thật bốn chiều, kiểm tra QR, balance, history, idempotency và cố gắng đưa số dư về trạng thái ban đầu nếu test dừng giữa chừng.

## Rollback

- Nếu client có lỗi, rollback App/Nuxt nhưng giữ backend bridge cho phiên bản cũ.
- Nếu backend có lỗi trước khi production traffic chạy, rollback code endpoint; bảng idempotency có thể giữ lại vì không thay đổi bảng người dùng.
- Không drop bảng request khi còn giao dịch đã commit vì bảng là bằng chứng chống gửi trùng.
