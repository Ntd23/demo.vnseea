English description: Test cases for the profile bounded context, covering profile hero order, tab body rendering, and owner versus visitor states.

# Test Case Profile

## Pham vi

- Context: `client/src/profile`
- Route chinh: `/@username`
- Muc tieu: thu tu shell phai giong `timeline/content.phtml` va `mode_instagram/profile/content.phtml`

## Chuan bi

- Test 2 user:
  - owner profile
  - visitor profile
- Viewport: Desktop `1440x900`, Tablet `1024x768`, Mobile `390x844`

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `PROFILE-001` | Desktop `1440x900` | `/@username` | Mo profile owner | Thu tu hien thi la `cover -> avatar/action cluster -> bottom tab nav -> tab body`. |
| `PROFILE-002` | Desktop `1440x900` | `/@username` | O tab timeline cua owner | Chi owner moi thay completion/publisher block o timeline tab. |
| `PROFILE-003` | Desktop `1440x900` | `/@username` | Mo cung profile bang tai khoan visitor | Visitor khong thay owner-only actions, nhung van giu nguyen layout hero va tabs. |
| `PROFILE-004` | Mobile `390x844` | `/@username` | Doi qua cac tab | Tab nav van nam ngay sau hero, body doi dung theo tab, khong co section timeline chen sai thu tu. |
| `PROFILE-005` | Desktop `1440x900` | `/@username` | Refresh SSR/client | Title va description route duoc tao dung theo username, khong loi locale key. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
