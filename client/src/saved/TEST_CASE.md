English description: Test cases for the saved bounded context, covering the saved-posts content-first shell and empty states.

# Test Case Saved

## Pham vi

- Context: `client/src/saved`
- Route chinh: `/saved-posts`
- Muc tieu: layout giong `themes/wowonder/layout/saved-posts/content.phtml`

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `SAVED-001` | Desktop `1440x900` | `/saved-posts` | Mo route | Header gon, danh sach saved posts la noi dung chinh, khong con hero/stat dashboard lon. |
| `SAVED-002` | Desktop `1440x900` | `/saved-posts` | Kiem tra empty state | Khi khong co data, empty state nam ngay trong vung content chinh. |
| `SAVED-003` | Mobile `390x844` | `/saved-posts` | Cuon trang | Thu tu section giu nguyen tren mobile, card list stack doc tu tren xuong. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
