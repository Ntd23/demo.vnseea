import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("feed records expose whether their source page is already followed", () => {
  const types = read("src/feed/domain/types/feed.types.ts")
  const mapper = read("server/api/feed/_shared.ts")

  assert.match(types, /sourceFollowing\?: boolean/)
  assert.match(mapper, /sourceFollowing:\s*pageSlug/)
  assert.match(mapper, /pageData\.is_liked/)
})

test("reels only expose the follow action for page-owned videos", () => {
  const vm = read("src/reels/application/view-models/useReelsPageVM.ts")

  assert.match(vm, /activeReel\.value\?\.sourceLabel !== "page"/)
  assert.match(vm, /path\.match\(\/\^\\\/p\\\/\(\[\^\/\?#\]\+\)\//)
  assert.match(vm, /communityRepository\.likePage\(slug\)/)
})

test("page reel follow button renders below the page name and reflects its state", () => {
  const page = read("src/reels/presentation/pages/ReelsPage.vue")

  assert.match(page, /class="reels-page__author-name"[\s\S]*?v-if="showPageFollowButton"/)
  assert.match(page, /@click\.stop="handleFollowActivePage"/)
  assert.match(page, /pages\.pageDetailPage\.followingButton/)
  assert.match(page, /pages\.pageDetailPage\.followFallback/)
})
