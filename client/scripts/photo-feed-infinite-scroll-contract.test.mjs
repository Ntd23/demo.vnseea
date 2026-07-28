import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("photos feed automatically loads the next page when its sentinel approaches the viewport", () => {
  const page = read("src/photos/presentation/pages/PhotoPostsPage.vue")

  assert.match(page, /ref="loadMoreSentinel"/)
  assert.match(page, /useIntersectionObserver\(/)
  assert.match(page, /entry\?\.isIntersecting/)
  assert.match(page, /v-if="!allLoaded"/)
  assert.match(page, /v-for="index in 2"/)
  assert.match(page, /photo-posts-page__post-skeleton/)
  assert.match(page, /rootMargin:\s*"600px 0px"/)
  assert.doesNotMatch(page, /@click="loadMore"/)
})

test("photos feed stops pagination when the backend cursor does not advance", () => {
  const viewModel = read("src/photos/application/view-models/usePhotoPostsPageVM.ts")

  assert.match(viewModel, /const previousOffset = nextOffset\.value/)
  assert.match(viewModel, /const allLoaded = computed\(\(\) => !hasMore\.value\)/)
  assert.match(viewModel, /const cursorDidNotAdvance/)
  assert.match(viewModel, /response\.hasMore && newPosts\.length > 0 && !cursorDidNotAdvance/)
})
