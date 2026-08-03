import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const source = readFileSync(
  new URL("../src/reels/application/view-models/useReelsPageVM.ts", import.meta.url),
  "utf8",
)

test("reels paginate near the end without wrapping to the first video", () => {
  assert.match(source, /repository\.getVideos\(\{[\s\S]*?afterPostId: requestedOffset/)
  assert.match(source, /const existingIds = new Set\(reels\.value\.map\(post => post\.id\)\)/)
  assert.match(source, /!existingIds\.has\(post\.id\)/)
  assert.match(source, /index >= reels\.value\.length - reelsPrefetchThreshold/)
  assert.match(source, /const appended = await loadMoreReels\(\)/)
  assert.doesNotMatch(source, /activeIndex\.value = \(activeIndex\.value \+ 1\) % reels\.value\.length/)
  assert.match(source, /activeIndex\.value = Math\.max\(0, activeIndex\.value - 1\)/)
})

test("reels stop pagination when the backend cursor no longer advances", () => {
  assert.match(source, /const cursorAdvanced = nextOffset !== null && nextOffset !== requestedOffset/)
  assert.match(source, /hasMoreReels\.value = response\.posts\.length > 0 && cursorAdvanced/)
  assert.match(source, /hasMoreReels\.value = response\.nextOffset !== null/)
  assert.match(source, /maxEmptyReelsPagesPerLoad/)
})
