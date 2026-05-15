English description: Documents the backend-backed messages bounded context and its Nuxt route/API entrypoints.

# Messages bounded context

- Route wrapper: `client/app/pages/messages.vue`
- Runtime page: `client/src/messages/presentation/pages/MessagesPage.vue`
- View-model: `client/src/messages/application/composables/useMessagesInbox.ts`
- Repository contract: `client/src/messages/domain/repositories/MessagesRepository.ts`
- Repository implementation: `client/src/messages/infrastructure/repositories/ApiMessagesRepository.ts`
- Nuxt bridge: `client/server/api/messages/*`

## Flow

`app/pages/messages.vue -> presentation -> useMessagesInbox -> MessagesRepository -> /_api/messages/* -> PHP API/xhr source of truth`

## Backend-backed actions

- Inbox: `/_api/messages/conversations`
- Thread: `/_api/messages/thread`
- Send single message or media: `/_api/messages/send`
- Multi-send: `/_api/messages/multi`
- Mark all read: `/_api/messages/read`
- Delete/leave conversation: `/_api/messages/delete`
- Create group chat: `/_api/messages/group`

Do not add local mock conversations or fake success state in this context.
