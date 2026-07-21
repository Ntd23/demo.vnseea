import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

import { parseMessageLocationText } from "../src/messages/application/utils/message-location-parser.ts"

const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compile } = requireFromVue("@vue/compiler-dom")
const readClient = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("parses a web location message containing only the map URL", () => {
  const location = parseMessageLocationText(
    "https://v2.vnseea.vn/map?lat=21.026919&lng=105.786405&title=V%E1%BB%8B+tr%C3%AD+c%E1%BB%A7a+b%E1%BA%A1n&avatar=%2Favatar.jpg",
  )

  assert.deepEqual(location, {
    latitude: 21.026919,
    longitude: 105.786405,
    title: "Vị trí của bạn",
    address: "",
    avatarUrl: "/avatar.jpg",
    messageUrl: "https://v2.vnseea.vn/map?lat=21.026919&lng=105.786405&title=V%E1%BB%8B+tr%C3%AD+c%E1%BB%A7a+b%E1%BA%A1n&avatar=%2Favatar.jpg",
  })
})

test("extracts the native map URL after its app-generated intro text", () => {
  const location = parseMessageLocationText(
    "Mình gửi vị trí nhé b<br>https://v2.vnseea.vn/map?lat=21.026919&amp;lng=105.786405&amp;title=V%E1%BB%8B+tr%C3%AD+c%E1%BB%A7a+b%E1%BA%A1n&amp;address=H%C3%A0+N%E1%BB%99i&amp;image=https%3A%2F%2Fv2.vnseea.vn%2Fupload%2Favatar.jpg%3Fcache%3D0",
  )

  assert.equal(location?.latitude, 21.026919)
  assert.equal(location?.longitude, 105.786405)
  assert.equal(location?.title, "Vị trí của bạn")
  assert.equal(location?.address, "Hà Nội")
  assert.equal(location?.avatarUrl, "https://v2.vnseea.vn/upload/avatar.jpg?cache=0")
  assert.ok(location?.messageUrl.startsWith("https://v2.vnseea.vn/map?"))
})

test("rejects map links with missing or out-of-range coordinates", () => {
  assert.equal(parseMessageLocationText("https://v2.vnseea.vn/map?title=Missing"), null)
  assert.equal(parseMessageLocationText("https://v2.vnseea.vn/map?lat=91&lng=105"), null)
})

test("location chat templates compile after sender-aware title handling", () => {
  for (const path of [
    "src/messages/presentation/components/ChatBubble.vue",
    "src/messages/presentation/components/ChatMessageList.vue",
    "src/messages/presentation/components/ChatWindow.vue",
    "src/messages/presentation/components/MessageLocationCard.vue",
    "src/navigation/presentation/components/ChatWidget.vue",
  ]) {
    const source = readClient(path)
    const templateStart = source.indexOf("<template>")
    const scriptStart = source.indexOf("<script")
    const templateEnd = source.lastIndexOf("</template>", scriptStart)
    const template = source.slice(templateStart + "<template>".length, templateEnd)
    const errors = []

    compile(template, {
      expressionPlugins: ["typescript"],
      onError: error => errors.push(error.message),
    })
    assert.deepEqual(errors, [], `${path}: ${errors.join("; ")}`)
  }

  const vietnamese = JSON.parse(readClient("i18n/locales/vi.json"))
  const english = JSON.parse(readClient("i18n/locales/en.json"))
  assert.equal(vietnamese.pages.messagesPage.locationSenderTitle, "Vị trí của {name}")
  assert.equal(english.pages.messagesPage.locationSenderTitle, "{name}'s location")

  const messageList = readClient("src/messages/presentation/components/ChatMessageList.vue")
  const chatWindow = readClient("src/messages/presentation/components/ChatWindow.vue")
  const locationCard = readClient("src/messages/presentation/components/MessageLocationCard.vue")
  assert.match(messageList, /:avatar="msg\.avatar \|\| \(!msg\.isMine \? contactAvatar : undefined\)"/)
  assert.match(messageList, /:author-name="getMessageAuthorName\(msg\)"/)
  assert.match(messageList, /props\.contactName\?\.trim\(\)/)
  assert.match(chatWindow, /:contact-name="contact\.name"/)
  assert.match(locationCard, /const avatarSources = computed/)
  assert.match(locationCard, /props\.avatarUrl\?\.trim\(\)[\s\S]*props\.location\.avatarUrl\.trim\(\)/)
  assert.match(locationCard, /@error="useNextAvatarSource"/)
})

test("mini chat location cards stay balanced and history loading does not force bottom scroll", () => {
  const chatWidget = readClient("src/navigation/presentation/components/ChatWidget.vue")

  assert.match(chatWidget, /miniMessagesPinnedToBottom/)
  assert.match(chatWidget, /:author-name="getMiniMessageAuthorName\(miniSession, message\)"/)
  assert.match(chatWidget, /session\.contact\.type !== "group"[\s\S]*session\.contact\.name\.trim\(\)/)
  assert.match(chatWidget, /previousSession\.lastMessageId !== session\.lastMessageId/)
  assert.match(chatWidget, /target\.scrollTop = target\.scrollHeight - previousScrollHeight[\s\S]*miniMessagesPinnedToBottom\.set\(session\.contactId, false\)/)
  assert.doesNotMatch(chatWidget, /session\.messages\.length\)\.join\(","\)/)
  assert.match(chatWidget, /chat-bubble__wrapper--location[\s\S]*width: 300px !important;[\s\S]*max-width: calc\(100% - 44px\) !important;/)
})
