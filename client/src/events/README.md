# Events Context

Bounded context `events` hiện đã chuyển runtime chính sang `src/events/presentation/*`.

Đã làm:
- `app/pages/events/index.vue` -> `src/events/presentation/pages/EventsPage.vue`
- `app/pages/events/[id].vue` -> `src/events/presentation/pages/EventDetailPage.vue`
- `app/pages/events/create-event.vue` -> `src/events/presentation/pages/CreateEventPage.vue`
- `app/components/events/*` -> `src/events/presentation/components/*`
- `app/composables/useMockEventsData.ts` -> `src/events/infrastructure/mocks/eventsCatalog.ts`
- event types -> `src/events/domain/types/events.types.ts`

Trạng thái hiện tại:
- `app/pages/events/*` vẫn là route entry của Nuxt
- route files đã import thẳng `src/events/presentation/pages/*`
- legacy `app/components/events/*`, `app/components/pages/EventsPage.vue`, `EventDetailPage.vue`, `CreateEventPage.vue`, và `app/composables/useMockEventsData.ts` đã được xóa
