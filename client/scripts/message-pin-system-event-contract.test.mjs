import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8")
const readRoot = relativePath => readFile(new URL(`../../${relativePath}`, import.meta.url), "utf8")

test("Nuxt maps and renders pin and unpin events without raw tokens", async () => {
  const [types, mapper, list, vi, en, endpoint, sharedMessages, pushDelivery] = await Promise.all([
    read("src/messages/domain/types/messages.types.ts"),
    read("server/api/messages/_shared.ts"),
    read("src/messages/presentation/components/ChatMessageList.vue"),
    read("i18n/locales/vi.json"),
    read("i18n/locales/en.json"),
    readRoot("api/v2/endpoints/pin_message.php"),
    readRoot("assets/includes/functions_one.php"),
    readRoot("assets/includes/vnseea_push_delivery.php"),
  ])

  assert.match(endpoint, /message_unpin_event/)
  assert.match(endpoint, /message_unpinned/)
  assert.match(endpoint, /message unpin push failed/)
  assert.match(endpoint, /message unpin realtime publish failed/)
  assert.match(sharedMessages, /message_unpinned/)
  assert.match(pushDelivery, /message_unpin_event/)
  assert.match(types, /systemEvent\?: MessageSystemEvent/)
  assert.match(mapper, /message_pin_event/)
  assert.match(mapper, /message_unpin_event/)
  assert.match(mapper, /system_event/)
  assert.match(mapper, /buildContactPreview[\s\S]*mapMessagePinSystemEvent\(message\)/)
  assert.match(list, /v-if="msg\.systemEvent"/)
  assert.match(list, /message_unpinned/)
  assert.doesNotMatch(list, /\{\{\s*msg\.text\s*\}\}/)
  assert.match(vi, /Bạn đã ghim một tin nhắn/)
  assert.match(en, /You pinned a message/)
  assert.match(en, /unpinned a message/)
})
