import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8")

test("Nuxt maps and renders message pin events without a raw token", async () => {
  const [types, mapper, list, vi, en] = await Promise.all([
    read("src/messages/domain/types/messages.types.ts"),
    read("server/api/messages/_shared.ts"),
    read("src/messages/presentation/components/ChatMessageList.vue"),
    read("i18n/locales/vi.json"),
    read("i18n/locales/en.json"),
  ])

  assert.match(types, /systemEvent\?: MessageSystemEvent/)
  assert.match(mapper, /message_pin_event/)
  assert.match(mapper, /system_event/)
  assert.match(mapper, /buildContactPreview[\s\S]*mapMessagePinSystemEvent\(message\)/)
  assert.match(list, /msg\.systemEvent\?\.type === 'message_pinned'/)
  assert.doesNotMatch(list, /\{\{\s*msg\.text\s*\}\}/)
  assert.match(vi, /Bạn đã ghim một tin nhắn/)
  assert.match(en, /You pinned a message/)
})
