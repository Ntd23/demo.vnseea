import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const repoRoot = new URL("../../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("ending a livestream retains the timeline post in web, mobile, and webhook flows", async () => {
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

  for (const source of [webEnd, mobileEnd, webhookEnd]) {
    assert.match(source, /'live_ended'\s*=>\s*1/)
    assert.match(source, /'live_time'\s*=>\s*0/)
    assert.doesNotMatch(source, /Wo_DeletePost\s*\(/)
  }
})

test("ended livestreams remain visible with their poster and a final viewer state", async () => {
  const [card, player, mapper] = await Promise.all([
    readClient("src/feed/presentation/components/PostCard.vue"),
    readClient("src/feed/presentation/components/LivePostPlayer.vue"),
    readClient("server/api/feed/_shared.ts"),
  ])

  assert.doesNotMatch(card, /shouldRenderPost/)
  assert.match(card, /:poster-url="livePosterUrl"/)
  assert.match(player, /v-if="!connected && posterUrl"/)
  assert.match(player, /if \(liveState\.value === "offline"\) return/)
  assert.match(player, /void refreshHeartbeat\(\)/)
  assert.match(player, /liveState !== 'offline' && \(errorMessage \|\| joinError\)/)
  assert.match(mapper, /liveEnded \|\| !liveTime \|\| liveHeartbeatAge > 45\s*\?\s*"offline"/)
})

test("joining a just-ended web livestream returns an offline result instead of an error", async () => {
  const webHandler = await readRepo("xhr/live.php")
  const joinHandler = webHandler.slice(
    webHandler.indexOf("if ($s == 'join')"),
    webHandler.indexOf("if ($s == 'check_comments')"),
  )

  assert.match(joinHandler, /intval\(\$post\['live_ended'\]\) === 1/)
  assert.match(joinHandler, /\$data\['status'\]\s*=\s*200/)
  assert.match(joinHandler, /\$data\['stream_state'\]\s*=\s*'offline'/)
  const endedBranch = joinHandler.slice(
    joinHandler.indexOf("else if (intval($post['live_ended'])"),
    joinHandler.indexOf("} else {", joinHandler.indexOf("else if (intval($post['live_ended'])")),
  )
  assert.doesNotMatch(endedBranch, /\$data\['removed'\]\s*=\s*'yes'/)
})
