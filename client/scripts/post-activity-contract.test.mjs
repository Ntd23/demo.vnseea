import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('activity BFF uses the canonical authenticated backend endpoint', () => {
  const source = read('server/api/activity/posts.get.ts')
  assert.match(source, /createBackendApiClient/)
  assert.match(source, /post<.*>\("post-activity"/s)
  assert.doesNotMatch(source, /user_id/)
  for (const category of ['saved', 'reaction', 'comment', 'share']) {
    assert.match(source, new RegExp(`['"]${category}['"]`))
  }
})

test('activity route exposes four tabs and saved compatibility redirects', () => {
  const page = read('src/activity/presentation/pages/ActivityCenterPage.vue')
  const savedRoute = read('app/pages/saved-posts.vue')
  const activityRoute = read('app/pages/activity.vue')

  for (const category of ['saved', 'reaction', 'comment', 'share']) {
    assert.match(page, new RegExp(`['"]${category}['"]`))
  }
  assert.match(savedRoute, /appRoutes\.activity/)
  assert.match(savedRoute, /tab:\s*['"]saved['"]/)
  assert.match(activityRoute, /ActivityCenterPage/)
})

test('desktop and mobile menus point to Activity & saved', () => {
  const desktop = read('src/navigation/presentation/components/LeftSidebar.vue')
  const mobile = read('src/navigation/presentation/components/MobileMenu.vue')
  assert.match(desktop, /appRoutes\.activity/)
  assert.match(mobile, /appRoutes\.activity/)
})
