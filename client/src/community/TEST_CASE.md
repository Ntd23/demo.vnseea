English description: Test cases for the community bounded context, covering group and page directories, detail flows, creation forms, and settings routes backed by Nuxt API bridges.

# Community Test Cases

## Scope

- Context: `client/src/community`
- Routes:
  - `/groups`
  - `/suggested-groups`
  - `/joined_groups`
  - `/pages`
  - `/suggested-pages`
  - `/liked-pages`
  - `/g/[name]`
  - `/p/[name]`
  - `/create-group`
  - `/create-page`
  - `/group-setting/[group]`
  - `/page-setting/[page]`
- Main entry points:
  - `presentation/pages/GroupsPage.vue`
  - `presentation/pages/PagesDirectoryPage.vue`
  - `presentation/pages/GroupDetailPage.vue`
  - `presentation/pages/PageDetailPage.vue`
  - `infrastructure/repositories/ApiCommunityRepository.ts`
  - `server/api/community/*`
- Out of scope:
  - Shared shell ownership from Dev 1
  - Raw PHP endpoint behavior outside the Nuxt `/_api/*` bridge

## Environment

- Nuxt direct: `http://127.0.0.1:3000`
- Laragon proxy: `http://demo.vnseea.test:8080`
- Backend session source: PHP browser cookies
- API bridge:
  - `/_api/community/groups?mode=mine|joined|suggested`
  - `/_api/community/pages?mode=mine|favorite|suggested`
  - `/_api/community/groups/[slug]`
  - `/_api/community/pages/[slug]`
  - `/_api/community/pages/[slug]/posts`
  - `/_api/community/groups/[slug]/join`
  - `/_api/community/pages/[slug]/follow`

## Smoke

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `COMM-SMOKE-001` | `[ ]` | Hard reload groups directory | `/groups` | Page renders without Nuxt error, duplicate shell, or broken asset state. |
| `COMM-SMOKE-002` | `[ ]` | Hard reload pages directory | `/pages` | Page renders as list-first shell, not dashboard/marketing hero. |
| `COMM-SMOKE-003` | `[ ]` | Client navigation across tabs | `/groups -> /suggested-groups -> /joined_groups` | Active tab changes correctly and old list state does not leak into the next tab. |
| `COMM-SMOKE-004` | `[ ]` | Client navigation across tabs | `/pages -> /suggested-pages -> /liked-pages` | Active tab changes correctly and the create-page CTA remains visible. |

## Route Access

| ID | Status | Case | Precondition | Expected |
| --- | --- | --- | --- | --- |
| `COMM-ROUTE-001` | `[ ]` | Direct URL access to directory routes | Logged-in user | All directory routes render through authenticated flow and keep the correct tab active. |
| `COMM-ROUTE-002` | `[ ]` | Direct URL access to detail routes | Valid existing `group` and `page` slug | `/g/[name]` and `/p/[name]` load the correct entity, not fallback demo data. |
| `COMM-ROUTE-003` | `[ ]` | Direct URL access to settings routes | Owner account | `/group-setting/[group]` and `/page-setting/[page]` render settings panes and do not redirect to empty shell. |
| `COMM-ROUTE-004` | `[ ]` | Visitor opens owner-only settings route | Non-owner account | Visitor is blocked or redirected safely; owner-only settings UI must not become usable. |

## API And Data

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `COMM-API-001` | `[ ]` | My groups bridge | `/_api/community/groups?mode=mine` | Response feeds `/groups` with real backend data from the bridge; no hardcoded sample cards. |
| `COMM-API-002` | `[ ]` | Suggested groups bridge | `/_api/community/groups?mode=suggested` | Response comes from the suggested/recommended backend flow, not reused joined-group data. |
| `COMM-API-003` | `[ ]` | Joined groups bridge | `/_api/community/groups?mode=joined` | Response shows joined groups only and cards keep the correct action label. |
| `COMM-API-004` | `[ ]` | My pages bridge | `/_api/community/pages?mode=mine` | Response feeds `/pages` with real managed pages; UI does not show fake counts or placeholder copy. |
| `COMM-API-005` | `[ ]` | Suggested pages bridge | `/_api/community/pages?mode=suggested` | Response comes from the suggested/recommended backend flow, not the my-pages dataset. |
| `COMM-API-006` | `[ ]` | Favorite pages bridge | `/_api/community/pages?mode=favorite` | Response maps liked pages correctly and the tab does not reuse suggested or mine data. |
| `COMM-API-007` | `[ ]` | Page detail and posts bridge | `/_api/community/pages/[slug]` and `/_api/community/pages/[slug]/posts` | Header info and feed posts are real backend data, normalized before `FeedPostCard` renders them. |
| `COMM-API-008` | `[ ]` | Backend empty state | Any directory route with no records | Empty state appears inside the main content card and no mock fallback items are injected. |
| `COMM-API-009` | `[ ]` | Backend error state | Simulate failing `/_api/community/*` request | User sees a safe error or empty state; no unhandled Nuxt error page. |

## UI And UX

| ID | Status | Case | Viewport | Expected |
| --- | --- | --- | --- | --- |
| `COMM-UI-001` | `[ ]` | Groups directory parity | `>= 1024px` | Layout order is heading -> tabs/CTA -> list. Search bars, stat heroes, and extra marketing blocks are absent. |
| `COMM-UI-002` | `[ ]` | Pages directory parity | `>= 1024px` | Layout order is heading -> tabs/CTA -> list. Search, keyword filter, and dashboard badges from the old Nuxt page are absent. |
| `COMM-UI-003` | `[ ]` | Group and page cards | `>= 1024px` | Cards are compact list rows with real title, meta, and action; no placeholder summary or fake badge text. |
| `COMM-UI-004` | `[ ]` | Detail page shell parity | `>= 1024px` | `/g/[name]` and `/p/[name]` keep PHP order: cover/hero first, nav/action row next, main content left, sidebar right. |
| `COMM-UI-005` | `[ ]` | Create and settings forms | `>= 1024px` | Form field order matches PHP flow and no extra hero/dashboard chrome is inserted above the form. |
| `COMM-UI-006` | `[ ]` | Mobile stacking | `390x844` | Directories and detail pages stack vertically without overflow; tabs remain tappable and CTA stays visible. |
| `COMM-UX-001` | `[ ]` | Loading state | Slow API | Skeletons show in list/detail areas and no stale data from the previous tab remains visible. |

## Verification Commands

```powershell
cd client
npm run build
```

## Notes

- Test both `127.0.0.1:3000` and `demo.vnseea.test:8080` when checking reload and proxy behavior.
- For suggested tabs, verify in DevTools Network that the request path stays under `/_api/community/*`, not direct PHP endpoints.
- If any card title, summary, action label, or count looks generic across all records, mark the case as failed and capture the payload from the matching `/_api/community/*` response.
