English description: Documents the backend-backed messages bounded context and its Nuxt route entrypoints.

# Messages bounded context

- Runtime page: `src/messages/presentation/pages/MessagesPage.vue`
- Route entry file `app/pages/messages.vue` giữ layout/SEO và import thẳng `src/messages/presentation/pages/MessagesPage.vue`
- Inbox state và thread state được điều phối tại `src/messages/application/composables/useMessagesInbox.ts`
- Message domain types đã được tách sang `src/messages/domain/types/messages.types.ts`
- Legacy `app/components/messages/*` và `app/components/pages/MessagesPage.vue` có thể xóa sau khi build pass
