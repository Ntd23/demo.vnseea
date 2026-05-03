English description: Test cases for the poke bounded context, covering the poke list shell, pending state strip, and empty list behavior.

# Test Case Poke

## Pham vi

- Context: `client/src/poke`
- Route chinh: `/poke`
- Muc tieu: layout giong `themes/wowonder/layout/poke/content.phtml`

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `POKE-001` | Desktop `1440x900` | `/poke` | Mo route | Header nam tren cung, list poke la noi dung chinh, pending strip nam truoc danh sach. |
| `POKE-002` | Desktop `1440x900` | `/poke` | Kiem tra khi danh sach rong | Empty state hien trong vung list, khong con hero/dashboard thua. |
| `POKE-003` | Mobile `390x844` | `/poke` | Cuon trang | Header -> pending strip -> list giu dung thu tu khi stack mobile. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
