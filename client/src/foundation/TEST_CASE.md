English description: Test cases for foundation UI primitives used by API-connected pages.

# Test Case Foundation

## Pham vi

- Owner: Dev 1
- Context: `client/src/foundation`
- Day la context shared UI primitive, khong goi backend truc tiep.

## Cases

| ID | Status | Man hinh | Case | Cach test | Ky vong |
| --- | --- | --- | --- | --- | --- |
| `FOUNDATION-001` | `[ ]` | Desktop `1440x900`, routes `/search`, `/home`, `/setting` | Empty state | Mo search/feed/settings khi khong co data | Empty copy va icon render on, khong lam lech layout. |
| `FOUNDATION-002` | `[ ]` | Desktop `1440x900` va Mobile `390x844`, page co API | Loading skeleton | Lam API cham hoac reload page API | Skeleton giu cho, khong hien fake data. |
| `FOUNDATION-003` | `[ ]` | Mobile `390x844`, route `/home`, mobile drawer | Modal/drawer shell | Test mobile menu/modal tren desktop va mobile | Focus, close, scroll lock hoat dong dung. |
| `FOUNDATION-004` | `[ ]` | Desktop `1440x900`, Tablet `768x1024`, Mobile `390x844` | Responsive container | Test cac page shell chinh | Width/padding khop UI guide, khong overflow ngang. |

## Test Bang Postman: PHP API -> Nuxt Bridge

Context `foundation` khong co API rieng nen khong test Postman truc tiep. Dung Postman de tao/doi chieu cac trang thai data tu PHP API goc va Nuxt bridge, sau do kiem tra UI state.

| Trang thai can test | PHP raw endpoint | Nuxt bridge endpoint | Ky vong tren UI |
| --- | --- | --- | --- |
| Empty state | `POST {{backend_url}}/api/search` voi keyword khong ton tai | `GET {{nuxt_url}}/_api/search?q=keyword_khong_ton_tai` | UI hien empty state dung style. |
| Backend error | Goi PHP endpoint voi thieu/sai `server_key` de xem error shape | Goi Nuxt endpoint tuong ung | UI hien error state an toan, khong Nuxt error raw. |
| Loading state | Postman chi dung de doi chieu response | Dung Network throttling trong browser | Skeleton khong hien fake data. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
