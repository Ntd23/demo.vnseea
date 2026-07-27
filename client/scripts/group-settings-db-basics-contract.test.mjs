import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const readSource = path => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("group settings URL uses the configured backend group route", async () => {
  const basics = await readSource("src/community/presentation/components/GroupSettingsBasicsCard.vue")

  assert.match(basics, /useBackendWebBase/)
  assert.match(basics, /backendWebBase\.replace\(\/\\\/\+\$\/, ""\)\}\/g\//)
  assert.doesNotMatch(basics, /const urlPrefix = "https:\/\/vnseea\.vn\/"/)
  assert.match(basics, /class="group-settings-basic__slug-input"/)
  assert.match(basics, /\.group-settings-basic__slug\s*\{[^}]*display: flex;/)
  assert.doesNotMatch(basics, /\.group-settings-basic__slug-prefix\s*\{[^}]*position: absolute;/)
})

test("group settings categories come from the database endpoint", async () => {
  const [page, basics, categories, routes] = await Promise.all([
    readSource("src/community/presentation/pages/GroupSettingPage.vue"),
    readSource("src/community/presentation/components/GroupSettingsBasicsCard.vue"),
    readSource("src/community/application/composables/useCommunityGroupCategories.ts"),
    readSource("src/shared-kernel/application/constants/route-registry.ts"),
  ])

  assert.match(page, /useCommunityGroupCategories/)
  assert.match(page, /:category-options="categoryOptions"/)
  assert.match(categories, /apiRoutes\.community\.groupCategories/)
  assert.match(routes, /groupCategories: "community\/group-categories"/)
  assert.doesNotMatch(basics, /communityCategoryOptions/)
})

test("group detail keeps the database category id and stale drafts cannot replace identity fields", async () => {
  const mapper = await readSource("server/api/community/_shared.ts")
  const vm = await readSource("src/community/application/view-models/useCommunityGroupSettingPageVM.ts")

  assert.match(mapper, /const categoryId = firstString\(entity, \["category_id"\]\)/)
  assert.match(mapper, /category: categoryId \|\| normalizeGroupCategory\(rawCategory\)/)
  assert.match(vm, /slug: baseDraft\.slug,[\s\S]*category: baseDraft\.category/)
})
