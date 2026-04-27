# Forum bounded context

- Runtime page: `src/forum/presentation/pages/ForumPage.vue`
- Route entry file `app/pages/forum/index.vue` giữ SEO/meta và import thẳng `src/forum/presentation/pages/ForumPage.vue`
- Forum mock data, filter logic, section normalization và formatter đã được move sang `src/forum/infrastructure/mocks/forumCatalog.ts`
- Forum domain types đã được tách sang `src/forum/domain/types/forum.types.ts`
- Legacy `app/components/forum/*`, `app/components/pages/ForumPage.vue`, `app/composables/useMockForumData.ts` có thể xóa sau khi build pass
