English description: Test cases for the feed bounded context, covering the home feed shell, content ordering, and story creation flow.

# Test Case Feed

## Pham vi

- Context: `client/src/feed`
- Route chinh: `/home`, `/status/create`
- Muc tieu: thu tu section cua Nuxt phai giong `themes/wowonder/layout/home/content.phtml`

## Chuan bi

- Chay `cd client && npm run dev`
- Test tren Desktop `1440x900` va Mobile `390x844`
- Dang nhap bang 1 tai khoan co du stories va posts mock

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `FEED-001` | Desktop `1440x900` | `/home` | Mo trang home | Thu tu hien thi la `filter row -> stories -> announcement -> publisher -> order control -> greeting -> new posts -> post list -> load more`. |
| `FEED-002` | Mobile `390x844` | `/home` | Cuon tu tren xuong | Cac block van theo dung thu tu PHP, khong nhay sidebar vao giua feed. |
| `FEED-003` | Desktop `1440x900` | `/home` | Kiem tra shell 3 cot | Feed nam o cot giua, sidebar trai/phai van dung shell co san, khong co hero/dashboard lon. |
| `FEED-004` | Desktop `1440x900` | `/home` | Bam nut xem bai moi va load more | Nut dat dung vi tri sau greeting/post list, khong chen vao stories hoac publisher. |
| `FEED-005` | Desktop `1440x900` va Mobile `390x844` | `/status/create` | Mo route tao story/post | Form la upload-first: chon media truoc, preview xuat hien song song, action submit nam cuoi flow. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
