English description: Test cases for the reels bounded context, covering the fullscreen reel viewer and stacked reel navigation behavior.

# Test Case Reels

## Pham vi

- Context: `client/src/reels`
- Route chinh: `/reels`
- Muc tieu: shell phai toi gian, fullscreen, co stacked navigation nhu `themes/wowonder/layout/reels/content.phtml`

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `REEL-001` | Desktop `1440x900` | `/reels` | Mo route | Reel viewer chiem trung tam man hinh, khong co hero/dashboard ngoai viewer. |
| `REEL-002` | Desktop `1440x900` | `/reels` | Dung next/prev va click item ben phai | Reel active doi dung, side stack highlight dung item hien tai. |
| `REEL-003` | Mobile `390x844` | `/reels` | Swipe len/xuong | Swipe doi reel dung chieu, viewer van fullscreen va khong vo layout. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
