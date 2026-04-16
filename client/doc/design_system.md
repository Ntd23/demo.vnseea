# Hướng Dẫn Design System — VNSEEA

> File token gốc: `app/assets/css/tokens.css`  
> Mọi component **phải dùng token**, **KHÔNG hardcode** màu sắc, font size, shadow.

---

## 1. Font chữ

### Chọn font nào?

| Token | Font | Khi nào dùng |
|-------|------|-------------|
| `var(--font-primary)` | **Inter** | Mọi text thông thường: nội dung, nút, input, caption |
| `var(--font-secondary)` | **Be Vietnam Pro** | Tiêu đề lớn, heading nổi bật, display |
| `var(--font-mono)` | JetBrains Mono | Code block (hiếm dùng) |

**Tại sao font này?**
- **Inter**: Font UI chuẩn quốc tế, đọc rõ ở mọi kích thước, hỗ trợ tiếng Việt đầy đủ
- **Be Vietnam Pro**: Font được thiết kế riêng cho tiếng Việt, nét đẹp sang cho heading
- Cả hai đều hoạt động trên iOS (SF Pro fallback) và Android (Roboto fallback)

### Cách dùng

```html
<!-- Tự động áp dụng Inter cho toàn bộ body (đã config trong main.css) -->

<!-- Khi cần heading nổi bật, dùng font-secondary -->
<h1 style="font-family: var(--font-secondary)">Tiêu đề đẹp</h1>

<!-- Hoặc dùng class có sẵn (khuyến nghị) -->
<h1 class="text-display">Tiêu đề display</h1>
<h2 class="text-heading">Tiêu đề section</h2>
```

---

## 2. Màu sắc (Colors)

### 2.1 Primary — Xanh brand `#0000ff`

Dùng cho: nút chính, icon active, link, badge, gradient brand

```css
color: var(--color-primary-500);          /* #0000ff — mặc định */
background: var(--color-primary-50);      /* #eef0ff — hover nhẹ */
background: var(--color-primary-100);     /* #dfe4ff — active */
color: var(--color-primary-600);          /* #0000e6 — hover đậm */
```

| Shade | Hex | Dùng cho |
|-------|-----|----------|
| 50 | `#eef0ff` | Background hover rất nhẹ |
| 100 | `#dfe4ff` | Background active, selected |
| 200 | `#c5caff` | Border active |
| 500 | `#0000ff` | **Màu brand chính** |
| 600 | `#0000e6` | Hover state |
| 700 | `#0000cc` | Active/pressed |
| 900 | `#000080` | Text đậm nhất |

### 2.2 Secondary — Trung tính (slate)

Dùng cho: text, icon phụ, border, nền

```css
color: var(--color-secondary-900);        /* #0f172a — text chính (gần đen) */
color: var(--color-secondary-500);        /* #64748b — text phụ */
color: var(--color-secondary-400);        /* #94a3b8 — text rất nhạt */
background: var(--color-secondary-100);   /* #f1f5f9 — nền muted */
```

### 2.3 Accent — Cam/vàng nổi bật

```css
color: var(--color-accent-500);           /* #f59e0b */
```

### 2.4 Status — Trạng thái

```css
color: var(--color-success);   /* #10b981 — online, thành công */
color: var(--color-warning);   /* #f59e0b — cảnh báo */
color: var(--color-error);     /* #ef4444 — lỗi, xóa, badge đỏ */
color: var(--color-info);      /* #3b82f6 — thông tin */
```

---

## 3. Typography (Kiểu chữ)

### 3.1 Sơ đồ phân cấp

```
display      28px  ExtraBold   →  Hero, con số lớn, tiêu đề trang
  heading    20px  Bold        →  Tiêu đề section, panel
    title    15px  Bold/Semi   →  Tên người, tiêu đề card
      body   14px  Regular     →  Nội dung chính
        caption 12px Med/Reg   →  Thời gian, metadata
          label  11px Bold     →  Badge, tag, uppercase
```

### 3.2 Bảng class đầy đủ

Mỗi cấp có 2 biến thể:
- **primary** = đậm, rõ ràng (dùng cho thông tin quan trọng)
- **secondary** = nhạt, phụ (dùng cho thông tin bổ sung)

| Class | Size | Weight | Màu | Ví dụ |
|-------|------|--------|-----|-------|
| `text-display` | 28px | 800 | — | Số liệu: "128 bạn bè" |
| `text-heading` | 20px | 700 | — | "Bảng tin của bạn" |
| `text-title-primary` | 15px | 700 | đen | Tên: "Nguyễn Văn A" |
| `text-title-secondary` | 15px | 600 | xám | Role: "Frontend Dev" |
| `text-body-primary` | 14px | 400 | đen | Nội dung post |
| `text-body-secondary` | 14px | 400 | xám | Mô tả, placeholder |
| `text-caption-primary` | 12px | 500 | đen | "12 phút trước" (đậm) |
| `text-caption-secondary` | 12px | 400 | xám | "12 phút trước" (nhạt) |
| `text-label-primary` | 11px | 700 | đen | Badge: "ADMIN" |
| `text-label-secondary` | 11px | 600 | xám nhạt | Badge: "MEMBER" |
| `text-brand` | — | — | xanh | "Theo dõi" |
| `text-link` | — | — | xanh | Link có hover underline |

### 3.3 Ví dụ thực tế

```html
<!-- Post header -->
<div>
  <p class="text-title-primary">Nguyễn Văn A</p>
  <div class="flex items-center gap-1">
    <span class="text-caption-secondary">Community Lead</span>
    <span class="text-caption-secondary">•</span>
    <span class="text-caption-secondary">12 phút trước</span>
  </div>
</div>

<!-- Post body -->
<p class="text-body-primary">Hôm nay team đã chốt hướng UI mới...</p>

<!-- Stats -->
<span class="text-caption-secondary">124 yêu thích</span>

<!-- Tag -->
<span class="text-label-secondary">MIGRATION</span>

<!-- Link / action -->
<button class="text-brand">Theo dõi</button>
<a class="text-link" href="#">Xem thêm</a>
```

---

## 4. Icons

### 4.1 Kích thước

| Class | Size | Dùng cho |
|-------|------|----------|
| `icon-xs` | 14px | Inline metadata (privacy icon, dot) |
| `icon-sm` | 16px | Button nhỏ, caption |
| `icon-md` | 20px | **Mặc định** — nav, action button |
| `icon-lg` | 24px | Header, toolbar |
| `icon-xl` | 32px | Feature icon, empty state |

### 4.2 Màu sắc

| Class | Màu | Dùng cho |
|-------|------|----------|
| `icon-primary` | `#334155` đậm | Icon chính: sidebar, nav, action |
| `icon-secondary` | `#94a3b8` nhạt | Icon phụ: meta, placeholder |
| `icon-brand` | `#0000ff` xanh | Icon active, selected tab |
| `icon-inverse` | `#ffffff` trắng | Icon trên nền xanh/tối |
| `icon-danger` | `#ef4444` đỏ | Icon xóa, cảnh báo |

### 4.3 Ví dụ

```html
<!-- Sidebar nav item -->
<Icon name="i-ph-house-simple" class="icon-md icon-primary" />

<!-- Active nav item -->
<Icon name="i-ph-house-simple-fill" class="icon-md icon-brand" />

<!-- Meta info nhạt -->
<Icon name="i-ph-globe-simple" class="icon-xs icon-secondary" />

<!-- Header trên nền xanh -->
<Icon name="i-ph-bell-fill" class="icon-lg icon-inverse" />

<!-- Nút xóa -->
<Icon name="i-ph-trash" class="icon-sm icon-danger" />
```

### 4.4 Chọn icon nào?

Dự án dùng **Phosphor Icons** (`i-ph-*`). Quy tắc:

- **Nav / sidebar**: dùng outline (`i-ph-house-simple`)
- **Active / selected**: dùng fill (`i-ph-house-simple-fill`)
- **Action button**: dùng outline hoặc bold
- **Không mix** icon set khác nhau trong cùng 1 section

---

## 5. Nút bấm (Buttons)

### 3 loại

```html
<!-- Primary: hành động chính — nổi bật nhất -->
<button class="btn-primary">Chia sẻ</button>
<button class="btn-primary">Đăng nhập</button>
<button class="btn-primary">Gửi</button>

<!-- Secondary: hành động phụ — viền outline -->
<button class="btn-secondary">Hủy</button>
<button class="btn-secondary">Chỉnh sửa</button>

<!-- Ghost: hành động nhẹ — không viền -->
<button class="btn-ghost">Xem thêm</button>
<button class="btn-ghost">Bỏ qua</button>
```

| Class | Background | Viền | Dùng khi |
|-------|-----------|------|----------|
| `btn-primary` | Xanh `#0000ff` | Không | Hành động chính (1 cái/section) |
| `btn-secondary` | Trong suốt | Viền xanh nhạt | Hành động phụ |
| `btn-ghost` | Trong suốt | Không | Text-only action |

---

## 6. Avatar

```html
<!-- Kích thước -->
<div class="avatar-sm avatar-brand">VN</div>   <!-- 32px -->
<div class="avatar-md avatar-brand">VN</div>   <!-- 40px — mặc định -->
<div class="avatar-lg avatar-muted">AB</div>   <!-- 48px -->
<div class="avatar-xl avatar-brand">VN</div>   <!-- 64px -->

<!-- Kiểu -->
<div class="avatar-md avatar-brand">VN</div>   <!-- Nền xanh, chữ trắng -->
<div class="avatar-md avatar-muted">AB</div>   <!-- Nền xám, chữ xám đậm -->
```

| Class | Khi nào |
|-------|---------|
| `avatar-brand` | Avatar user chính, publisher, header |
| `avatar-muted` | Avatar comment, contact list, người khác |

---

## 7. Card & Surface

```html
<div class="surface-card">
  <!-- Card trắng, viền nhẹ, shadow — cho post, widget -->
</div>

<div class="surface-card-hover">
  <!-- Như trên + shadow lớn hơn khi hover -->
</div>

<div class="surface-brand">
  <!-- Nền xanh brand, chữ trắng — cho CTA, banner -->
</div>

<div class="surface-muted">
  <!-- Nền xám nhẹ — cho section phụ, input background -->
</div>
```

---

## 8. CSS Variables — cho style tùy chỉnh

Khi class có sẵn chưa đủ, dùng CSS variable trực tiếp:

```css
/* Ví dụ: tạo component tùy chỉnh */
.my-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);       /* 24px */
  box-shadow: var(--shadow-md);
  padding: var(--space-4);               /* 16px */
  transition: all var(--duration-normal) var(--ease-default);
}

.my-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--border-strong);
}

.my-badge {
  background: var(--color-primary-50);
  color: var(--color-primary-500);
  font-size: var(--text-label);
  font-weight: var(--weight-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}
```

### Bảng tham khảo nhanh

| Nhóm | Token | Giá trị |
|------|-------|---------|
| **Nền** | `--bg-base` | `#f1f4fb` (nền trang) |
| | `--bg-surface` | `#ffffff` (nền card) |
| | `--bg-surface-hover` | `#f7f9ff` |
| | `--bg-surface-active` | `#edf1ff` |
| | `--bg-brand` | `#0000ff` |
| **Viền** | `--border-light` | `rgba(0,0,255,0.08)` |
| | `--border-default` | `rgba(0,0,255,0.12)` |
| | `--border-strong` | `rgba(0,0,255,0.20)` |
| **Bo góc** | `--radius-sm` | 8px |
| | `--radius-md` | 14px |
| | `--radius-lg` | 18px |
| | `--radius-xl` | 24px |
| | `--radius-full` | 9999px (tròn) |
| **Shadow** | `--shadow-sm` | Nhẹ nhất |
| | `--shadow-md` | Trung bình (card) |
| | `--shadow-lg` | Lớn (hover) |
| | `--shadow-xl` | Modal, dropdown |
| | `--shadow-brand` | Nút xanh nổi |
| **Spacing** | `--space-1` → `--space-12` | 4px → 48px |

---

## 9. Quy tắc bắt buộc

### ✅ NÊN

```html
<!-- Dùng class token -->
<p class="text-body-primary">Nội dung</p>
<Icon name="i-ph-house" class="icon-md icon-primary" />
<button class="btn-primary">Gửi</button>

<!-- Dùng CSS variable -->
<div style="color: var(--text-secondary)">Phụ đề</div>
```

### ❌ KHÔNG ĐƯỢC

```html
<!-- Hardcode màu -->
<p style="color: #64748b">Phụ đề</p>           <!-- SAI -->
<p style="color: var(--text-secondary)">Phụ đề</p>  <!-- ĐÚNG -->

<!-- Hardcode font size -->
<p style="font-size: 14px">Text</p>             <!-- SAI -->
<p class="text-body-primary">Text</p>           <!-- ĐÚNG -->

<!-- Hardcode shadow -->
<div style="box-shadow: 0 4px 20px rgba(0,0,255,0.06)"> <!-- SAI -->
<div style="box-shadow: var(--shadow-md)">               <!-- ĐÚNG -->
```

### Checklist khi review code

- [ ] Font có dùng `--font-primary` hoặc `--font-secondary` không?
- [ ] Màu text có dùng token `--text-*` không?
- [ ] Icon có dùng class `icon-*` không?
- [ ] Shadow có dùng `--shadow-*` không?
- [ ] Border radius có dùng `--radius-*` không?
- [ ] Có hardcode hex color nào không?
