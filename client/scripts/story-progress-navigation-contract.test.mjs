import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const readSource = path => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("story progress renders for both images and videos", async () => {
  const carousel = await readSource("src/feed/presentation/components/StoryCarousel.vue")

  assert.match(carousel, /class="story-viewer__progress"/)
  assert.doesNotMatch(carousel, /v-if="!activeStoryIsVideo"\s+class="story-viewer__progress"/)
  assert.match(carousel, /v-for="\(item, itemIndex\) in storyQueue"/)
})

test("clicking a progress segment opens its exact story item", async () => {
  const carousel = await readSource("src/feed/presentation/components/StoryCarousel.vue")
  const vm = await readSource("src/feed/application/view-models/useFeedStoryCarouselVM.ts")

  assert.match(carousel, /@click\.stop="openStoryItem\(itemIndex\)"/)
  assert.match(carousel, /:key="`video-\$\{activeStoryData\.id\}`"/)
  assert.match(carousel, /:key="`image-\$\{activeStoryData\.id\}`"/)
  assert.match(vm, /function openStoryItem\(itemIndex: number\)/)
  assert.match(vm, /activeStoryItemIndex\.value = itemIndex/)
  assert.match(vm, /openStoryItem,[\s\S]*rememberStoryPointer/)
})
