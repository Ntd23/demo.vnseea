import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

const repoRoot = new URL("../../", import.meta.url)
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("shared live posts stay preview-only and join the original post", async () => {
  const [shareBackend, feedMapper, liveServer, messageMapper, feedCard, messageCard] = await Promise.all([
    readRepo("assets/includes/functions_three.php"),
    readRepo("client/server/api/feed/_shared.ts"),
    readRepo("client/server/api/live/_shared.ts"),
    readRepo("client/server/api/messages/_shared.ts"),
    readRepo("client/src/feed/presentation/components/SharedPostCard.vue"),
    readRepo("client/src/messages/presentation/components/MessageSharedPostCard.vue"),
  ])

  assert.match(shareBackend, /post_data\['stream_name'\]\s*=\s*''/)
  assert.match(shareBackend, /post_data\['live_time'\]\s*=\s*0/)
  assert.match(feedMapper, /const isSharedPost = sharedPostId > 0 \|\| Boolean\(sharedPost\)/)
  assert.match(feedMapper, /const isLive = !isSharedPost/)
  assert.match(liveServer, /requestedPost\?\.sharedPost\?\.isLive/)
  assert.match(liveServer, /\{ post_id: livePostId \}/)
  assert.match(messageMapper, /live: contentPost\.isLive/)
  assert.match(feedCard, /v-if="post\.isLive"/)
  assert.match(messageCard, /message-shared-post--live/)
  assert.match(messageCard, /sharedLiveViewers/)
})
