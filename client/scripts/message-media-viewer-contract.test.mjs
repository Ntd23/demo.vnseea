import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("message image and video attachments open the shared fullscreen viewer", async () => {
  const [bubble, viewer] = await Promise.all([
    readClient("src/messages/presentation/components/ChatBubble.vue"),
    readClient("src/messages/presentation/components/MessageMediaViewer.vue"),
  ])

  assert.match(bubble, /import MessageMediaViewer from "\.\/MessageMediaViewer\.vue"/)
  assert.match(bubble, /v-if="mediaType === 'image' \|\| mediaType === 'gif'"/)
  assert.match(bubble, /v-else-if="mediaType === 'video'"/)
  assert.equal((bubble.match(/@click\.stop="openMediaViewer"/g) ?? []).length, 2)
  assert.match(bubble, /<MessageMediaViewer/)

  assert.match(viewer, /<Teleport to="body">/)
  assert.match(viewer, /role="dialog"/)
  assert.match(viewer, /aria-modal="true"/)
  assert.match(viewer, /event\.key !== "Escape"/)
  assert.match(viewer, /document\.body\.style\.overflow = "hidden"/)
  assert.match(viewer, /type === 'video'/)
  assert.match(viewer, /controls/)
})

test("both full messages and mini chat widget render media through ChatBubble", async () => {
  const [messageList, widget] = await Promise.all([
    readClient("src/messages/presentation/components/ChatMessageList.vue"),
    readClient("src/navigation/presentation/components/ChatWidget.vue"),
  ])

  assert.match(messageList, /<MessagesChatBubble/)
  assert.match(messageList, /:media-url="msg\.isDeleted \? undefined : msg\.mediaUrl"/)
  assert.match(widget, /<ChatBubble/)
  assert.match(widget, /:media-url="message\.isDeleted \? undefined : message\.mediaUrl"/)
})
