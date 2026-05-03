English description: Test cases for the lightbox bounded context, covering media viewing, keyboard navigation, thumbnails, and action controls.

# Test Case Lightbox

## Pham vi

- Context: `client/src/lightbox`
- Man hinh su dung:
  - `/photos`
  - feed/gallery screens co mo `LightboxModal`
- Muc tieu: viewer phai media-first, thong tin va action nam o side panel, dieu huong giong nhom PHP lightbox

## Case

| ID | Man hinh | Route/screen | Cach test | Ky vong |
| --- | --- | --- | --- | --- |
| `LIGHTBOX-001` | Desktop `1440x900` | Gallery trong `/photos` | Mo 1 image | Viewer mo tren nen toi, media la noi dung chinh, side panel hien title/author/caption/actions. |
| `LIGHTBOX-002` | Desktop `1440x900` | Gallery trong `/photos` | Dung nut trai/phai va phim `ArrowLeft` `ArrowRight` | Item hien tai doi dung, counter cap nhat dung. |
| `LIGHTBOX-003` | Desktop `1440x900` | Gallery trong `/photos` | Click thumbnail trong side panel | Lightbox nhay dung item thumbnail da chon. |
| `LIGHTBOX-004` | Mobile `390x844` | Gallery trong `/photos` | Mo lightbox | Viewer va side info stack doc, action van bam duoc, media khong bi crop vo nghia. |
| `LIGHTBOX-005` | Desktop `1440x900` | Gallery co video | Mo item video | Video render bang player, label media type hien `video`, action shell khong bi vo. |

## Lenh kiem tra

```powershell
cd client
npm run build
```
