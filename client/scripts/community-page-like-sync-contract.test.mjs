import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("liked-pages records are normalized as liked even when the backend omits is_liked", () => {
  const mapper = read("server/api/community/_shared.ts")

  assert.match(mapper, /liked\?: boolean/)
  assert.match(mapper, /liked:\s*options\.liked\s*\?\?\s*isTruthy\(entity\.is_liked\)/)
  assert.match(mapper, /liked:\s*fetch === "liked_pages" \? true : undefined/)
})

test("page card emits the authoritative result after toggling like state", () => {
  const card = read("src/community/presentation/components/PageCard.vue")
  const cardVm = read("src/community/application/view-models/useCommunityPageCardVM.ts")

  assert.match(card, /@click\.prevent="handleCardLike"/)
  assert.match(card, /emit\("liked-change", updatedPage\)/)
  assert.match(cardVm, /return updatedPage/)
})

test("page directory synchronizes suggested and favorite caches after like changes", () => {
  const directory = read("src/community/application/view-models/useCommunityPagesDirectoryVM.ts")
  const page = read("src/community/presentation/pages/PagesDirectoryPage.vue")

  assert.match(directory, /community:pages:liked-state/)
  assert.match(directory, /mode\.value !== "favorite" \|\| page\.liked/)
  assert.match(directory, /"community:pages:suggested"/)
  assert.match(directory, /"community:pages:favorite"/)
  assert.match(directory, /"community:pages:counts"/)
  assert.match(page, /@liked-change="handlePageLikedChange"/)
})

test("suggested pages show like feedback, liked-pages show unlike feedback, and the backend returns the complete list", () => {
  const directory = read("src/community/application/view-models/useCommunityPagesDirectoryVM.ts")
  const backend = read("../api/v2/endpoints/get-community.php")

  assert.match(directory, /mode\.value === "suggested" && liked/)
  assert.match(directory, /mode\.value === "favorite" && !liked/)
  assert.match(directory, /community\.pagesDirectory\.likedSuccessTitle/)
  assert.match(directory, /community\.pagesDirectory\.unlikedSuccessTitle/)
  assert.match(directory, /community\.pagesDirectory\.likedSuccessDescription/)
  assert.match(backend, /Wo_GetLikes\(\$user_id,\s*'profile',\s*\$liked_pages_limit,\s*\$liked_pages_offset\)/)
  assert.doesNotMatch(backend, /profile_sidebar.*likes_data/)
})
