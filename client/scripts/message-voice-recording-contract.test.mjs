import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import test from "node:test"

const root = new URL("../", import.meta.url)
const read = path => readFile(new URL(path, root), "utf8")
const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compileTemplate, parse } = requireFromVue("@vue/compiler-sfc")

const assertCompiles = (source, filename) => {
  const { descriptor, errors } = parse(source, { filename })
  assert.deepEqual(errors, [])
  const result = compileTemplate({ id: filename, filename, source: descriptor.template?.content || "" })
  assert.deepEqual(result.errors, [])
}

test("voice messages render through the shared app-style waveform player", async () => {
  const [bubble, player, input, mapper] = await Promise.all([
    read("src/messages/presentation/components/ChatBubble.vue"),
    read("src/messages/presentation/components/VoiceMessageCard.vue"),
    read("src/messages/presentation/components/ChatInput.vue"),
    read("server/api/messages/_shared.ts"),
  ])

  assert.match(bubble, /<VoiceMessageCard/)
  assert.match(player, /voice-message-card__waveform/)
  assert.match(player, /seekPlayback/)
  assert.match(player, /@timeupdate="syncCurrentTime"/)
  assert.match(player, /await audio\.play\(\)/)
  assert.match(player, /handlePlaybackError/)
  assert.match(input, /<VoiceMessageCard/)
  assert.match(mapper, /media\.includes\("_soundfile\."\)/)
  assert.match(mapper, /isVoiceRecord[\s\S]*?if \(isVoiceRecord\)[\s\S]*?rawType\.includes\("video"\)/)
  assertCompiles(bubble, "ChatBubble.vue")
  assertCompiles(player, "VoiceMessageCard.vue")
  assertCompiles(input, "ChatInput.vue")
})

test("mini chat recording state belongs to exactly one conversation", async () => {
  const [widget, recorder] = await Promise.all([
    read("src/navigation/presentation/components/ChatWidget.vue"),
    read("src/messages/application/composables/useMessageRecorder.ts"),
  ])

  assert.match(widget, /const miniRecordingContactId = ref\(""\)/)
  assert.match(widget, /isMiniRecordingFor\(miniSession\.contactId\)/)
  assert.match(widget, /miniRecordDraftFor\(miniSession\.contactId\)/)
  assert.match(widget, /record: recordDraft/)
  assert.match(widget, /durationMs: miniRecordDurationMs/)
  assert.match(widget, /formatMiniRecordingDuration\(miniSession\.contactId\)/)
  assert.doesNotMatch(widget, /activeMiniRecordDraft/)
  assert.match(recorder, /discardOnStop/)
  assert.match(recorder, /recorder\.stop\(\)/)
  assert.match(recorder, /stopStream\(\)/)
  assertCompiles(widget, "ChatWidget.vue")
})
