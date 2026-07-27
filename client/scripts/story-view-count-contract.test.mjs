import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const projectRoot = new URL("../../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")
const readProject = path => readFile(new URL(path, projectRoot), "utf8")

test("story views count unique viewers and exclude the owner", async () => {
  const [detailEndpoint, storyListEndpoint] = await Promise.all([
    readProject("api/v2/endpoints/get_story_by_id.php"),
    readProject("api/v2/endpoints/get-user-stories.php"),
  ])

  assert.match(detailEndpoint, /COUNT\(DISTINCT user_id\)/)
  assert.match(detailEndpoint, /where\('user_id',\$story->user_id,'!='\)/)
  assert.match(storyListEndpoint, /COUNT\(DISTINCT `user_id`\) AS count/)
  assert.match(storyListEndpoint, /`user_id` != '\{\$story_owner_id\}'/)
})

test("view action returns the authoritative count and the viewer displays it", async () => {
  const [bridge, types, vm, carousel] = await Promise.all([
    readClient("server/api/feed/stories/action.post.ts"),
    readClient("src/feed/domain/types/feed.types.ts"),
    readClient("src/feed/application/view-models/useFeedStoryCarouselVM.ts"),
    readClient("src/feed/presentation/components/StoryCarousel.vue"),
  ])

  assert.match(bridge, /views: Math\.max\(0, Math\.floor\(asNumber\(response\.story\?\.view_count\)\)\)/)
  assert.match(types, /FeedStoryActionResult[\s\S]*views\?: number/)
  assert.match(vm, /storyViewsById/)
  assert.match(vm, /nextViews\.set\(story\.id, Math\.max\(0, result\.views\)\)/)
  assert.match(carousel, /\{\{ activeStoryViewCount \}\}/)
})

test("only the opened story is marked viewed and failed requests can retry", async () => {
  const vm = await readClient("src/feed/application/view-models/useFeedStoryCarouselVM.ts")

  assert.doesNotMatch(vm, /markStoryGroupViewed/)
  assert.match(vm, /pendingStoryViewIds/)
  assert.match(vm, /finally \{[\s\S]*pendingStoryViewIds\.value = new Set/)
  assert.match(vm, /sentStoryViewIds\.value = new Set\(\[\.\.\.sentStoryViewIds\.value, story\.id\]\)/)
})
