import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("page composer is visible only to the page creator", async () => {
  const [page, createPost] = await Promise.all([
    readClient("src/community/presentation/pages/PageDetailPage.vue"),
    readClient("server/api/feed/posts/create.post.ts"),
  ])

  assert.match(page, /<FeedPublisherBox\s+v-if="page\.canManage"/)
  assert.equal((page.match(/:to="createJobTo"/g) ?? []).length, 1)
  assert.match(page, /\{\{ t\('pages\.pageDetailPage\.createJobButton'\) \}\}/)
  assert.doesNotMatch(page, />\s*Create job\s*</)
  assert.match(createPost, /"get-page-data"/)
  assert.match(createPost, /pageOwnerId !== currentUserId/)
  assert.match(createPost, /Only the page creator can publish posts on this page/)
})

test("page like and follow buttons share one engagement state and action", async () => {
  const viewModel = await readClient("src/community/application/view-models/useCommunityPageDetailPageVM.ts")

  assert.match(viewModel, /const isFollowing = computed\(\(\) => page\.value\?\.liked === true\)/)
  assert.match(viewModel, /const isLiked = computed\(\(\) => isFollowing\.value\)/)
  assert.match(viewModel, /const engagementPending = computed\(\(\) => followPending\.value \|\| likePending\.value\)/)

  const canonicalActionCalls = viewModel.match(/const updatedPage = await likePage\(\)/g) ?? []
  assert.equal(canonicalActionCalls.length, 2)
})
