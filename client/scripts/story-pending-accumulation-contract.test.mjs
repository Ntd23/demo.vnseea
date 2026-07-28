import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const readSource = path => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("successive image and video stories accumulate instead of replacing each other", async () => {
  const pending = await readSource("src/feed/application/composables/usePendingCreatedStories.ts")
  const createVm = await readSource("src/feed/application/view-models/useStatusCreatePageVM.ts")

  assert.match(pending, /useState<FeedStoryRecord\[\]>\("feed-pending-created-stories"/)
  assert.match(createVm, /pendingCreatedStories\.value = \[\s*response\.story,\s*\.\.\.pendingCreatedStories\.value\.filter/)
  assert.doesNotMatch(createVm, /catch[\s\S]{0,200}pendingCreatedStories\.value = \[\]/)
})

test("home feed retains unconfirmed stories and removes only backend-confirmed duplicates", async () => {
  const homeVm = await readSource("src/feed/application/view-models/useHomeFeedPageVM.ts")

  assert.match(homeVm, /const backendStoryIds = new Set\(records\.map\(story => story\.id\)\)/)
  assert.match(homeVm, /!backendStoryIds\.has\(story\.id\)/)
  assert.match(homeVm, /pendingCreatedStories\.value = retainedPendingStories/)
  assert.match(homeVm, /source\.findIndex\(candidate => candidate\.id === story\.id\) === index/)
})
