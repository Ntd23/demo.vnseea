import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const storyCarouselUrl = new URL(
  "../src/feed/presentation/components/StoryCarousel.vue",
  import.meta.url,
)

test("story videos preserve their full frame in the vertical viewer", async () => {
  const source = await readFile(storyCarouselUrl, "utf8")

  assert.match(
    source,
    /<video[\s\S]*?class="story-viewer__media story-viewer__media--video"/,
  )
  assert.match(
    source,
    /\.story-viewer__media--video\s*\{[^}]*object-fit:\s*contain;/,
  )
})
