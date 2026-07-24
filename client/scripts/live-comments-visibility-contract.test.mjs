import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const livePageUrl = new URL(
  "../src/live/presentation/pages/LivePage.vue",
  import.meta.url,
)

test("livestream comments can be toggled and scrolled on desktop and mobile", async () => {
  const source = await readFile(livePageUrl, "utf8")

  assert.match(source, /const commentsVisible = ref\(true\)/)
  assert.match(source, /@click="toggleComments"/)
  assert.match(source, /commentsVisible \? 'i-ph-chat-circle-dots-bold' : 'i-ph-chat-circle-slash-bold'/)
  assert.match(source, /\.studio__mobile-comments-icon\s*\{[\s\S]*?width:\s*21px;[\s\S]*?height:\s*21px;/)
  assert.match(source, /v-show="commentsVisible" class="studio__side-panel"/)
  assert.match(source, /ref="mobileCommentsEl"[\s\S]*?v-for="item in chatItems"/)
  assert.match(source, /ref="fullscreenCommentsEl"[\s\S]*?v-for="item in chatItems"/)
  assert.doesNotMatch(source, /chatItems\.slice\(-(?:5|8)\)/)
  assert.match(source, /\.studio__mobile-live-comments\s*\{[\s\S]*?max-height:\s*min\(220px,\s*26dvh\)/)
  assert.match(source, /\.studio__mobile-live-comments\s*\{[\s\S]*?overflow-y:\s*auto/)
  assert.match(source, /\.studio__fs-comments\s*\{[\s\S]*?overflow-y:\s*auto/)
  assert.match(source, /overscroll-behavior:\s*contain/)
  assert.match(source, /touch-action:\s*pan-y/)
})
