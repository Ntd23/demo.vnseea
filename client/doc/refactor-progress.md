# Refactor Progress

File này dùng để đánh dấu phần nào của hướng refactor mới đã có mẫu, đã có doc, và phần nào chưa làm.

## Docs

- `[x]` [refactor-guide.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/refactor-guide.md)
  - doc hướng dẫn refactor chính

- `[x]` [refactor-blueprint-ddd.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/refactor-blueprint-ddd.md)
  - blueprint kiến trúc chi tiết

- `[x]` [product-editor-migration-status.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/product-editor-migration-status.md)
  - inventory module + backlog migration

- `[x]` [refactor-sample-product.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/refactor-sample-product.md)
  - sample cho `product`

- `[x]` [refactor-sample-checkout.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/refactor-sample-checkout.md)
  - sample cho `checkout`

## Sample bounded contexts

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

- `[ ]` `src/community`
- `[ ]` `src/funding`
- `[ ]` `src/auth`
- `[ ]` `src/messages`
- `[ ]` `src/orders`
- `[ ]` `src/wallet`
- `[ ]` `src/blogs`
- `[ ]` `src/jobs`
- `[ ]` `src/search`

## Runtime refactor

- `[ ]` move route wrappers thật từ `app/pages/*` sang `src/*/presentation/pages`
- `[ ]` move page-level logic thật khỏi `app/components/pages/*`
- `[ ]` thay import runtime cũ bằng `src/*` structure mới

## Library alignment

- `[ ]` chuẩn hóa `@nuxt/ui` theo kiến trúc mới
- `[ ]` chuẩn hóa `VueUse` theo application/shared-kernel layer
- `[ ]` đưa `Pinia` vào application layer đúng chỗ
- `[ ]` chuẩn hóa `NuxtImg` ở các page public quan trọng
- `[ ]` mở rộng `i18n` theo context mới

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
