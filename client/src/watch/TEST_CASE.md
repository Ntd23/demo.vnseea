English description: Test cases for the watch bounded context, covering the watch player shell and related content ordering.

# Test Case Watch

## Pham vi

- Context: `client/src/watch`
- Route chinh: `/watch`
- Muc tieu: layout giong `themes/wowonder/layout/watch/content.phtml`

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `WATCH-001` | Desktop `1440x900` | `/watch` | Mo route | Player va thong tin video la noi dung chinh, related list nam dung thu tu sau player/info. |
| `WATCH-002` | Desktop `1440x900` | `/watch` | Kiem tra comments/related order | Comment block va danh sach lien quan khong vuot len tren player. |
| `WATCH-003` | Mobile `390x844` | `/watch` | Cuon trang | Player -> info -> comments -> related stack dung thu tu tren mobile. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
