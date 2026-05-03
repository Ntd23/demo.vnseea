English description: Test cases for the popular bounded context, covering ranked post ordering, filters, and sidebar stability.

# Test Case Popular

## Pham vi

- Context: `client/src/popular`
- Route chinh: `/popular`
- Muc tieu: shell phai content-first, nhan manh vao ranked post list giong nhom media/feed

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `POPULAR-001` | Desktop `1440x900` | `/popular` | Mo route | Ranked post list la noi dung chinh, khong co hero marketing qua lon. |
| `POPULAR-002` | Desktop `1440x900` | `/popular` | Dung search/filter | So thu tu va score post cap nhat theo filter, sidebar khong bi day len tren list. |
| `POPULAR-003` | Mobile `390x844` | `/popular` | Cuon trang | Summary, filter, ranked list va sidebar stack dung thu tu mobile. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
