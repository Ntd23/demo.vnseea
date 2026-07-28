import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const readSource = path => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("desktop feed menu exposes the same two filter choices as mobile", async () => {
  const sidebar = await readSource("src/navigation/presentation/components/LeftSidebar.vue")

  assert.match(sidebar, /i-ph-sliders-horizontal-bold/)
  assert.match(sidebar, /pages\.homeFeedPage\.orders\.allLabel/)
  assert.match(sidebar, /pages\.homeFeedPage\.orders\.followingLabel/)
  assert.match(sidebar, /v-for="option in feedOrderOptions"/)
  assert.match(sidebar, /selectFeedOrder\(option\.key\)/)
})

test("desktop and mobile feed controls share the order used by the backend query", async () => {
  const sharedOrder = await readSource("src/feed/application/composables/useHomeFeedOrder.ts")
  const vm = await readSource("src/feed/application/view-models/useHomeFeedPageVM.ts")
  const repository = await readSource("src/feed/infrastructure/repositories/ApiFeedRepository.ts")

  assert.match(sharedOrder, /useState<HomeFeedOrderKey>\("home-feed:order"/)
  assert.match(vm, /const activeOrder = useHomeFeedOrder\(\)/)
  assert.match(vm, /followingOnly: activeOrder\.value === "following"/)
  assert.match(repository, /followingOnly: input\?\.followingOnly \? 1 : 0/)
})
