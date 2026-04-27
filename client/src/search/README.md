# Search Context

Day la bounded context `search` theo huong:
- DDD o cap module
- MVVM o tang presentation/application

Pham vi cua buoc nay:
- dua runtime trang `/search` vao `src/search/presentation/pages`
- tach rule loc/sort/normalize keyword ra `domain/services`
- tach orchestration URL, filter, section, summary ra `application/composables`
- giu `app/*` lam wrapper de route hien tai van chay

Mapping tu code cu:
- `app/components/pages/SearchPage.vue` -> wrapper den `presentation/pages/SearchPage.vue`
- `app/components/search/*` -> wrapper den `presentation/components/*`
- `app/pages/search.vue` -> route mong, import wrapper ro rang
- `app/composables/useMockSearchData.ts` -> duoc doc qua adapter trong `infrastructure/adapters`

Nguyen tac:
- `domain` khong import Vue/Nuxt
- `application` dieu phoi state, URL sync va computed ViewModel
- `infrastructure` giu adapter data source
- `presentation` chi render UI va goi ViewModel
