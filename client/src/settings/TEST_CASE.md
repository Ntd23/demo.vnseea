English description: Test cases for the settings bounded context, including current user bootstrap and safe update bridge behavior.

# Test Case Settings

## Pham vi

- Owner: Dev 1
- Context: `client/src/settings`
- Routes:
  - `/setting`
  - `/setting/:page`
- Nuxt API:
  - `GET /_api/settings/me`
  - `POST /_api/settings/update`

## Smoke Test

| ID | Status | Man hinh | Case | Cach test | Ky vong |
| --- | --- | --- | --- | --- | --- |
| `SETTINGS-SMOKE-001` | `[ ]` | Desktop `1440x900`, route `/setting` | Settings index | Login roi vao `/setting` | Page render binh thuong, khong hien email/name mock. |
| `SETTINGS-SMOKE-002` | `[ ]` | Desktop `1440x900`, route `/setting/general` | Settings subpage | Vao `/setting/general` | Active page dung theo route param. |
| `SETTINGS-SMOKE-003` | `[ ]` | Mobile `390x844`, route `/setting/profile` | Hard reload | Hard reload `/setting/profile` | Khong loi Nuxt, khong hien HTML tho/unstyled. |

## API

| ID | Status | Man hinh | Case | Cach test | Ky vong |
| --- | --- | --- | --- | --- | --- |
| `SETTINGS-API-001` | `[ ]` | Browser Network, route `/setting` | Lay current settings | Mo `GET /_api/settings/me` khi da login | Tra field user tu PHP session hien tai. |
| `SETTINGS-API-002` | `[ ]` | Postman/API hoac browser Network | Thieu session | Xoa cookie `user_id`, goi `GET /_api/settings/me` | Tra `401`, khong tra du lieu gia. |
| `SETTINGS-API-003` | `[ ]` | Postman/API, doi chieu voi UI `/setting/general` | Update field hop le | Goi `POST /_api/settings/update` voi field trong allowlist | Chi field hop le duoc forward sang backend. |
| `SETTINGS-API-004` | `[ ]` | Postman/API | Update payload rong | Goi `POST /_api/settings/update` voi `{}` | Tra `422`. |

## Test Bang Postman: PHP API -> Nuxt Bridge

Can copy cookie `user_id` tu browser vao Postman de test settings endpoints.

Postman environment:

| Key | Value |
| --- | --- |
| `backend_url` | `https://demo.vnseea.test:8443` |
| `nuxt_url` | `https://demo.vnseea.test:8443` |
| `backend_server_key` | Lay tu `NUXT_BACKEND_SERVER_KEY`. |
| `user_id` | Gia tri cookie `user_id` sau khi login. |

| ID | Man hinh | Layer | Method | URL | Body/Cookie | Ky vong |
| --- | --- | --- | --- | --- | --- | --- |
| `SETTINGS-PHP-001` | Postman/API, doi chieu UI `/setting` | PHP | `POST` | `{{backend_url}}/api/get-user-data` | `server_key`, `user_id={{user_id}}`, `fetch=user_data` | PHP tra `user_data.user_id`, `name`, `username`, `email`, `phone_number`, `gender`, `birthday`. |
| `SETTINGS-NUXT-001` | Postman/API, doi chieu UI `/setting` | Nuxt | `GET` | `{{nuxt_url}}/_api/settings/me` | Cookie `user_id` | Nuxt map thanh `id`, `name`, `username`, `email`, `phone`, `gender`, `birthday`. |
| `SETTINGS-PHP-002` | Postman/API, doi chieu UI `/setting/general` | PHP | `POST` | `{{backend_url}}/api/update-user-data` | `server_key`, field update hop le | PHP tra `api_status` success hoac `errors.error_text`. |
| `SETTINGS-NUXT-002` | Postman/API, doi chieu UI `/setting/general` | Nuxt | `POST` | `{{nuxt_url}}/_api/settings/update` | JSON `{ "about": "Updated from Postman" }`, cookie `user_id` | Nuxt tra `success: true`, `status`, `message` neu PHP update thanh cong. |
| `SETTINGS-NUXT-003` | Postman/API | Nuxt | `POST` | `{{nuxt_url}}/_api/settings/update` | JSON `{ "unsupported_key": "value" }` | Nuxt tra `422` truoc khi goi PHP vi field khong nam trong allowlist. |

## Trang thai coverage

- `[x] done` Settings bootstrap lay user that tu backend.
- `[~] partial` Save action theo tung page settings van can noi sau theo form cu the.

## Lenh kiem tra

```powershell
cd client
npm run build
```
