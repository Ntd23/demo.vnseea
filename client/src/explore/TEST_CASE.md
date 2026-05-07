English description: Test cases for the explore bounded context, covering the media-first explore route and hashtag result route backed by feed API bridges.

# Explore Test Cases

## Scope

- Context: `client/src/explore`
- Routes:
  - `/explore`
  - `/hashtag/[tag]`
- Main entry points:
  - `presentation/pages/ExplorePage.vue`
  - `presentation/pages/HashtagPage.vue`
  - `feed/infrastructure/repositories/ApiFeedRepository.ts`
  - `server/api/feed/explore.get.ts`
  - `server/api/feed/hashtag/[tag].get.ts`
- Out of scope:
  - Feed home route behavior
  - SEO for private-only surfaces outside these two pages

## Environment

- Nuxt direct: `http://127.0.0.1:3000`
- Laragon proxy: `http://demo.vnseea.test:8080`
- Backend session source: PHP browser cookies
- API bridge:
  - `/_api/feed/explore`
  - `/_api/feed/hashtag/[tag]`

## Smoke

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `EXP-SMOKE-001` | `[ ]` | Hard reload explore | `/explore` | Page renders without Nuxt error, blank shell, or duplicated layout blocks. |
| `EXP-SMOKE-002` | `[ ]` | Hard reload hashtag route | `/hashtag/test` | Page renders the matching hashtag heading and post list without hydration mismatch. |
| `EXP-SMOKE-003` | `[ ]` | Client navigation between explore and hashtag | `/explore -> /hashtag/test` | Route changes cleanly and previous tiles do not remain on screen after navigation. |

## Route Access

| ID | Status | Case | Precondition | Expected |
| --- | --- | --- | --- | --- |
| `EXP-ROUTE-001` | `[ ]` | Direct URL access | Logged-in user | `/explore` opens normally through authenticated flow. |
| `EXP-ROUTE-002` | `[ ]` | Direct URL access with valid tag | Existing hashtag | `/hashtag/[tag]` shows results for that exact tag and not a generic discovery feed. |
| `EXP-ROUTE-003` | `[ ]` | Direct URL access with missing tag data | Unknown hashtag | Page stays stable and falls back to the proper empty state instead of crashing. |

## API And Data

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `EXP-API-001` | `[ ]` | Explore success response | `/_api/feed/explore` | UI renders real backend media posts; no hardcoded summary cards, fake people, or fake page suggestions. |
| `EXP-API-002` | `[ ]` | Explore empty response | `/_api/feed/explore` | Empty state replaces the grid inside the main content area. |
| `EXP-API-003` | `[ ]` | Explore error response | `/_api/feed/explore` | Warning alert appears and the page avoids an unhandled Nuxt error. |
| `EXP-API-004` | `[ ]` | Hashtag success response | `/_api/feed/hashtag/[tag]` | `FeedPostCard` renders normalized real posts for the selected hashtag; no fallback related-tags block appears. |
| `EXP-API-005` | `[ ]` | Hashtag empty response | `/_api/feed/hashtag/[tag]` | Empty state mentions the current hashtag and no mock posts are appended. |
| `EXP-API-006` | `[ ]` | Hashtag param change | Navigate from `/hashtag/tag-a` to `/hashtag/tag-b` | New request is sent for the second tag and old results do not persist. |

## UI And UX

| ID | Status | Case | Viewport | Expected |
| --- | --- | --- | --- | --- |
| `EXP-UI-001` | `[ ]` | Explore desktop layout | `>= 1024px` | Layout is content-first: heading then media grid. Old stats, user lists, and extra dashboard sections are absent. |
| `EXP-UI-002` | `[ ]` | Explore tile content | `>= 1024px` | Each tile shows backend media, author, and time. Video tiles show video treatment, not reused image placeholders. |
| `EXP-UI-003` | `[ ]` | Hashtag desktop layout | `>= 1024px` | Layout is heading then post list. Related-tag chips and stats blocks from the old page are absent. |
| `EXP-UI-004` | `[ ]` | Mobile layout | `390x844` | Grid and post list stack correctly with no overflow or clipped media. |
| `EXP-UX-001` | `[ ]` | Loading state | Slow API | Loading surface appears before data arrives and no stale content flashes from a previous route. |

## Verification Commands

```powershell
cd client
npm run build
```

## Notes

- Verify with DevTools Network that both routes use `/_api/feed/*` and not direct PHP calls.
- If any user/page/hashtag summary block reappears on `/explore`, mark the UI case as failed because that content was explicitly removed for parity.
