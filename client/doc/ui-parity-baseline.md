# UI Parity Baseline

Tài liệu này là source of truth cho việc khôi phục UI parity sau đợt refactor DDD.

## Baseline source

- Source of truth chính cho UI parity hiện tại là `origin/hoang`.
- Chỉ dùng các commit như `8ce8ec16` hoặc `5d0da527` để tra cứu thêm khi `origin/hoang` thiếu file hoặc thiếu route tương ứng.
- Không dùng runtime hiện tại hoặc các commit DDD mới làm baseline thị giác.

## Baseline rules

- Không dùng runtime hiện tại làm chuẩn UI.
- Không “cải tiến” layout hoặc visual nếu chưa đối chiếu baseline.
- Khi baseline và runtime khác nhau, ưu tiên khôi phục:
  - structure HTML
  - spacing
  - typography hierarchy
  - component order
  - sidebar widths
  - empty/loading states
- DDD chỉ giữ cho `domain / application / infrastructure`.
- Mọi thay đổi parity phải xảy ra ở `presentation/pages/*` và `presentation/components/*`.

## Route parity priority

### P0

- `/welcome`
- `/register`
- `/home`
- `/@username`
- `/messages`

### P1

- `/products`
- `/groups`
- `/blogs`
- `/search`
- `/checkout`

### P2

- `/events`
- `/funding`
- `/jobs`
- `/watch`
- `/photos`
- `/reels`

## Drift taxonomy

Mỗi route hoặc component phải được gắn tối thiểu 1 loại drift:

- `visual-drift`
- `hierarchy-drift`
- `interaction-drift`
- `responsive-drift`
- `token-drift`

## Audit matrix

| Route | Shell/Layout | Shared UI | Page Composition | Drift | Status | Notes |
|---|---|---|---|---|---|---|
| `/welcome` | pending | pending | pending | pending | audit-needed | Guest shell + auth form parity |
| `/register` | pending | pending | pending | pending | audit-needed | Guest shell + auth form parity |
| `/home` | pending | pending | pending | pending | audit-needed | Header, sidebars, publisher, feed |
| `/@username` | pending | pending | pending | pending | audit-needed | Profile hero, tabs, feed |
| `/messages` | pending | pending | pending | pending | audit-needed | Messages layout and side panel |
| `/products` | pending | pending | pending | pending | audit-needed | Marketplace card/list parity |
| `/groups` | pending | pending | pending | pending | audit-needed | Community listing and group cards |
| `/blogs` | pending | pending | pending | pending | audit-needed | Blog listing cards |
| `/search` | pending | pending | pending | pending | audit-needed | Search shell, filters, results |

## Shared presentation priority

Khôi phục theo thứ tự:

1. `navigation`
2. `foundation`
3. `forms`
4. `feed`
5. `lightbox`
6. `auth guest shell`

## Acceptance

Một route chỉ được đánh dấu `matched` khi:

- Desktop parity đạt gần 1:1
- Mobile parity không có drift rõ
- Shared shell đúng baseline
- Không thay đổi contract của `application/domain`
- `npm run build` pass sau khi sửa nhóm route liên quan
