import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("feed mapping preserves the backend video title for reels", () => {
  const types = read("src/feed/domain/types/feed.types.ts")
  const mapper = read("server/api/feed/_shared.ts")

  assert.match(types, /videoTitle\?: string/)
  assert.match(mapper, /videoTitle:\s*stripHtml\(firstString\(entity,\s*\["videoTitle",\s*"video_title"\]\)\)/)
})

test("reels display the video title with post text as fallback", () => {
  const page = read("src/reels/presentation/pages/ReelsPage.vue")

  assert.match(page, /v-if="activeVideoTitle" class="reels-page__caption"/)
  assert.match(page, /activeReel\.value\?\.videoTitle \|\| activeReel\.value\?\.text/)
})

test("reel avatar and author name navigate through the backend username path", () => {
  const page = read("src/reels/presentation/pages/ReelsPage.vue")

  assert.match(page, /v-if="activeReel\.authorPath"[\s\S]*?:to="activeReel\.authorPath"[\s\S]*?reels-page__author-link/)
  assert.match(page, /:to="activeReel\.authorPath"[\s\S]*?class="reels-page__author-name"/)
})
