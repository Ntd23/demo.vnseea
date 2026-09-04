import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const source = readFileSync(
  new URL("../src/navigation/application/view-models/useChatWidgetVM.ts", import.meta.url),
  "utf8",
)
const widgetSource = readFileSync(
  new URL("../src/navigation/presentation/components/ChatWidget.vue", import.meta.url),
  "utf8",
)

test("chat widget caches inbox, tags, and mini threads per authenticated user", () => {
  assert.match(source, /currentOwnerKey = computed/)
  assert.match(source, /navigation:chat-widget:inbox:\$\{currentOwnerKey\.value\}/)
  assert.match(source, /navigation:chat-widget:tags:\$\{currentOwnerKey\.value\}/)
  assert.match(source, /cache:chat-widget:\$\{currentOwnerKey\.value\}:\$\{segment\}/)
  assert.match(source, /storageKey\(`thread:\$\{contact\.id\}`\)/)
  assert.doesNotMatch(source, /sessionStorage\.setItem\("cache:chat-widget:inbox"/)
  assert.doesNotMatch(source, /sessionStorage\.setItem\("cache:chat-widget:tags"/)
  assert.doesNotMatch(source, /sessionStorage\.setItem\(`cache:chat-widget:thread:/)
})

test("identity changes clear stale mini sessions and reconnect realtime for the new owner", () => {
  assert.match(source, /watch\(currentOwnerId/)
  assert.match(source, /disconnectRealtime\(\)[\s\S]*pendingMiniThreadRequests\.clear\(\)[\s\S]*cachedThreads\.clear\(\)/)
  assert.match(source, /miniChatSessions\.value = \[\]/)
  assert.match(source, /clearInboxData\(\)/)
  assert.match(source, /clearTagsData\(\)/)
  assert.match(source, /ownerId !== currentOwnerId\.value/)
  assert.match(source, /await connectRealtime\(\)/)
})

test("socket reconnects and only refreshes data for its authenticated owner", () => {
  assert.match(source, /reconnection: true/)
  assert.match(source, /reconnectionAttempts: Infinity/)
  assert.match(source, /reconnectionDelayMax: 10000/)
  assert.match(source, /if \(ownerId === currentOwnerId\.value\)[\s\S]*refreshFromIncomingMessage\(\)/)
  assert.match(source, /if \(!socket\.value\)[\s\S]*connectRealtime\(\)/)
  assert.doesNotMatch(source, /reconnection: false/)
})

test("socket connection suspends inbox polling and disconnect restores a slower fallback", () => {
  assert.match(source, /const INBOX_FALLBACK_INTERVAL_MS = 10000/)
  assert.match(source, /realtimeConnected\.value = true\s+stopRefreshTimer\(\)/)
  assert.match(source, /realtimeConnected\.value = false[\s\S]*?startRefreshTimer\(\)/)
  assert.match(source, /!realtimeConnected\.value && !isInboxRefreshPaused\.value/)
  assert.doesNotMatch(source, /const INBOX_REFRESH_INTERVAL_MS = 2000/)
})

test("mini-chat reply previews stay scoped to their conversation", () => {
  assert.match(widgetSource, /const miniReplyContactId = ref\(""\)/)
  assert.match(widgetSource, /hasMiniReplyFor\(miniSession\.contactId\)/)
  assert.match(widgetSource, /@reply="replyToMiniMessage\(miniSession\.contactId, message\)"/)
  assert.match(widgetSource, /buildMiniReplyText\(trimmed, contactId\)/)
})

test("mini-chat reaction picker closes when clicking outside its trigger or popup", () => {
  assert.match(widgetSource, /activeMiniReactionPickerId\.value !== null/)
  assert.match(widgetSource, /\.closest\("\.chat-bubble__message-tool-wrap, \.chat-bubble__reaction-picker"\)/)
  assert.match(widgetSource, /activeMiniReactionPickerId\.value = null/)
})

test("contact avatars open the conversation directly without a context popup", () => {
  assert.match(widgetSource, /class="chat-widget__contact-avatar-btn"[\s\S]*?@click\.stop="openMiniChat\(contact\)"/)
  assert.doesNotMatch(widgetSource, /openAvatarMenu/)
  assert.doesNotMatch(widgetSource, /avatarMenuContact/)
  assert.doesNotMatch(widgetSource, /chat-widget__avatar-menu/)
})

test("group message avatars open the same user actions as one-to-one messages", () => {
  assert.match(widgetSource, /const isGroupMember = contact\.type === "group" && senderId > 0/)
  assert.match(widgetSource, /type: isGroupMember \? "user" : contact\.type/)
  assert.match(widgetSource, /userId: isGroupMember \? senderId : contact\.userId/)
  assert.match(widgetSource, /profileUrl: message\.authorProfileUrl/)
  assert.match(widgetSource, /messageAvatarMenuContact\.type === 'user'/)
})
