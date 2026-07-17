English description: Manual QA coverage for the five-tab backend-backed forum context.

# Forum Test Cases

## Scope

- Context: `client/src/forum`
- Route: `/forum`
- API bridge: `/_api/forum/*`
- Backend source: `api/v2/endpoints/forum.php`
- Out of scope: forum database schema and admin forum configuration

## Smoke And Routing

| ID | Status | Case | Expected |
| --- | --- | --- | --- |
| FORUM-SMOKE-001 | [ ] | Hard reload `/forum?tab=browse` | All five tabs render without hydration or runtime errors. |
| FORUM-SMOKE-002 | [ ] | Navigate between all tabs | URL `tab` changes and only the selected tab data is requested. |
| FORUM-ROUTE-001 | [ ] | Open `/forum?tab=browse&fid=<id>&tid=<id>` | Selected forum and thread detail restore after reload. |
| FORUM-ROUTE-002 | [ ] | Open forum as a guest | Global authenticated middleware redirects to `/welcome`. |

## Browse Forum

| ID | Status | Case | Expected |
| --- | --- | --- | --- |
| FORUM-BROWSE-001 | [ ] | Load forum catalog | Real PHP sections and forums render with post counts. |
| FORUM-BROWSE-002 | [ ] | Select a forum and thread | Thread URL state, author links, body, replies, views, and dates render correctly. |
| FORUM-BROWSE-003 | [ ] | Create a valid thread | Thread is saved by PHP and opened in the detail panel. |
| FORUM-BROWSE-004 | [ ] | Reply to a thread | Reply is saved and the thread detail refreshes. |
| FORUM-BROWSE-005 | [ ] | Load more threads | Items append without duplicates and the cursor advances. |

## Members

| ID | Status | Case | Expected |
| --- | --- | --- | --- |
| FORUM-MEMBER-001 | [ ] | Open `tab=members` | Name, role, joined, last visit, post count, and referrals use backend data. |
| FORUM-MEMBER-002 | [ ] | Click a member | Nuxt profile route `/@<username>` opens. |
| FORUM-MEMBER-003 | [ ] | Search by username | URL `member` updates and matching members render. |
| FORUM-MEMBER-004 | [ ] | Select A-Z filter | URL `letter` updates and the list starts with the selected letter. |
| FORUM-MEMBER-005 | [ ] | Load more members | The next backend page appends to the current list. |

## Advanced Search

| ID | Status | Case | Expected |
| --- | --- | --- | --- |
| FORUM-SEARCH-001 | [ ] | Submit fewer than 4 characters | No API search runs and a validation toast appears. |
| FORUM-SEARCH-002 | [ ] | Search forums | Matching sections/forums render and forum links open Browse. |
| FORUM-SEARCH-003 | [ ] | Search thread subjects | Matching thread cards render from PHP. |
| FORUM-SEARCH-004 | [ ] | Search subject and content | Backend applies the legacy content-search option. |
| FORUM-SEARCH-005 | [ ] | Search messages | The first matching reply opens its parent thread as in PHTML. |
| FORUM-SEARCH-006 | [ ] | Reload search URL | Query, scope, content mode, and section restore from URL. |

## My Threads And Messages

| ID | Status | Case | Expected |
| --- | --- | --- | --- |
| FORUM-MINE-001 | [ ] | Open My threads | Topic, author, posted time, views, last post, edit, and delete render. |
| FORUM-MINE-002 | [ ] | Edit owned thread | Valid subject/content saves and refreshed data appears. |
| FORUM-MINE-003 | [ ] | Delete owned thread | Confirmation is required; thread and its replies disappear after success. |
| FORUM-MINE-004 | [ ] | Open My messages | Subject, forum, posted time, edit, and delete render. |
| FORUM-MINE-005 | [ ] | Edit owned reply | Valid subject/content saves and parent detail refreshes. |
| FORUM-MINE-006 | [ ] | Delete owned reply | Confirmation is required and the reply disappears after success. |
| FORUM-MINE-007 | [ ] | Call mutation for another user's item | PHP returns an authorization error and data is unchanged. |

## UI And Failure States

| ID | Status | Case | Viewport | Expected |
| --- | --- | --- | --- | --- |
| FORUM-UI-001 | [ ] | Five-tab navigation | Mobile | Tabs scroll horizontally and remain tappable. |
| FORUM-UI-002 | [ ] | Members and managed lists | Mobile | Rows render as cards without horizontal page overflow. |
| FORUM-UI-003 | [ ] | Forum/detail layout | Desktop | Sidebar, list, and detail align without overlap. |
| FORUM-UI-004 | [ ] | Slow API | All | Skeletons keep stable dimensions. |
| FORUM-UI-005 | [ ] | Empty API result | All | Context-specific empty state renders. |
| FORUM-UI-006 | [ ] | Backend error | All | Warning alert or toast appears without crashing the route. |

## Verification Commands

```powershell
php -l api/v2/endpoints/forum.php
node -e "JSON.parse(require('fs').readFileSync('client/i18n/locales/en.json','utf8')); JSON.parse(require('fs').readFileSync('client/i18n/locales/vi.json','utf8'))"
```
