English description: Test cases for the explore bounded context, covering the content-first discovery shell and hashtag result layouts.

# Test Case Explore

## Pham vi

- Context: `client/src/explore`
- Route chinh: `/explore`, `/hashtag/[tag]`
- Muc tieu: layout giong `themes/wowonder/layout/hashtags/content.phtml` va explore shell content-first

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `EXP-001` | Desktop `1440x900` | `/explore` | Mo route | Trang la content-first discovery shell, khong con hero/dashboard lon chiem man hinh. |
| `EXP-002` | Desktop `1440x900` | `/explore` | Doi view/filter | Cac block posts/users/pages doi theo filter nhung van giu shell content chinh. |
| `EXP-003` | Desktop `1440x900` | `/hashtag/[tag]` | Mo route hashtag | Header hashtag, related tags va post list xuat hien theo thu tu on dinh; empty state hien dung vi tri neu khong co bai. |
| `EXP-004` | Mobile `390x844` | `/explore`, `/hashtag/[tag]` | Cuon trang | Summary cards, related tags va posts stack doc, thu tu khong doi. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
