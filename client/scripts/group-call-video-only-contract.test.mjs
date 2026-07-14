import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

const root = new URL("../../", import.meta.url)
const clientRoot = new URL("../", import.meta.url)
const readRoot = path => readFile(new URL(path, root), "utf8")
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("Nuxt creates group calls with the canonical video-only request", async () => {
  const bff = await readClient("server/api/messages/calls/group/create.post.ts")
  const incomingBff = await readClient("server/api/messages/calls/group/incoming.get.ts")
  const joinBff = await readClient("server/api/messages/calls/group/join.post.ts")
  const repositoryContract = await readClient("src/messages/domain/repositories/MessageCallsRepository.ts")
  const callsComposable = await readClient("src/messages/application/composables/useMessageCalls.ts")
  const callTypes = await readClient("src/messages/domain/types/calls.types.ts")

  assert.match(bff, /call_type:\s*["']video["']/)
  assert.doesNotMatch(bff, /normalizeCallType\(body\.type\)/)
  assert.doesNotMatch(bff, /body\.type/)
  assert.match(bff, /type:\s*["']video["']/)
  assert.match(incomingBff, /type:\s*["']video["']/)
  assert.match(joinBff, /type:\s*["']video["']/)
  assert.match(repositoryContract, /createGroupCall\(input:\s*\{\s*groupId:\s*number\s*\}\)/s)
  assert.doesNotMatch(repositoryContract, /createGroupCall\(input:[\s\S]*?type:\s*MessageCallType[\s\S]*?\}/)
  assert.match(callsComposable, /const startGroupCall = async \(contact: MessageContact\)/)
  assert.match(callsComposable, /repository\.createGroupCall\(\{\s*groupId: contact\.groupId,?\s*\}\)/s)
  assert.match(callTypes, /MessageGroupCallResult[\s\S]*?type:\s*["']video["']/)
  assert.match(callTypes, /MessageIncomingGroupCall[\s\S]*?type:\s*["']video["']/)
})

test("Nuxt group chat exposes only the video call action", async () => {
  const chatWindow = await readClient("src/messages/presentation/components/ChatWindow.vue")
  const chatWidget = await readClient("src/navigation/presentation/components/ChatWidget.vue")

  const groupActions = chatWindow.match(/<template v-else-if="contact\.type === 'group'">([\s\S]*?)<\/template>/)?.[1] || ""
  assert.match(groupActions, /handleStartCall\('video'\)/)
  assert.doesNotMatch(groupActions, /handleStartCall\('audio'\)/)
  assert.doesNotMatch(groupActions, /i-ph-phone-bold/)

  assert.match(chatWidget, /v-if="miniSession\.contact\.type === 'user'"[\s\S]*?startMiniCall\(miniSession, 'audio'\)/)
  assert.doesNotMatch(chatWidget, /miniSession\.contact\.type === 'group'[^\n]*groupAudioCall/)
  assert.match(chatWidget, /startGroupCall\(contact\)/)
  assert.doesNotMatch(chatWidget, /startGroupCall\(contact, type\)/)
})

test("PHTML exposes no new group audio-call entrypoint while retaining legacy reads", async () => {
  const groupTab = await readRoot("themes/wowonder/layout/chat/group-tab.phtml")
  const messages = await readRoot("themes/wowonder/layout/messages/content.phtml")
  const script = await readRoot("themes/wowonder/javascript/script.js")
  const functions = await readRoot("assets/includes/functions_two.php")

  assert.doesNotMatch(groupTab, /Wo_GenerateGroupVoiceCall/)
  assert.doesNotMatch(messages, /Wo_GenerateGroupVoiceCall/)
  assert.doesNotMatch(script, /function Wo_GenerateGroupVoiceCall/)
  assert.match(script, /function Wo_JoinGroupCall[\s\S]*?callType = ['"]video['"]/)
  assert.match(groupTab, /Wo_GenerateGroupVideoCall/)
  assert.doesNotMatch(groupTab, /activeGroupCall\['call_type'\]/)
  assert.match(messages, /Wo_GenerateGroupVideoCall/)
  assert.match(functions, /group_call_audio/)
  assert.match(functions, /Đã bắt đầu cuộc gọi âm thanh/)
})

test("Nuxt group room keeps official LiveKit track attachment and camera controls", async () => {
  const session = await readClient("src/messages/application/composables/useGroupCallRoomSession.ts")
  const page = await readClient("src/messages/presentation/pages/MessageGroupCallPage.vue")
  const callTypes = await readClient("src/messages/domain/types/calls.types.ts")
  const bridge = await readClient("server/api/messages/calls/group/_shared.ts")

  assert.match(session, /participant\.videoTrack\.attach\(\)/)
  assert.match(session, /track\.attach\(\)/)
  assert.match(session, /setCameraEnabled\(next\)/)
  assert.doesNotMatch(session, /payload\.value\?*\.type\s*===\s*["']audio["']/)
  assert.match(page, /@click="toggleCamera"/)
  assert.match(page, /@click="flipCamera"/)
  assert.doesNotMatch(page, /payload\?\.type\s*===\s*['"]audio['"]/)
  assert.doesNotMatch(page, /payload\?\.type\s*===\s*['"]video['"]/)
  assert.match(callTypes, /MessageGroupCallPayload[\s\S]*?type:\s*["']video["']/)
  assert.match(bridge, /type:\s*["']video["']/)
})
