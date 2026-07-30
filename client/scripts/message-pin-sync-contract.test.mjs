import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const clientRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const read = path => readFileSync(resolve(clientRoot, path), "utf8")

const bridge = read("server/api/messages/_shared.ts")
const bubble = read("src/messages/presentation/components/ChatBubble.vue")
const messagesPage = read("src/messages/presentation/pages/MessagesPage.vue")
const widget = read("src/navigation/presentation/components/ChatWidget.vue")
const pinnedBar = read("src/messages/presentation/components/PinnedMessagesBar.vue")

assert.match(bridge, /"get_pin_message"/, "threads must read the shared mobile/web pin API")
assert.match(bridge, /"pin_message"/, "pin actions must use the shared mobile/web pin API")
assert.match(bridge, /pinnedMessages: await pinnedMessagesPromise/g, "every thread type must return pinned messages")
assert.match(bridge, /enrichSharedPostMessages\(event, pinnedMessages\)/, "pinned shared posts must receive their full card metadata")
assert.match(bridge, /mapBackendMessageProduct\(entity, resolveMediaUrl\)/, "native-app product messages must map into a web product card")
assert.match(bubble, /i-ph-dots-three-vertical-bold/, "message actions must use the three-dot icon")
assert.match(bubble, /v-if="canDelete"/, "only owned messages may expose delete")
assert.match(bubble, /v-if="canPin/, "all normal messages may expose pin")
assert.match(messagesPage, /:pinned-messages="pinnedMessages"/, "the full messages page must render synchronized pins")
assert.match(widget, /miniSession\.thread\.pinnedMessages/, "the chat widget must render synchronized pins")
assert.match(pinnedBar, /sharedPost\?\.job/, "pinned jobs must render a dedicated preview")
assert.match(pinnedBar, /sharedPost\?\.product/, "pinned shared products must render a dedicated preview")
assert.match(pinnedBar, /getMessageProductMeta\(message\)/, "pinned native and web products must share the product preview contract")
assert.match(pinnedBar, /getMessageLocationMeta\(message\)/, "pinned locations must render a dedicated preview")

console.log("message pin sync contract: ok")
