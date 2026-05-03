English description: Test cases for the memories bounded context, covering the memories header, friendversary block, and posts order.

# Test Case Memories

## Pham vi

- Context: `client/src/memories`
- Route chinh: `/memories`
- Muc tieu: layout giong `themes/wowonder/layout/memories/content.phtml`

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `MEM-001` | Desktop `1440x900` | `/memories` | Mo route | Thu tu la `heading -> friendversary block -> memories posts block`. |
| `MEM-002` | Desktop `1440x900` | `/memories` | Kiem tra khi it du lieu | Neu khong co friendversary hoac post, empty/hint state nam dung trong tung block. |
| `MEM-003` | Mobile `390x844` | `/memories` | Cuon trang | Cac block stack doc, khong dao thu tu so voi PHP. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
