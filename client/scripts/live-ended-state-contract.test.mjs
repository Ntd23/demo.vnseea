// English description: Verifies that ended livestreams are deleted and removed from every Nuxt feed surface.

import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const repoRoot = new URL("../../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("ending a livestream deletes its timeline post in web, mobile, and webhook flows", async () => {
  const [webHandler, mobileHandler, webhook] = await Promise.all([
    readRepo("xhr/live.php"),
    readRepo("api/v2/endpoints/live.php"),
    readRepo("xhr/livekit_webhook.php"),
  ])

  const webEnd = webHandler.slice(
    webHandler.indexOf("if ($s == 'delete')"),
    webHandler.indexOf("if ($s == 'create_thumb')"),
  )
  const mobileEnd = mobileHandler.slice(
    mobileHandler.indexOf("if ($_POST['type'] == 'delete')"),
    mobileHandler.indexOf("if ($_POST['type'] == 'create_thumb')"),
  )
  const webhookEnd = webhook.slice(
    webhook.indexOf("function Wo_LiveKitWebhookCleanupLivePost"),
    webhook.indexOf("function Wo_LiveKitWebhookSyncLive"),
  )

  assert.match(webEnd, /VNSEEA_DeleteLivePost\s*\(/)
  assert.match(webEnd, /'post_deleted'\s*=>\s*\$deleted\s*\?\s*1\s*:\s*0/)
  assert.match(mobileEnd, /VNSEEA_DeleteLivePost\s*\(/)
  assert.match(mobileEnd, /'post_deleted'\s*=>\s*1/)
  assert.match(webhookEnd, /VNSEEA_DeleteLivePost\s*\([^,]+,\s*true\s*\)/)
})

test("an offline live player removes its card through the shared realtime store", async () => {
  const [card, player, store] = await Promise.all([
    readClient("src/feed/presentation/components/PostCard.vue"),
    readClient("src/feed/presentation/components/LivePostPlayer.vue"),
    readClient("src/feed/application/stores/usePostRealtimeStore.ts"),
  ])

  assert.match(card, /@ended="handleLiveEnded"/)
  assert.match(card, /postRealtimeStore\.markDeleted\(post\.value\.id\)/)
  assert.match(player, /if \(liveState\.value === "offline"\) \{\s*reportEnded\(\)/)
  assert.match(store, /function markDeleted\(postIdValue: number \| string\)/)
  assert.match(store, /deletedPostIds\.value = \{ \.\.\.deletedPostIds\.value, \[postId\]: true \}/)
})
