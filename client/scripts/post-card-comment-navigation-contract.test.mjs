// English description: Verifies feed cards route comment intents to post detail while only detail pages enable comment composition.

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("feed post cards route comment intents to the canonical post detail page", () => {
  const source = read("src/feed/presentation/components/PostCard.vue")

  assert.match(source, /appRoutes\.postDetail\(post\.value\.id\)/)
  assert.match(source, /@click="handleCommentIntent"/)
  assert.match(source, /@comment="handleCommentIntent"/)
  assert.match(source, /navigateTo\(`\$\{appRoutes\.postDetail\(post\.value\.id\)\}#comments`\)/)
})

test("comment composition is opt-in and enabled by the post detail page", () => {
  const card = read("src/feed/presentation/components/PostCard.vue")
  const detailPage = read("src/feed/presentation/pages/PostDetailPage.vue")

  assert.match(card, /enableComments\?: boolean/)
  assert.match(card, /v-if="enableComments" id="comments"/)
  assert.match(card, /:show-composer="enableComments"/)
  assert.match(detailPage, /<FeedPostCard[^>]*enable-comments/)
})

test("comment preview profile links use the backend username path, not the display name", () => {
  const card = read("src/feed/presentation/components/PostCard.vue")
  const mapper = read("server/api/feed/_shared.ts")

  assert.match(card, /v-if="previewComment\?\.authorPath"/)
  assert.match(card, /:to="previewComment\.authorPath"/)
  assert.doesNotMatch(card, /`\/@\$\{previewComment\?\.author\}`/)
  assert.match(mapper, /authorPath:\s*username\s*\?\s*`\/@\$\{username\}`\s*:\s*undefined/)
})
