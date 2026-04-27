# Product Sample Context

Đây là mẫu bounded context `product` theo hướng:
- DDD ở cấp hệ thống
- MVVM ở tầng presentation

Mục đích:
- làm mẫu tham chiếu
- chưa thay thế runtime hiện tại
- không nối trực tiếp vào `app/pages` hoặc `app/components` ở bước này

Mapping từ code hiện tại:
- `types/product-editor.ts` -> `domain/types/product-editor.types.ts`
- `app/composables/useProductEditorDraft.ts` -> `application/composables/useProductEditor.ts` + `infrastructure/persistence/product-editor.storage.ts`
- `app/components/product/*` -> `presentation/components/*`
- `app/components/pages/NewProductPage.vue` -> `presentation/pages/NewProductPage.vue`

Nguyên tắc:
- `domain` không import Vue/Nuxt
- `application` điều phối use case và state
- `infrastructure` lo persistence/repository implementation
- `presentation` chỉ render và gọi ViewModel
