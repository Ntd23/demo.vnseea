# Messages Context

Day la bounded context `messages` theo huong:
- DDD o cap module
- MVVM o tang presentation/application

Pham vi cua buoc thu nay:
- dua runtime trang `/messages` vao `src/messages/presentation/pages`
- tach mock data ra `infrastructure/mocks`
- tach state va orchestration gui tin nhan ra `application/composables`
- giu `app/*` lam wrapper de route hien tai van chay

Mapping tu code cu:
- `app/components/pages/MessagesPage.vue` -> wrapper den `presentation/pages/MessagesPage.vue`
- `app/components/messages/*` -> wrapper den `presentation/components/*`
- mock user/message trong component -> `infrastructure/mocks/messages.mock.ts`
- logic chon tab, chon contact, gui tin -> `application/composables/useMessagesWorkspace.ts`

Nguyen tac:
- `domain` khong import Vue/Nuxt
- `application` dieu phoi state va use case
- `infrastructure` giu mock/repository data source
- `presentation` chi render UI va phat event len ViewModel
