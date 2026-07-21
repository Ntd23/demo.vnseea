import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"

const readSource = async path => await readFile(new URL(path, import.meta.url), "utf8")

test("message threads map the backend reaction snapshot after reload", async () => {
  const source = await readSource("../server/api/messages/_shared.ts")

  assert.match(source, /selectedReaction: parseMessageReaction\(entity\.reaction\)/)
  assert.match(source, /reaction\.my_reaction/) 
  assert.match(source, /feedStoryReactionByBackendId\[backendId\]/)
  assert.match(source, /reaction\.top_reactions/)
  assert.match(source, /messageReactionNameMap\[topReaction\.toLowerCase\(\)\]/)
})

test("message reactions use the persistent PHP API endpoint", async () => {
  const source = await readSource("../server/api/messages/_shared.ts")
  const endpoint = await readSource("../../api/v2/endpoints/react_message.php")

  assert.match(source, /\.post<BackendMessageReactionResponse>\(\s*"react_message"/)
  assert.match(source, /id: messageId/)
  assert.match(source, /action: "set"/)
  assert.match(endpoint, /VNSEEA_PublishRealtimeMessageChange\(\$message_id\)/)
})

test("mini chat always requests reactions when opening or loading older messages", async () => {
  const source = await readSource("../src/navigation/application/view-models/useChatWidgetVM.ts")

  assert.match(source, /fetchMiniThread\(\s*contact,\s*true,?\s*\)/)
  assert.match(source, /beforeId: firstMessageId,\s*includeReactions: true/)
  assert.match(source, /const incomingMessageIds = new Set\(incomingThread\.messages\.map\(message => message\.id\)\)/)
  assert.match(source, /return !incomingMessageIds\.has\(msg\.id\)/)
})
