English description: Test cases for the community bounded context, covering group and page directory routes, detail pages, creation forms, and settings layouts.

# Test Case Community

## Pham vi

- Context: `client/src/community`
- Route chinh:
  - `/groups`, `/suggested-groups`, `/joined_groups`
  - `/pages`, `/suggested-pages`, `/liked-pages`
  - `/g/[name]`, `/p/[name]`
  - `/create-group`, `/create-page`
  - `/group-setting/[group]`, `/page-setting/[page]`
- Muc tieu: thu tu section va shell giong cac file `themes/wowonder/layout/group/*`, `page/*`, `group-setting/*`, `page-setting/*`

## Chuan bi

- Viewport: Desktop `1440x900`, Mobile `390x844`
- Can test ca owner va visitor cho detail/settings page

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `COMM-001` | Desktop `1440x900` | `/groups` va `/pages` | Mo tung directory route | Trang la list-first shell, khong con dashboard/marketing hero lon, danh sach card la noi dung chinh. |
| `COMM-002` | Desktop `1440x900` | `/g/[name]` | Mo group detail | Thu tu la `cover/hero -> tabs/action row -> main feed left -> info/sidebar right`. |
| `COMM-003` | Desktop `1440x900` | `/p/[name]` | Mo page detail | Thu tu la `cover/hero -> tabs/action row -> main feed left -> info/sidebar right`, CTA va action nam trong hero/action area. |
| `COMM-004` | Desktop `1440x900` | `/create-group` | Mo form tao group | Heading nam truoc, field order la `name -> url -> description -> privacy -> category -> action`, khong chen section sai thu tu. |
| `COMM-005` | Desktop `1440x900` | `/create-page` | Mo form tao page | Heading nam truoc, field order la `name -> url -> category -> description -> location -> action`, shell khong con card hero marketing. |
| `COMM-006` | Desktop `1440x900` | `/group-setting/[group]` | Mo settings group bang owner | Co nav settings rieng o ben trai, pane noi dung o giua, preview/sidebar o ben phai. |
| `COMM-007` | Desktop `1440x900` | `/page-setting/[page]` | Mo settings page bang owner | Co nav settings rieng o ben trai, pane noi dung o giua, preview/sidebar o ben phai. |
| `COMM-008` | Mobile `390x844` | `/create-group`, `/create-page`, settings routes | Cuon tu tren xuong | Section van theo dung thu tu PHP sau khi stack mobile, nav settings khong vo flow form. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
