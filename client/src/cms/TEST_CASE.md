English description: Test cases for the PHP-backed public CMS bounded context.

# CMS Test Cases

## Scope

- Context: `client/src/cms`
- Routes: `/terms/terms`, `/terms/privacy-policy`, `/terms/about-us`, `/terms/refund`, `/site-pages/{pageName}`
- Main entry points: `CmsPage.vue`, `useCmsPageVM`, `/_api/cms/page`, `/_api/cms/pages`
- Out of scope: Nuxt admin editor for CMS data.

## Environment

- Nuxt direct: `http://127.0.0.1:3000`
- Laragon proxy: `http://demo.vnseea.test:8080`
- Backend session source: PHP browser cookies
- API bridge: `/_api/*`

## Smoke

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `CMS-SMOKE-001` | `[ ]` | Hard reload terms route | `/terms/terms` | Page renders backend terms content without redirecting guests to `/welcome`. |
| `CMS-SMOKE-002` | `[ ]` | Hard reload custom page | `/site-pages/{pageName}` | Page renders the custom page title/content from PHP `T_CUSTOM_PAGES`. |
| `CMS-SMOKE-003` | `[ ]` | Client navigation | register/search footer link -> terms/privacy/about | Route changes to Nuxt CMS page without full backend redirect. |

## Route Access

| ID | Status | Case | Precondition | Expected |
| --- | --- | --- | --- | --- |
| `CMS-ROUTE-001` | `[ ]` | Guest direct URL access | Logged out | `/terms/*` and `/site-pages/*` remain public and do not trigger auth middleware. |
| `CMS-ROUTE-002` | `[ ]` | Invalid terms type | Any session | Unknown `/terms/{type}` returns 404. |
| `CMS-ROUTE-003` | `[ ]` | Missing custom page | Any session | Unknown `/site-pages/{pageName}` returns 404 or safe not-found state. |

## API And Data

| ID | Status | Case | Entry | Expected |
| --- | --- | --- | --- | --- |
| `CMS-API-001` | `[ ]` | Terms success | `/_api/cms/page?kind=terms&type=privacy-policy` | JSON contains real title and HTML content from PHP language terms page. |
| `CMS-API-002` | `[ ]` | Custom success | `/_api/cms/page?kind=custom&pageName={pageName}` | JSON contains `title`, `contentHtml`, `pageType`, and canonical href. |
| `CMS-API-003` | `[ ]` | Custom list | `/_api/cms/pages` | JSON lists custom pages from PHP with Nuxt `/site-pages/*` hrefs. |
| `CMS-API-004` | `[ ]` | Backend edit propagation | Edit content in PHP admin, reload Nuxt route | Nuxt renders updated content without hardcoded fallback copy. |

## SEO And UI

| ID | Status | Case | Viewport | Expected |
| --- | --- | --- | --- | --- |
| `CMS-SEO-001` | `[ ]` | SSR metadata | `curl` or View Source | Title, description, canonical, and OG data come from CMS page data. |
| `CMS-SEO-002` | `[ ]` | Missing description | CMS content empty/too short | Nuxt does not use generic `siteDesc` as detail-page fallback. |
| `CMS-UI-001` | `[ ]` | Desktop layout | `1440x900` | CMS page is centered, readable, and not squeezed by feed sidebars. |
| `CMS-UI-002` | `[ ]` | Mobile layout | `390x844` | HTML content wraps without horizontal overflow. |

## Verification Commands

```powershell
cd client
cmd /c pnpm exec tsc --noEmit
php -l ..\api\v2\endpoints\cms-pages.php
php -l ..\api-v2.php
```

## Notes

- Do not run `nuxt prepare` or `nuxt build` while the dev server is running.
