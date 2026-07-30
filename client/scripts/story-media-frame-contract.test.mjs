import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const createPage = await readFile(
  new URL("../src/feed/presentation/pages/StatusCreatePage.vue", import.meta.url),
  "utf8",
)
const storyCarousel = await readFile(
  new URL("../src/feed/presentation/components/StoryCarousel.vue", import.meta.url),
  "utf8",
)

assert.match(
  createPage,
  /\.story-create__preview\s*\{[\s\S]*?aspect-ratio:\s*9\s*\/\s*16;/,
  "The create preview must use the canonical 9:16 story frame.",
)
assert.match(
  createPage,
  /\.story-create__preview--landscape \.story-create__media,[\s\S]*?object-fit:\s*contain;/,
  "Landscape images must fit inside the create preview without destructive cropping.",
)
assert.match(
  storyCarousel,
  /width:\s*min\(100vw,\s*56\.25dvh\);[\s\S]*?aspect-ratio:\s*9\s*\/\s*16;/,
  "The published story viewer must preserve the same 9:16 frame as the preview.",
)
assert.match(
  storyCarousel,
  /@load="handleActiveStoryImageLoad"/,
  "Published images must report their natural orientation.",
)
assert.match(
  storyCarousel,
  /\.story-viewer__dialog--landscape \.story-viewer__media,[\s\S]*?object-fit:\s*contain;/,
  "Published landscape images must fit without cropping.",
)
assert.match(
  storyCarousel,
  /class="story-viewer__actions"[\s\S]*?class="story-viewer__views-pill"[\s\S]*?activeStoryViewCount/,
  "The owner view counter must share one aligned action row with delete and close.",
)
assert.match(
  storyCarousel,
  /\.story-viewer__views-pill\s*\{[\s\S]*?height:\s*34px;[\s\S]*?justify-content:\s*center;/,
  "The owner view counter must match the action button height and center its content.",
)
assert.match(
  storyCarousel,
  /public:\s*"i-ph-globe-hemisphere-west-fill"/,
  "A public story status must display the public globe icon.",
)
assert.match(
  storyCarousel,
  /<Icon :name="activeStoryAudienceIcon" class="story-viewer__author-status-icon" \/>/,
  "The story audience label must render its matching privacy icon.",
)

console.log("story media frame contract: ok")
