import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = relativePath =>
  readFile(new URL(relativePath, import.meta.url), "utf8")

test("story deletion is owner-only and updates the viewer after success", async () => {
  const [component, viewModel, repository, bridge, backend] = await Promise.all([
    read("../src/feed/presentation/components/StoryCarousel.vue"),
    read("../src/feed/application/view-models/useFeedStoryCarouselVM.ts"),
    read("../src/feed/domain/repositories/FeedRepository.ts"),
    read("../server/api/feed/stories/action.post.ts"),
    read("../../assets/includes/functions_three.php"),
  ])

  assert.match(component, /v-if="activeStoryIsMine"[\s\S]*?requestDeleteStory/)
  assert.match(component, /<UModal[\s\S]*?deleteConfirmOpen/)
  assert.match(component, /overlay: 'z-\[2147483600\]'/)
  assert.match(component, /content: 'z-\[2147483647\]/)
  assert.match(component, /\.story-viewer\s*\{[^}]*z-index:\s*2147483500;/)
  assert.match(viewModel, /if \(!story\?\.isMe/)
  assert.match(viewModel, /deletedStoryIds\.value = new Set/)
  assert.match(repository, /action: "delete"/)
  assert.match(bridge, /action === "delete"/)
  assert.match(bridge, /"delete-story"/)
  assert.match(backend, /!Wo_IsStoryOwner\(\$id\)/)
})
