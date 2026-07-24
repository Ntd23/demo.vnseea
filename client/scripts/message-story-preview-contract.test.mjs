import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = relativePath =>
  readFile(new URL(relativePath, import.meta.url), "utf8")

test("story replies prefer a real video cover and reject avatar thumbnails", async () => {
  const [component, mapper] = await Promise.all([
    read("../src/messages/presentation/components/StoryMessageCard.vue"),
    read("../server/api/messages/_shared.ts"),
  ])

  assert.match(mapper, /normalizeComparableMediaUrl\(posterCandidate\) === normalizeComparableMediaUrl\(avatarUrl\)/)
  assert.match(component, /v-if="hasVideoPoster"/)
  assert.match(component, /@error="markPosterFailed"/)
  assert.match(component, /v-else-if="story\.mediaType === 'video'/)
  assert.match(component, /\.message-story__preview-media--video\s*\{[^}]*object-fit:\s*contain;/)
})
