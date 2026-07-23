
Có hai cách chạy:

1. **Nuxt local, dùng backend đang deploy**: phù hợp khi chỉ sửa giao diện hoặc logic Nuxt.
2. **Full-stack local**: PHP, database, Nuxt và realtime đều chạy trên máy.

> Không commit `config.php`, `client/.env`, database dump, access token hoặc khóa bí mật. Repo đã ignore `config.php` và `client/.env`.

## 1. Phiên bản và công cụ cần thiết

### Dùng chung

- Git.
- Node theo file `.nvmrc`: **Node 23**.
- pnpm đúng phiên bản trong `client/package.json`: **10.33.0**.
- PHP tối thiểu 8.0; khuyến nghị PHP 8.2 hoặc 8.3.
- Composer 2.
- MySQL 8 hoặc MariaDB 10.6 trở lên.
- PHP extensions: `mysqli`, `curl`, `gd`, `zip`, `mbstring`, `openssl`, `fileinfo`.

Kiểm tra:

```bash
node --version
corepack pnpm@10.33.0 --version
php --version
composer --version
mysql --version
```

### Windows

Khuyến nghị dùng:

- Laragon Full với Nginx, PHP và MySQL/MariaDB.
- NVM for Windows để quản lý Node.
- PowerShell 7 hoặc Windows Terminal.

Kích hoạt đúng Node/pnpm:

```powershell
nvm install 23
nvm use 23
corepack enable
corepack pnpm@10.33.0 --version
```

### macOS

Khuyến nghị dùng Homebrew và `nvm`:

```bash
brew install nvm php@8.3 mysql nginx composer
```

Kích hoạt `nvm`, sau đó dùng phiên bản trong `.nvmrc`:

```bash
mkdir -p ~/.nvm
export NVM_DIR="$HOME/.nvm"
source "$(brew --prefix nvm)/nvm.sh"
cd /duong-dan/toi/demo.vnseea
nvm install
nvm use
corepack enable
corepack pnpm@10.33.0 --version
```

Nên thêm hai dòng `NVM_DIR` và `source` vào `~/.zshrc` để terminal mới tự nhận `nvm`.

Khởi động các dịch vụ cho chế độ full-stack:

```bash
brew services start mysql
brew services start php@8.3
brew services start nginx
```

## 2. Chuẩn bị source Nuxt

Từ thư mục repository:

```bash
cd client
corepack pnpm@10.33.0 install --frozen-lockfile
```

Không chạy `nuxt prepare`, `nuxi prepare` hoặc `pnpm build` trong lúc dev server của project đang chạy. Các lệnh này tái tạo `.nuxt` và có thể làm dev server hiện tại mất file runtime.

## 3. Cách nhanh: Nuxt local, backend đang deploy

Cách này không chạy PHP/MySQL local. Nuxt chạy tại `http://127.0.0.1:3000` và gọi backend của môi trường dev/staging.

### 3.1. Tạo `client/.env`

Tạo file `client/.env` với nội dung sau và thay các giá trị trong dấu `<...>` bằng secret do nhóm phát triển cung cấp:

```dotenv
NUXT_PUBLIC_API_BASE=/_api
NUXT_BACKEND_API_BASE=https://<backend-dev-domain>
NUXT_PUBLIC_BACKEND_WEB_BASE=https://<backend-dev-domain>
NUXT_BACKEND_SERVER_KEY=<backend-server-key>
NUXT_PUBLIC_SITE_URL=http://127.0.0.1:3000

NUXT_DEV_HOST=127.0.0.1
NUXT_DEV_PORT=3000
NUXT_ALLOWED_HOSTS=127.0.0.1,localhost

NUXT_PUBLIC_REALTIME_URL=https://<realtime-public-domain>
REALTIME_INTERNAL_URL=
REALTIME_SECRET=<secret-giong-realtime-server>

NUXT_PUBLIC_SCRIPTS_GOOGLE_MAPS_API_KEY=<google-maps-browser-key-hoac-de-trong>
NUXT_PUBLIC_SCRIPTS_GOOGLE_MAPS_MAP_ID=<google-map-id-hoac-de-trong>
NUXT_SCRIPTS_PROXY_SECRET=<chuoi-ngau-nhien-rieng-cho-local>
```

Lưu ý:

- Không dùng nguyên xi giá trị mẫu trong `.env.example`; mọi key bí mật phải lấy từ kho secret nội bộ hoặc tự sinh cho môi trường local.
- `NUXT_BACKEND_SERVER_KEY` phải khớp API server key của backend.
- `REALTIME_SECRET` phải giống secret của realtime server thì endpoint cấp realtime token mới hoạt động.
- Realtime từ localhost chỉ kết nối được nếu server cho phép origin `http://127.0.0.1:3000`.
- Ưu tiên backend staging. Không thử thao tác tạo/xóa dữ liệu trên production nếu chưa được phép.

### 3.2. Chạy Nuxt

Windows PowerShell và macOS dùng cùng lệnh:

```bash
cd client
corepack pnpm@10.33.0 dev
```

Mở:

```text
http://127.0.0.1:3000
```

Nếu chỉ xem trang public thì có thể chưa cần realtime secret. Đăng nhập, thông báo realtime và realtime bài viết cần đúng server key/secret.

## 4. Full-stack local: phần chuẩn bị chung

### 4.1. Database dump và upload

Repository không chứa database gốc (`vnseea.sql`) và thư mục media `upload/` cũng bị ignore. Cần lấy từ nguồn nội bộ đã được phép:

- Một database dump đã loại bỏ dữ liệu nhạy cảm.
- Thư mục `upload/` nếu cần kiểm tra ảnh/video cũ.

Không tải database production chứa thông tin người dùng thật về máy cá nhân nếu chưa được phê duyệt.

### 4.2. Tạo database

Chạy trong MySQL client, phpMyAdmin hoặc HeidiSQL:

```sql
CREATE DATABASE `vnseea_local`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'vnseea_local'@'localhost'
  IDENTIFIED BY 'thay-bang-mat-khau-local-manh';

GRANT ALL PRIVILEGES ON `vnseea_local`.*
  TO 'vnseea_local'@'localhost';

FLUSH PRIVILEGES;
```

Import database dump.

Windows PowerShell:

```powershell
cmd /c "mysql -u vnseea_local -p vnseea_local < C:\duong-dan\vnseea.sql"
```

macOS:

```bash
mysql -u vnseea_local -p vnseea_local < /duong-dan/vnseea.sql
```

Sau khi import dump, chạy các migration còn thiếu theo thứ tự thời gian:

```text
database/migrations/20260713_create_points_transfer_requests.sql
database/migrations/20260718_content_privacy_audience_v2.sql
livekit_webhook_events.sql (chỉ khi dump chưa có bảng tương ứng)
```

Luôn backup database trước khi chạy migration. Nếu migration báo lỗi, dừng lại và xử lý lỗi thay vì chạy tiếp các câu lệnh còn lại.

### 4.3. Tạo `config.php`

Tạo file `config.php` tại thư mục gốc repository:

```php
<?php
$sql_db_host = '127.0.0.1';
$sql_db_port = 3306;
$sql_db_user = 'vnseea_local';
$sql_db_pass = 'thay-bang-mat-khau-local-manh';
$sql_db_name = 'vnseea_local';
$site_url = 'http://demo.vnseea.test:8080';
$purchase_code = 'local-development';
```

Không thêm file này vào Git.

### 4.4. Lấy API server key từ database local

Backend hiện kiểm tra config có tên `widnows_app_api_key` (giữ nguyên chính tả đang có trong code):

```sql
SELECT `value`
FROM `Wo_Config`
WHERE `name` = 'widnows_app_api_key'
LIMIT 1;
```

Dùng kết quả làm `NUXT_BACKEND_SERVER_KEY` trong `client/.env`. Không đưa giá trị này vào tài liệu hoặc commit.

### 4.5. Sinh secret local

Windows PowerShell:

```powershell
[Convert]::ToHexString(
  [Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
).ToLower()
```

macOS:

```bash
openssl rand -hex 32
```

Sinh hai chuỗi riêng cho:

- `REALTIME_SECRET`.
- `NUXT_SCRIPTS_PROXY_SECRET`.

## 5. Full-stack local trên Windows

Ví dụ đặt repository tại:

```text
C:\laragon\www\demo.vnseea
```

### 5.1. Cấu hình Laragon

1. Chọn Nginx, PHP 8.2/8.3 và MySQL/MariaDB trong Laragon.
2. Bật các PHP extension đã liệt kê ở phần yêu cầu.
3. Kiểm tra file PHP thực sự được dùng:

```powershell
php --ini
php -m
```

4. Cài dependency PHP tại thư mục gốc:

```powershell
composer install
```

### 5.2. Cấu hình hostname

Laragon thường tự tạo virtual host `.test`. Nếu chưa có, mở file sau với quyền Administrator:

```text
C:\Windows\System32\drivers\etc\hosts
```

Thêm:

```text
127.0.0.1 demo.vnseea.test
```

### 5.3. Cấu hình Nginx Laragon

Repo có file `laragon.nginx.conf`. Sao chép nội dung file này vào site config của Laragon và sửa toàn bộ đường dẫn `root`/`alias` cho đúng thư mục repository trên máy.

Ví dụ thư mục cấu hình:

```text
C:\laragon\etc\nginx\sites-enabled\demo.vnseea.test.conf
```

Đảm bảo có proxy Socket.IO sau, đặt trước `location /`:

```nginx
location ^~ /socket.io/ {
    proxy_pass http://127.0.0.1:3015;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_buffering off;
}
```

File repo đang dùng:

- Nginx public: port `8080`.
- HTTPS local: port `8443` nếu đã cấu hình certificate.
- Nuxt: `127.0.0.1:3000`.
- Realtime: `127.0.0.1:3015`.
- PHP FastCGI: upstream do Laragon quản lý.

Sau khi sửa, dùng Laragon **Reload Nginx** hoặc **Stop All → Start All**.

### 5.4. Tạo `client/.env` cho full local

```dotenv
NUXT_PUBLIC_API_BASE=/_api
NUXT_BACKEND_API_BASE=http://demo.vnseea.test:8080
NUXT_PUBLIC_BACKEND_WEB_BASE=http://demo.vnseea.test:8080
NUXT_BACKEND_SERVER_KEY=<gia-tri-widnows_app_api_key-trong-db-local>
NUXT_PUBLIC_SITE_URL=http://demo.vnseea.test:8080

NUXT_DEV_HOST=127.0.0.1
NUXT_DEV_PORT=3000
NUXT_ALLOWED_HOSTS=demo.vnseea.test,127.0.0.1,localhost

NUXT_PUBLIC_REALTIME_URL=http://demo.vnseea.test:8080
REALTIME_HOST=127.0.0.1
REALTIME_PORT=3015
REALTIME_INTERNAL_URL=http://127.0.0.1:3015
REALTIME_SECRET=<secret-local-vua-sinh>
REALTIME_CORS_ORIGIN=http://demo.vnseea.test:8080,http://127.0.0.1:3000

NUXT_PUBLIC_SCRIPTS_GOOGLE_MAPS_API_KEY=<key-local-hoac-de-trong>
NUXT_PUBLIC_SCRIPTS_GOOGLE_MAPS_MAP_ID=<map-id-hoac-de-trong>
NUXT_SCRIPTS_PROXY_SECRET=<secret-local-thu-hai>
```

Khi backend trỏ tới host local (`localhost`, `127.0.0.1` hoặc `.test`), `pnpm dev` tự khởi động watchdog cho pool PHP FastCGI `9003-9010`. Watchdog chỉ tạo lại cổng đang ngừng nên không tạo worker trùng với Laragon. Có thể tùy chỉnh bằng các biến sau:

```dotenv
# Tắt watchdog nếu muốn Laragon tự quản lý hoàn toàn.
PHP_UPSTREAM_WATCHDOG=0

# Ghi đè khi Nginx dùng pool cổng khác.
PHP_UPSTREAM_PORTS=9003,9004,9005,9006,9007,9008,9009,9010

# Chỉ cần khai báo nếu php-cgi.exe không có trong PATH.
PHP_CGI_BIN=D:\Duong\src\laragon\bin\php\php-8.3.26-Win32-vs16-x64\php-cgi.exe
PHP_INI_PATH=D:\Duong\src\laragon\bin\php\php-8.3.26-Win32-vs16-x64\php.ini
```

### 5.5. Chạy realtime và Nuxt

Terminal 1:

```powershell
cd C:\laragon\www\demo.vnseea\client
node --env-file=.env realtime\notification-server.mjs
```

Terminal 2:

```powershell
cd C:\laragon\www\demo.vnseea\client
corepack pnpm@10.33.0 dev
```

Mở ứng dụng tại:

```text
http://demo.vnseea.test:8080
```

## 6. Full-stack local trên macOS

Ví dụ repository tại:

```text
/Users/<ten-user>/Desktop/src_duong/demo.vnseea
```

### 6.1. Cài dependency và bật dịch vụ

```bash
brew install php@8.3 mysql nginx composer nvm
brew services start mysql
brew services start php@8.3
brew services start nginx
```

Cài dependency PHP:

```bash
cd /Users/<ten-user>/Desktop/src_duong/demo.vnseea
composer install
```

Kiểm tra PHP-FPM. Homebrew thường lắng nghe tại `127.0.0.1:9000`:

```bash
lsof -nP -iTCP:9000 -sTCP:LISTEN
```

### 6.2. Cấu hình hostname

```bash
sudo sh -c 'printf "\n127.0.0.1 demo.vnseea.test\n" >> /etc/hosts'
```

Chỉ thêm một lần. Kiểm tra trước để tránh tạo nhiều dòng trùng nhau:

```bash
grep demo.vnseea.test /etc/hosts
```

### 6.3. Cấu hình Nginx Homebrew

Xem prefix Nginx:

```bash
brew --prefix nginx
```

Tạo file trong thư mục `servers` của Nginx Homebrew, thường là:

```text
/opt/homebrew/etc/nginx/servers/demo.vnseea.test.conf
```

Máy Intel thường dùng `/usr/local/etc/nginx/servers/`.

Nội dung mẫu dưới đây yêu cầu thay `root` bằng đường dẫn tuyệt đối thật:

```nginx
server {
    listen 8080;
    server_name demo.vnseea.test;

    root /Users/<ten-user>/Desktop/src_duong/demo.vnseea;
    index index.php index.html;
    charset utf-8;
    client_max_body_size 512M;

    location ~ /\. {
        deny all;
    }

    location /upload/ {
        expires 30d;
        try_files $uri =404;
    }

    location /assets/ {
        expires 7d;
        try_files $uri =404;
    }

    location ^~ /socket.io/ {
        proxy_pass http://127.0.0.1:3015;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }

    location ^~ /_nuxt/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }

    location ^~ /_api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }

    location ^~ /api/_nuxt_icon/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }

    location /api {
        rewrite ^/api(/?|)$ /api-v2.php last;
        rewrite ^/api/([^/]+)(/|)$ /api-v2.php?type=$1 last;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $document_root;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }
}
```

Kiểm tra và reload Nginx:

```bash
nginx -t
brew services restart nginx
```

Nếu `nginx -t` không tìm thấy đúng config Homebrew, dùng binary đầy đủ:

```bash
"$(brew --prefix nginx)/bin/nginx" -t
```

### 6.4. Tạo `client/.env`

Dùng cùng nội dung full local ở mục Windows. Các URL đều giữ:

```text
http://demo.vnseea.test:8080
```

Không cần `PHP_CGI_BIN`; PHP-FPM đã chạy qua Homebrew service.

### 6.5. Chạy realtime và Nuxt

Terminal 1:

```bash
cd /Users/<ten-user>/Desktop/src_duong/demo.vnseea/client
node --env-file=.env realtime/notification-server.mjs
```

Terminal 2:

```bash
cd /Users/<ten-user>/Desktop/src_duong/demo.vnseea/client
corepack pnpm@10.33.0 dev
```

Mở:

```text
http://demo.vnseea.test:8080
```

## 7. Kiểm tra hệ thống sau khi chạy

### Realtime

```bash
curl http://127.0.0.1:3015/healthz
```

Kết quả mong đợi:

```json
{"ok":true}
```

### Nuxt trực tiếp

```bash
curl -I http://127.0.0.1:3000
```

### Domain tích hợp

```bash
curl -I http://demo.vnseea.test:8080
```

### PHP API

Request thiếu server key phải trả lỗi JSON của API, không được trả `502`, `504` hoặc HTML lỗi PHP:

```bash
curl -i http://demo.vnseea.test:8080/api/get-site-settings
```

### Kiểm tra port

Windows:

```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :3015
netstat -ano | findstr :8080
```

macOS:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:3015 -sTCP:LISTEN
lsof -nP -iTCP:8080 -sTCP:LISTEN
lsof -nP -iTCP:9000 -sTCP:LISTEN
```

## 8. Các lỗi thường gặp

### `Missing required environment variable`

Kiểm tra `client/.env` có đủ:

- `NUXT_PUBLIC_API_BASE`.
- `NUXT_BACKEND_API_BASE`.
- `NUXT_BACKEND_SERVER_KEY`.
- `NUXT_PUBLIC_SITE_URL`.
- `NUXT_ALLOWED_HOSTS`.

Sau khi sửa `.env`, dừng và chạy lại Nuxt.

### API trả `400`

Kiểm tra:

- `NUXT_BACKEND_SERVER_KEY` có khớp `Wo_Config.widnows_app_api_key` không.
- Database dump đã import đủ chưa.
- `NUXT_BACKEND_API_BASE` có trỏ về backend PHP, không phải port realtime.
- Nginx có rewrite `/api/<endpoint>` sang `api-v2.php?type=<endpoint>` không.

### `502 Bad Gateway`

Một upstream chưa chạy:

- `3000`: Nuxt.
- `3015`: realtime.
- `9000` hoặc `php_upstream`: PHP-FPM/PHP-CGI.

Khởi động đúng dịch vụ rồi reload Nginx.

### `504 Gateway Time-out`

Kiểm tra theo thứ tự:

1. PHP có kết nối được database không.
2. Database có đang lock hoặc query quá lâu không.
3. Nuxt server có đang chờ backend không.
4. PHP error log, Nginx error log và terminal Nuxt.

Không tăng timeout Nginx trước khi xác định upstream nào đang treo.

### WebSocket `/socket.io` thất bại

Kiểm tra:

- `node --env-file=.env realtime/notification-server.mjs` đang chạy.
- `/healthz` trả `{"ok":true}`.
- `REALTIME_SECRET` giống nhau giữa Nuxt, PHP và realtime.
- `REALTIME_CORS_ORIGIN` chứa đúng origin đang mở trên trình duyệt.
- Nginx có `location ^~ /socket.io/` và header `Upgrade`/`Connection`.

### PHP báo thiếu extension

Chạy:

```bash
php -m
php --ini
```

Bật extension trong đúng `php.ini` mà PHP-FPM/Laragon đang dùng, sau đó restart PHP và Nginx.

### Ảnh hoặc video trả `404`

- Repository không chứa đầy đủ `upload/`.
- Kiểm tra đã lấy media local được phép sử dụng chưa.
- Kiểm tra `root`, `location /upload/` và `NUXT_PUBLIC_BACKEND_WEB_BASE`.

### Đăng nhập lặp lại hoặc mất session

Dùng nhất quán một hostname. Không mở xen kẽ:

- `localhost`.
- `127.0.0.1`.
- `demo.vnseea.test`.

Với full-stack, luôn mở `http://demo.vnseea.test:8080` để cookie cùng origin.

### Google Maps không hoạt động

Google Maps local cần browser key cho phép hostname `demo.vnseea.test` hoặc `localhost`. Không đưa key production không giới hạn vào `.env` local.

## 9. Dừng dịch vụ

Nuxt và realtime: nhấn `Ctrl+C` tại hai terminal.

Windows: dùng **Stop All** trong Laragon.

macOS:

```bash
brew services stop nginx
brew services stop php@8.3
brew services stop mysql
```

## 10. Checklist trước khi bắt đầu phát triển

- [ ] Node và pnpm đúng phiên bản.
- [ ] `corepack pnpm@10.33.0 install --frozen-lockfile` thành công.
- [ ] `config.php` tồn tại nhưng không được Git track.
- [ ] Database local đã import và chạy migration cần thiết.
- [ ] `NUXT_BACKEND_SERVER_KEY` khớp database local hoặc backend dev.
- [ ] `REALTIME_SECRET` khớp ở tất cả process liên quan.
- [ ] PHP, MySQL, Nuxt và realtime đều đang lắng nghe đúng port.
- [ ] `curl /healthz` trả `{"ok":true}`.
- [ ] Truy cập ứng dụng bằng một hostname nhất quán.
- [ ] Không sử dụng secret hoặc dữ liệu production trái phép.
