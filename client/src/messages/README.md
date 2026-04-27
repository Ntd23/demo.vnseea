# Messages bounded context

- Runtime page: `src/messages/presentation/pages/MessagesPage.vue`
- Route entry file `app/pages/messages.vue` giữ layout/SEO và import thẳng `src/messages/presentation/pages/MessagesPage.vue`
- Inbox state mock đã được gom sang `src/messages/application/composables/useMessagesInbox.ts`
- Message domain types đã được tách sang `src/messages/domain/types/messages.types.ts`
- Legacy `app/components/messages/*` và `app/components/pages/MessagesPage.vue` có thể xóa sau khi build pass
