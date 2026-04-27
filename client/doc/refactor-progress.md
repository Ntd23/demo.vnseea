# Refactor Progress

File này dùng để đánh dấu phần nào của hướng refactor mới đã có sample, đã có doc, và phần nào chưa làm.

## Current baseline after latest pull

- `[x]` Runtime hiện tại của Nuxt vẫn chạy chủ yếu từ:
  - `app/pages/*`
  - `app/components/*`
  - `app/composables/*`
- `[x]` `src/*` hiện mới là:
  - target structure
  - sample bounded contexts
  - runtime mới cho một phần `product`
- `[x]` Route thật vẫn map từ `app/pages/*`
- `[x]` `app/pages/*` vẫn là route entrypoint bắt buộc của Nuxt

## Docs

- `[x]` [refactor-guide.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/refactor-guide.md)
- `[x]` [refactor-blueprint-ddd.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/refactor-blueprint-ddd.md)
- `[x]` [product-editor-migration-status.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/product-editor-migration-status.md)
- `[x]` [refactor-sample-product.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/refactor-sample-product.md)
- `[x]` [refactor-sample-checkout.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/refactor-sample-checkout.md)
- `[x]` [refactor-sample-community.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/refactor-sample-community.md)

## Bounded contexts in `src/*`

- `[x]` `src/product`
  - `domain`
  - `application`
  - `infrastructure`
  - `presentation`
- `[x]` `src/checkout`
  - `domain`
  - `application`
  - `infrastructure`
  - `presentation`
- `[x]` `src/shared-kernel`
  - `presentation`
- `[x]` `src/community`
  - `domain`
  - `application`
  - `infrastructure`
  - `presentation`
- `[ ]` `src/funding`
- `[ ]` `src/auth`
- `[ ]` `src/messages`
- `[ ]` `src/orders`
- `[ ]` `src/wallet`
- `[ ]` `src/blogs`
- `[ ]` `src/jobs`
- `[ ]` `src/search`
- `[ ]` `src/events`
- `[ ]` `src/directory`
- `[ ]` `src/forum`
- `[ ]` `src/games`
- `[ ]` `src/live`
- `[ ]` `src/profile`
- `[ ]` `src/settings`
- `[ ]` `src/watch`
- `[ ]` `src/withdrawal`

## Legacy inventory in `app/components/*`

- `[x]` Tổng số module legacy hiện có trong `app/components/*`: `35`
- `[x]` Inventory đã được đối chiếu với cấu trúc cũ trong IDE

### Legacy module list

- `[x]` `auth`
- `[x]` `blogs`
- `[x]` `checkout`
- `[x]` `community`
- `[x]` `directory`
- `[x]` `events`
- `[x]` `explore`
- `[x]` `feed`
- `[x]` `forms`
- `[x]` `forum`
- `[x]` `foundation`
- `[x]` `funding`
- `[x]` `games`
- `[x]` `go-pro`
- `[x]` `jobs`
- `[x]` `lightbox`
- `[x]` `live`
- `[x]` `memories`
- `[x]` `messages`
- `[x]` `movies`
- `[x]` `navigation`
- `[x]` `orders`
- `[x]` `pages`
- `[x]` `photos`
- `[x]` `poke`
- `[x]` `popular`
- `[x]` `product`
- `[x]` `profile`
- `[x]` `reels`
- `[x]` `saved`
- `[x]` `search`
- `[x]` `settings`
- `[x]` `wallet`
- `[x]` `watch`
- `[x]` `withdrawal`

## Remaining app component modules

### Primary bounded contexts / business modules

- `[ ]` `auth`
- `[ ]` `blogs`
- `[ ]` `checkout`
- `[~]` `community`
- `[ ]` `directory`
- `[ ]` `events`
- `[ ]` `forum`
- `[ ]` `funding`
- `[ ]` `games`
- `[ ]` `jobs`
- `[ ]` `live`
- `[ ]` `messages`
- `[ ]` `orders`
- `[~]` `product`
- `[ ]` `profile`
- `[ ]` `search`
- `[ ]` `settings`
- `[ ]` `wallet`
- `[ ]` `watch`
- `[ ]` `withdrawal`

### Secondary / content / support modules

- `[ ]` `explore`
- `[ ]` `feed`
- `[~]` `forms`
- `[ ]` `foundation`
- `[ ]` `go-pro`
- `[ ]` `lightbox`
- `[ ]` `memories`
- `[ ]` `movies`
- `[ ]` `navigation`
- `[ ]` `pages`
- `[ ]` `photos`
- `[ ]` `poke`
- `[ ]` `popular`
- `[ ]` `reels`
- `[ ]` `saved`

## Runtime refactor

- `[~]` move route wrappers thật từ `app/pages/*` sang pattern `app/pages/* -> src/*/presentation/pages/*`
- `[~]` move page-level runtime thật khỏi `app/components/pages/*`
- `[~]` thay import runtime cũ bằng `src/*` structure mới

### Current runtime understanding

- `app/pages/*` = Nuxt route entry
- `app/components/pages/*` = page wrapper hoặc page runtime cũ
- `src/*/presentation/pages/*` = page runtime mục tiêu sau refactor
- `src/*/presentation/components/*` = UI thật theo bounded context

## Product migration status

- `[x]` `products` runtime đã nằm ở `src/product/presentation/pages/ProductsPage.vue`
- `[x]` `my-products` runtime đã nằm ở `src/product/presentation/pages/MyProductsPage.vue`
- `[x]` `new-product` runtime đã nằm ở `src/product/presentation/pages/NewProductPage.vue`
- `[x]` `edit-product` runtime đã nằm ở `src/product/presentation/pages/EditProductPage.vue`
- `[x]` `app/components/pages/ProductsPage.vue` chỉ còn là wrapper
- `[x]` `app/components/pages/MyProductsPage.vue` chỉ còn là wrapper
- `[x]` `app/components/pages/NewProductPage.vue` chỉ còn là wrapper
- `[x]` `app/components/pages/EditProductPage.vue` chỉ còn là wrapper
- `[x]` child components của flow product đã có implementation thật trong `src/product/presentation/components/*`
- `[x]` `app/components/product/*` cho `HeroBanner`, `EditorFields`, `CreateMediaField`, `EditMediaManager`, `PreviewCard`, `ChecklistCard`, `TipsCard` chỉ còn là wrapper
- `[x]` `SubmitBar` đã được move sang `src/shared-kernel/presentation/components/forms/SubmitBar.vue`
- `[x]` `useProductEditorDraft` đã được move sang `src/product/application/composables/useProductEditorDraft.ts`
- `[x]` `useProductEditorMeta` đã được move sang `src/product/application/composables/useProductEditorMeta.ts`
- `[x]` `createProductMockImage` đã được move sang `src/product/infrastructure/mocks/productMockMedia.ts`
- `[x]` `app/composables/useProductEditorDraft.ts` hiện chỉ còn re-export wrapper
- `[x]` `app/composables/useProductEditorMeta.ts` hiện chỉ còn re-export wrapper
- `[x]` `app/composables/useProductMockMedia.ts` hiện chỉ còn re-export wrapper
- `[x]` chuẩn hóa tiếp business rules của `product` sang domain/application sâu hơn
- `[x]` toàn bộ page runtime của `product` đã chuyển ownership sang `src/product/presentation/pages/*`
- `[x]` `ProductsPage.vue` đã chuyển phần search/filter/sort/mock listing sang `src/product/application/*`, `src/product/domain/*`, `src/product/infrastructure/*`
- `[x]` `MyProductsPage.vue` đã chuyển overview summary sang `src/product/application/composables/useMyProductsOverview.ts`
- `[x]` `EditProductPage.vue` đã chuyển mock editable product sang `src/product/infrastructure/mocks/productEditor.mock.ts`

## Community migration status

- `[x]` `useCommunityGroupDetail` đã được move sang `src/community/application/composables/useCommunityGroupDetail.ts`
- `[x]` `useCommunityPageDetail` đã được move sang `src/community/application/composables/useCommunityPageDetail.ts`
- `[x]` `app/composables/useCommunityGroupDetail.ts` hiện chỉ còn re-export wrapper
- `[x]` `app/composables/useCommunityPageDetail.ts` hiện chỉ còn re-export wrapper
- `[x]` lookup data từ `types/community.ts` đã có adapter tạm trong `src/community/infrastructure/adapters/communityDirectory.adapter.ts`
- `[x]` rule format count đã được tách sang `src/community/domain/services/community-metrics.service.ts`
- `[x]` `GroupDetailPage` runtime đã nằm ở `src/community/presentation/pages/GroupDetailPage.vue`
- `[x]` `PageDetailPage` runtime đã nằm ở `src/community/presentation/pages/PageDetailPage.vue`
- `[x]` `GroupSettingPage` runtime đã nằm ở `src/community/presentation/pages/GroupSettingPage.vue`
- `[x]` `PageSettingPage` runtime đã nằm ở `src/community/presentation/pages/PageSettingPage.vue`
- `[x]` `app/components/pages/GroupDetailPage.vue` chỉ còn là wrapper
- `[x]` `app/components/pages/PageDetailPage.vue` chỉ còn là wrapper
- `[x]` `app/components/pages/GroupSettingPage.vue` chỉ còn là wrapper
- `[x]` `app/components/pages/PageSettingPage.vue` chỉ còn là wrapper
- `[x]` move runtime pages của `community` sang `src/community/presentation/pages/*`
- `[x]` move `app/components/community/*` sang `src/community/presentation/components/*`
- `[x]` `app/components/community/*` hiện chỉ còn adapter wrapper
- `[ ]` tách tiếp mock/social feed dependency chung khỏi `useMockSocialData`

## Library alignment

- `[ ]` chuẩn hóa `@nuxt/ui` theo kiến trúc mới ở các context còn lại
- `[ ]` chuẩn hóa `VueUse` theo `application` hoặc `shared-kernel` ở các context còn lại
- `[ ]` đưa `Pinia` vào application layer đúng chỗ
- `[ ]` chuẩn hóa `NuxtImg` ở các page public quan trọng
- `[ ]` mở rộng `i18n` theo bounded context mới

## Architecture governance

- `[ ]` đồng bộ toàn bộ doc cũ sang terminology mới:
  - `bounded context`
  - `shared-kernel`
  - `application`
  - `infrastructure`
- `[ ]` tạo checklist phase 1
- `[ ]` tạo checklist phase 2
- `[ ]` tạo checklist migration per module

## Build status

- `[x]` build pass sau khi thêm sample `src/product`
- `[x]` build pass sau khi thêm sample `src/checkout`
- `[x]` build pass sau bước move child components của `new-product`
- `[x]` build pass sau bước wrapper `edit-product` và move `SubmitBar`
- `[x]` build pass sau bước move orchestration `product`
- `[x]` build pass sau bước move toàn bộ page runtime của `product`
- `[x]` build pass sau bước move runtime và presentation components của `community`

## Next recommended work

### Next step A: community cleanup

- `[ ]` tách thêm domain types / option helpers khỏi `types/community.ts`
- `[ ]` tách mock/social feed dependency chung khỏi runtime `community`

### Next step B: second runtime wrapper

- `[ ]` chuyển `checkout` sang pattern `app/pages/* -> src/checkout/presentation/pages/*`

### Next step C: next high-value business contexts

- `[ ]` `messages`
- `[ ]` `orders`
- `[ ]` `wallet`
- `[ ]` `search`
- `[ ]` `blogs`
- `[ ]` `jobs`

## Suggested order from now

1. cleanup sâu `community`
2. runtime wrapper cho `checkout`
3. migrate thật `checkout`
4. chọn một context lớn trong `messages / orders / wallet / search`
