English description: Test cases for the photos bounded context, covering media-first gallery layout, album strips, and lightbox entry points.

# Test Case Photos

## Pham vi

- Context: `client/src/photos`
- Route chinh: `/photos`
- Muc tieu: shell phai media-first, album strip nam truoc gallery, lightbox mo dung tu card anh

## Case

| ID | Man hinh | Route | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `PHOTO-001` | Desktop `1440x900` | `/photos` | Mo route | Header gon, filter va album strip nam truoc gallery, gallery la content chinh. |
| `PHOTO-002` | Desktop `1440x900` | `/photos` | Bam mo 1 anh | Lightbox mo dung item da chon, current index dung theo gallery da loc. |
| `PHOTO-003` | Desktop `1440x900` | `/photos` | Dung search/filter roi mo lightbox | Item trong lightbox phai follow danh sach da filter, khong quay lai danh sach goc. |
| `PHOTO-004` | Mobile `390x844` | `/photos` | Cuon trang va mo 1 anh | Album strip, result header va masonry stack dung tren mobile; lightbox van de doc duoc. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
