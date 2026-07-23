<!-- English description: Records the deferred dark mode architecture, migration plan, implementation steps, and QA checklist for the Nuxt frontend. -->

# Ke hoach trien khai Dark Mode

## Trang thai

- Trang thai: **Tam hoan**.
- Ly do: Chua co thiet ke dark mode chinh thuc.
- Ngay ghi nhan: 2026-07-23.
- Khong trien khai dark mode cho den khi co bang mau, mockup hoac quy tac giao dien duoc duyet.
- Viec doi brand tu xanh sang do la mot task rieng, khong duoc xem la dark mode.

## Quyet dinh da thong nhat

- Dung `UColorModeSwitch` cua Nuxt UI de chuyen giua light va dark.
- Dat switch canh phan doi ngon ngu trong:
  - `src/navigation/presentation/components/HeaderUserMenu.vue`
  - `src/navigation/presentation/components/MobileMenu.vue`
- Khong dung dong thoi `UColorModeButton`, `UColorModeSelect` va `UColorModeSwitch` trong cung menu.
- Dark mode dung nen trung tinh toi; mau do chi dung cho brand, CTA, link va trang thai active.
- Khong tao mot bo CSS dark rieng trong tung component neu component co the dung semantic token.
- Khong sua file sinh tu dong trong `.nuxt/`, `.output/` hoac `node_modules/`.
- Dark mode la thay doi frontend, khong can sua API PHP.

## Thiet ke can co truoc khi bat dau

Can chot cac gia tri sau:

- Nen trang toi.
- Nen card, modal, dropdown va input.
- Nen hover va active.
- Mau chu primary, secondary va disabled.
- Mau vien thuong, vien focus va divider.
- Shadow tren nen toi.
- Mau brand do tren nen toi va mau hover cua no.
- Mau link co du do tuong phan.
- Logo, anh placeholder va illustration co can phien ban dark hay khong.
- Cach hien thi cua map, chart, video player va rich text editor.

Khong nen tu suy doan cac gia tri nay trong luc code. Bang mau trong phan sau chi la cau truc token, khong phai thiet ke cuoi cung.

## Cac diem dang khoa Light Mode

Truoc khi dark mode co the hoat dong, can xu ly cac diem sau:

1. `nuxt.config.ts`
   - `colorMode.preference` dang la `light`.
   - `colorMode.fallback` dang la `light`.
   - Can chot mac dinh la `light` hay `system` truoc khi sua.

2. `app/plugins/force-light-mode.client.ts`
   - Dang ep `preference`, `value`, class HTML va local storage ve `light`.
   - Khi trien khai dark mode, xoa plugin nay hoac thay bang khoi tao khong ghi de lua chon cua user.

3. `app/plugins/force-light-mode.server.ts`
   - Dang ep cookie va SSR HTML ve `light`.
   - Khi trien khai dark mode, xoa plugin nay hoac de module color mode tu xu ly cookie.

4. `app/assets/css/main.css`
   - `html.dark` dang dung `color-scheme: light`.
   - Can doi thanh `color-scheme: dark`.

5. Cac component khoa `color-scheme: light` rieng:
   - `src/feed/presentation/components/CommentItem.vue`
     - `.comment-item__audio-player`
   - `src/feed/presentation/components/CommentComposer.vue`
     - `.comment-composer__audio-preview`
   - Nen bo thuoc tinh hoac doi thanh `color-scheme: inherit`.

## Kien truc token muc tieu

Light va dark phai cung dung mot bo ten semantic token. Component khong can biet theme hien tai.

```css
:root {
  --bg-base: /* light page background */;
  --bg-surface: /* light card background */;
  --bg-muted: /* light muted background */;
  --bg-surface-hover: /* light hover */;
  --bg-surface-active: /* light active */;

  --text-primary: /* light primary text */;
  --text-secondary: /* light secondary text */;
  --text-tertiary: /* light tertiary text */;

  --border-light: /* light subtle border */;
  --border-default: /* light normal border */;
  --border-strong: /* light strong border */;
}

.dark {
  --bg-base: /* approved dark page background */;
  --bg-surface: /* approved dark card background */;
  --bg-muted: /* approved dark muted background */;
  --bg-surface-hover: /* approved dark hover */;
  --bg-surface-active: /* approved dark active */;

  --text-primary: /* approved dark primary text */;
  --text-secondary: /* approved dark secondary text */;
  --text-tertiary: /* approved dark tertiary text */;

  --border-light: /* approved dark subtle border */;
  --border-default: /* approved dark normal border */;
  --border-strong: /* approved dark strong border */;
}
```

Brand tokens co the giu nguyen ten va thay doi gia tri theo theme neu thiet ke yeu cau:

```css
--bg-brand;
--bg-brand-hover;
--text-brand;
--text-on-brand-secondary;
--border-on-brand;
--shadow-brand;
```

## Nguyen tac sua component

Component da dung semantic token se tu doi theme, khong can them `.dark` rieng.

Nen dung:

```css
.card {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-default);
}
```

Khong nen dung:

```css
.card {
  background: white;
  color: black;
}

.dark .card {
  background: black;
  color: white;
}
```

Can migrate mot lan cac hardcode sau:

- `bg-white`, `bg-black` neu chung dai dien cho surface.
- `text-black`, `text-white`, `text-slate-*` neu chung dai dien cho noi dung giao dien.
- Hex/RGB cua nen, text, vien, hover va shadow.
- Gradient brand cu.
- Mau focus ring duoc hardcode.

Khong tu dong thay cac mau sau:

- `success`, `warning`, `error`, `info`.
- Mau do user chon cho tag/chat.
- Mau chuoi du lieu trong chart.
- Overlay media can mau den de dam bao do doc.
- Mau cua dich vu ngoai nhu Google Maps.

## Cau hinh Color Mode de xuat

Sau khi bo cac plugin ep light:

```ts
colorMode: {
  preference: "light", // Hoac "system" neu san pham chot theo he dieu hanh.
  fallback: "light",
  storage: "cookie",
  storageKey: "nuxt-color-mode",
  classSuffix: "",
},
```

Cookie duoc giu de SSR va client cung theme, tranh hydration mismatch.

## Vi tri UColorModeSwitch

Vi du cau truc giao dien:

```vue
<div class="theme-setting-row">
  <div>
    <p>{{ $t("navigation.theme.darkMode") }}</p>
    <p>{{ $t("navigation.theme.darkModeDescription") }}</p>
  </div>

  <UColorModeSwitch color="primary" size="md" />
</div>
```

Can them ban dich vao `i18n/locales/vi.json` va `i18n/locales/en.json`.

## Thu tu trien khai

### P1 - Ha tang color mode

- Chot mac dinh `light` hay `system`.
- Bo hai plugin `force-light-mode`.
- Sua `main.css` de `.dark` dung `color-scheme: dark`.
- Bo `color-scheme: light` tai hai audio component.
- Xac nhan cookie theme khong bi ghi de sau reload.

### P2 - Token dark chinh thuc

- Them bang token `.dark` vao `tokens.css` theo thiet ke duoc duyet.
- Kiem tra contrast cho text, button, link, input va disabled state.
- Kiem tra Nuxt UI primary red trong ca hai theme.

### P3 - Dieu khien theme

- Them `UColorModeSwitch` vao `HeaderUserMenu.vue`.
- Them `UColorModeSwitch` vao `MobileMenu.vue`.
- Dat canh dieu khien ngon ngu va tren nut dang xuat.
- Them label/description i18n.

### P4 - Shared shell va component dung chung

- `app.vue` va cac layout.
- Header, sidebar, mobile menu va chat widget.
- Card, modal, dropdown, popover va toast.
- Input, textarea, select, switch, listbox va table.
- Skeleton, empty state va error state.

### P5 - Audit tung bounded context

Uu tien theo tan suat su dung:

1. Feed, post detail, comment, lightbox.
2. Profile, page, group.
3. Messages va chat widget.
4. Products, checkout, orders.
5. Settings, search, notifications.
6. Events, jobs, funding, movies, live, forum va cac context con lai.

Khong tao CSS dark song song trong moi context. Chuyen hardcode ve semantic token truoc.

## Lenh audit

Khong tim trong file sinh tu dong:

```powershell
rg -n --glob '!client/.nuxt/**' --glob '!client/.output/**' --glob '!client/node_modules/**' -- 'color-scheme\s*:\s*light|bg-white|text-black|#[0-9A-Fa-f]{6}|rgba\(' client/app client/src
```

Tim cac cho lien quan truc tiep den color mode:

```powershell
rg -n --glob '!client/.nuxt/**' --glob '!client/node_modules/**' -- 'useColorMode|UColorModeSwitch|html\.dark|color-scheme|force-light-mode' client
```

Khong sua ket qua trong `.nuxt/dev`. Restart dev server de Nuxt sinh lai bundle sau khi source da thay doi.

## Checklist kiem thu

### Chuc nang

- Switch doi light/dark ngay lap tuc.
- Lua chon duoc luu sau hard reload.
- Mo tab moi van dung theme da chon.
- SSR va client khong bi hydration mismatch.
- Dang nhap/dang xuat khong lam mat lua chon theme.
- Desktop va mobile cung mot trang thai theme.

### Giao dien

- Header, sidebar va page background khong chop mau khi load.
- Card khong con nen trang choi tren dark mode.
- Text chinh/phu du contrast.
- Input, dropdown, modal va table khong bi nen trang hardcode.
- Button do van doc ro text trang.
- Hover, focus, selected va disabled deu nhin thay.
- Skeleton va empty state khong qua sang.
- Anh/video khong bi ap filter ngoai y muon.

### Route can smoke test

- `/home`
- Trang chi tiet post va lightbox.
- Profile user, page va group.
- `/messages` va chat widget.
- `/products`, product detail va checkout.
- `/settings`.
- `/search-nearby`.
- `/live`, `/movies`, `/forum`, `/events`.
- Trang guest/auth va runtime error boundary.

### Viewport

- Mobile nho.
- Mobile lon.
- Tablet.
- Desktop.
- Dark mode cua Chrome, Safari iOS va Android WebView neu app co nhung web.

## Dieu kien hoan thanh

- Khong con plugin ep light.
- `UColorModeSwitch` hoat dong tai desktop va mobile menu.
- Theme duoc persist bang cookie.
- Shared shell va tat ca route chinh dung semantic token.
- Khong sua file generated.
- Khong co hydration warning moi.
- Contrast dat muc chap nhan duoc theo thiet ke duoc duyet.
- Co screenshot light/dark cho desktop va mobile cua cac route smoke test.

## Diem tiep tuc lan sau

1. Mo tai lieu nay va xac nhan dark palette da duoc duyet.
2. Kiem tra working tree de khong ghi de thay doi brand dang lam do.
3. Bat dau tai **P1 - Ha tang color mode**.
4. Khong bat dau migrate hang loat component truoc khi token dark duoc chot.
