English description: Test cases for the popular bounded context, covering the ranked popular feed route backed by the normalized feed API bridge.

# Popular Test Cases

## Scope

- Context: `client/src/popular`
- Routes:
  - `/popular`
- Main entry points:
  - `presentation/pages/PopularPage.vue`
  - `feed/infrastructure/repositories/ApiFeedRepository.ts`
  - `server/api/feed/popular.get.ts`
- Out of scope:
  - Home feed ranking logic outside the popular page

## Environment

- Nuxt direct: `http://127.0.0.1:3000`
- Laragon proxy: `http://demo.vnseea.test:8080`
- Backend session source: PHP browser cookies
- API bridge:
  - `/_api/feed/popular`

## Smoke

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `POPULAR-SMOKE-001` | `[ ]` | Hard reload popular page | `/popular` | Page renders without Nuxt error or broken shell. |
| `POPULAR-SMOKE-002` | `[ ]` | Client navigation from home to popular | `/home -> /popular` | Route changes without leaving stale home-feed filters or sidebar widgets on the page. |

## Route Access

| ID | Status | Case | Precondition | Expected |
| --- | --- | --- | --- | --- |
| `POPULAR-ROUTE-001` | `[ ]` | Direct URL access | Logged-in user | `/popular` opens through the authenticated flow and keeps the correct page heading. |
| `POPULAR-ROUTE-002` | `[ ]` | Back/forward navigation | After visiting a post-heavy page | Page returns to the ranked feed list without duplicated content blocks. |

## API And Data

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `POPULAR-API-001` | `[ ]` | Success response | `/_api/feed/popular` | UI renders real backend posts with normalized `FeedPostCard` data, not a reduced or hardcoded payload. |
| `POPULAR-API-002` | `[ ]` | Comment/media parity | `/_api/feed/popular` | Posts keep the same comment, reaction, media, and source mapping behavior as other feed routes because the shared mapper is used. |
| `POPULAR-API-003` | `[ ]` | Empty response | `/_api/feed/popular` | Empty state appears in the main content area and no fake ranked items are shown. |
| `POPULAR-API-004` | `[ ]` | Error response | `/_api/feed/popular` | Warning alert appears and the page avoids an unhandled Nuxt error screen. |

## UI And UX

| ID | Status | Case | Viewport | Expected |
| --- | --- | --- | --- | --- |
| `POPULAR-UI-001` | `[ ]` | Desktop layout | `>= 1024px` | Layout is heading then ranked post list only. Old summary cards, filters, and sidebar widgets are absent. |
| `POPULAR-UI-002` | `[ ]` | Rank indicator | `>= 1024px` | Each item shows rank order consistently and the wrapped `FeedPostCard` still renders the full post body below it. |
| `POPULAR-UI-003` | `[ ]` | Mobile layout | `390x844` | Ranked cards stack cleanly and no horizontal overflow appears. |
| `POPULAR-UX-001` | `[ ]` | Loading state | Slow API | Loading surface appears before posts arrive and no stale content flashes from a previous route. |

## Verification Commands

```powershell
cd client
npm run build
```

## Notes

- In DevTools Network, verify the page calls `/_api/feed/popular` only.
- If a popular post lacks media/comments/reactions that exist on the same post elsewhere in feed surfaces, compare the `/_api/feed/popular` payload first and mark `POPULAR-API-002` as failed.
