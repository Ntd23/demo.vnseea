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

test("photos lightbox renders the original post content instead of the source label", () => {
  const page = read("src/photos/presentation/pages/PhotosPage.vue")
  const mapper = read("src/photos/application/composables/usePhotosData.ts")

  assert.match(mapper, /postText:\s*post\.text/)
  assert.match(page, /:caption="currentPhoto\?\.postText \|\| ''"/)
  assert.doesNotMatch(page, /:caption="currentPhoto\?\.albumTitle/)
})

test("photos lightbox exposes the original post share flow", () => {
  const page = read("src/photos/presentation/pages/PhotosPage.vue")
  const viewModel = read("src/photos/application/view-models/usePhotosPageVM.ts")
  const mapper = read("src/photos/application/composables/usePhotosData.ts")

  assert.match(mapper, /canShare:\s*post\.permissions\.canShare/)
  assert.match(mapper, /shares:\s*post\.stats\.shares/)
  assert.match(page, /:can-share="currentPhoto\?\.canShare \|\| false"/)
  assert.match(page, /@share="openCurrentPhotoShare"/)
  assert.match(page, /<FeedShareModal/)
  assert.match(page, /:share-url="currentPhotoShareUrl"/)
  assert.match(viewModel, /function handleCurrentPhotoShared\(\)/)
})
