English description: Test cases for the messages bounded context, covering the three-pane inbox layout and tab-based conversation filtering.

# Test Case Messages

## Pham vi

- Context: `client/src/messages`
- Route chinh: `/messages`
- Muc tieu: layout giong `themes/wowonder/layout/messages/content.phtml`

## Chuan bi

- Viewport: Desktop `1440x900`, Mobile `390x844`
- Dang nhap bang tai khoan co session PHP hop le
- Co du lieu hoi thoai user/group/page de backend `/_api/messages/*` tra ve

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `MSG-001` | Desktop `1440x900` | `/messages` | Mo trang messages | Co 3 vung ro rang: cot trai search/tabs/list, cot giua conversation, cot phai info panel. |
| `MSG-002` | Desktop `1440x900` | `/messages` | Chuyen tab `multi`, `user`, `group` | `multi` hien danh sach nguoi nhan user tu inbox API va form gui nhieu o cot giua, `user` gom ca user/page chat, `group` chi hien group chat. |
| `MSG-003` | Desktop `1440x900` | `/messages` | Tim kiem trong inbox | Search loc danh sach ben trai theo ten/preview tu backend, khong lam vo layout cot giua/phai. |
| `MSG-004` | Desktop `1440x900` | `/messages` | Chon 1 user chat | Thread duoc tai tu `/_api/messages/thread`, header/chat/info panel cap nhat dung theo contact da chon. |
| `MSG-005` | Desktop `1440x900` | `/messages` | Gui mot tin nhan moi | Composer goi `/_api/messages/send`, tin nhan moi xuat hien trong thread va preview ben trai duoc refresh. |
| `MSG-005A` | Desktop `1440x900` | `/messages?tab=multi` | Chon nhieu user, nhap noi dung roi gui | Form goi `/_api/messages/multi`, backend dung flow `messages&s=multi_send`, hien trang thai thanh cong/partial/error dung theo phan hoi PHP. |
| `MSG-006` | Desktop `1440x900` | `/messages` | Bam `Load older messages` trong 1 thread co lich su | Danh sach tin nhan goi lai thread voi `beforeId`, message cu duoc chen len dau ma khong trung id. |
| `MSG-007` | Mobile `390x844` | `/messages` | Mo route va chon contact | Panel thong tin chuyen thanh inline/secondary flow, khong ep 3 cot ngang. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
