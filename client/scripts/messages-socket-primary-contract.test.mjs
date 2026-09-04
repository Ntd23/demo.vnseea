// Description: Protects socket-primary inbox and typing behavior from unconditional polling regressions.

import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("messages inbox relies on realtime fallback instead of a second page-level refresh loop", async () => {
  const pageViewModel = await readClient("src/messages/application/view-models/useMessagesPageVM.ts")

  const mountedBlock = pageViewModel.match(/onMounted\(\(\) => \{[\s\S]*?onBeforeUnmount/)?.[0] || ""
  assert.doesNotMatch(mountedBlock, /setInterval\([\s\S]*?inbox\.refreshInbox\(\)/)
  assert.match(pageViewModel, /groupDetailsRefreshTimer/)
})

test("direct typing status polling stops while socket is connected", async () => {
  const realtime = await readClient("src/messages/application/composables/useMessageRealtime.ts")

  assert.match(realtime, /isGroupThread\.value \|\| \(isUserThread\.value && !connected\.value\)/)
  assert.match(realtime, /connected\.value = true[\s\S]*?stopTypingStatusSync\(\)/)
  assert.match(realtime, /connected\.value = false[\s\S]*?startTypingStatusSync\(\)/)
  assert.match(realtime, /if \(hasConnectedSocket\(\)\) \{[\s\S]*?socket\.value\?\.emit\("message:typing"/)
  assert.match(realtime, /await options\.repository\.setTyping\(target\.userId\)[\s\S]*?fallbackTypingTargets\.add/)
})

test("realtime token health uses the internal relay URL when configured", async () => {
  const tokenRoute = await readClient("server/api/realtime/token.get.ts")

  assert.match(tokenRoute, /runtimeConfig\.realtimeInternalUrl/)
  assert.match(tokenRoute, /isRealtimeReachable\(realtimeInternalUrl \|\| realtimeUrl\)/)
})
