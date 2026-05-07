English description: Test cases for the saved bounded context, covering the saved-posts route backed by the real feed saved bridge without fallback cards.

# Saved Test Cases

## Scope

- Context: `client/src/saved`
- Routes:
  - `/saved-posts`
- Main entry points:
  - `presentation/pages/SavedPostsPage.vue`
  - `feed/infrastructure/repositories/ApiFeedRepository.ts`
  - `server/api/feed/saved.get.ts`
- Out of scope:
  - Save/unsave action logic triggered from other bounded contexts

## Environment

- Nuxt direct: `http://127.0.0.1:3000`
- Laragon proxy: `http://demo.vnseea.test:8080`
- Backend session source: PHP browser cookies
- API bridge:
  - `/_api/feed/saved`

## Smoke

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `SAVED-SMOKE-001` | `[ ]` | Hard reload saved posts | `/saved-posts` | Page renders without Nuxt error, blank shell, or mismatched layout. |
| `SAVED-SMOKE-002` | `[ ]` | Client navigation to saved posts | `/home -> /saved-posts` | Route changes cleanly and old feed filters or hero blocks do not remain on screen. |

## Route Access

| ID | Status | Case | Precondition | Expected |
| --- | --- | --- | --- | --- |
| `SAVED-ROUTE-001` | `[ ]` | Direct URL access | Logged-in user | `/saved-posts` opens through the authenticated flow and keeps the saved heading. |
| `SAVED-ROUTE-002` | `[ ]` | Back/forward navigation | After viewing feed routes | Saved list restores cleanly without duplicated cards or stale empty state. |

## API And Data

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `SAVED-API-001` | `[ ]` | Success response | `/_api/feed/saved` | UI renders real saved posts through `FeedPostCard`; custom fallback cards and local mock data are absent. |
| `SAVED-API-002` | `[ ]` | Empty response | `/_api/feed/saved` | Empty state appears in the main content area with no injected placeholder posts. |
| `SAVED-API-003` | `[ ]` | Error response | `/_api/feed/saved` | Warning alert appears and the page avoids an unhandled Nuxt error screen. |
| `SAVED-API-004` | `[ ]` | Feed parity | `/_api/feed/saved` | Saved posts preserve real media, author, reactions, comments, and action state from the normalized feed mapper. |

## UI And UX

| ID | Status | Case | Viewport | Expected |
| --- | --- | --- | --- | --- |
| `SAVED-UI-001` | `[ ]` | Desktop layout | `>= 1024px` | Layout is heading then saved post list only. Old hero/stat/removal toolbar blocks are absent. |
| `SAVED-UI-002` | `[ ]` | Mobile layout | `390x844` | Cards stack vertically with no overflow and the empty state stays readable. |
| `SAVED-UX-001` | `[ ]` | Loading state | Slow API | Loading surface appears before cards render and no stale list is shown from a previous visit. |

## Verification Commands

```powershell
cd client
npm run build
```

## Notes

- Verify in DevTools Network that the page uses `/_api/feed/saved` only.
- If the page still shows custom remove-all controls or non-feed card UI, mark `SAVED-UI-001` as failed because the route now follows the PHP content-first shell.
