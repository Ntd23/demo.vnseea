// English description: Protects the caller-side direct call UI and immediate answer synchronization contract.

import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("the global call host can render outgoing state independently from incoming polling", async () => {
  const app = await readClient("app/app.vue")

  assert.match(app, /<MessagesMessageCallGlobalHost[\s\S]*?:poll-incoming="shouldPollMessageCalls"/)
  assert.doesNotMatch(app, /v-if="shouldMountMessageCallHost"/)
  assert.match(app, /const shouldPollMessageCalls = computed\(\(\) => Boolean\(backendUserSession\.value\)\)/)
})

test("the caller sees ringing UI before the backend create request finishes", async () => {
  const callsComposable = await readClient("src/messages/application/composables/useMessageCalls.ts")
  const startCallBlock = callsComposable.match(
    /const startCall = async[\s\S]*?const startGroupCall = async/,
  )?.[0] || ""

  const optimisticStateIndex = startCallBlock.indexOf('direction: "outgoing"')
  const backendRequestIndex = startCallBlock.indexOf("await repository.createCall")

  assert.ok(optimisticStateIndex >= 0, "Outgoing ringing state is missing")
  assert.ok(backendRequestIndex >= 0, "Backend create request is missing")
  assert.ok(
    optimisticStateIndex < backendRequestIndex,
    "Outgoing ringing state must be set before awaiting the backend",
  )
  assert.match(startCallBlock, /if \(result\.busy \|\| result\.id <= 0\) \{\s*ringingCall\.value = null/s)
  assert.match(startCallBlock, /catch \(error: any\) \{\s*ringingCall\.value = null/s)
})

test("the caller checks for an already answered call without waiting for the first interval", async () => {
  const callsComposable = await readClient("src/messages/application/composables/useMessageCalls.ts")
  const pollingBlock = callsComposable.match(
    /const pollOutgoingAnswer =[\s\S]*?const startCall = async/,
  )?.[0] || ""

  assert.match(pollingBlock, /void syncOutgoingAnswer\(id, type\)/)
  assert.match(pollingBlock, /outgoingPoll = setInterval/)
})
