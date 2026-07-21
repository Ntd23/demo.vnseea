// Description: Verifies that tagged message recipients use a removable Nuxt UI listbox and default to selecting all visible users.
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const chatListPath = new URL("../src/messages/presentation/components/ChatList.vue", import.meta.url)
const inboxPath = new URL("../src/messages/application/composables/useMessagesInbox.ts", import.meta.url)
const messagesPagePath = new URL("../src/messages/presentation/pages/MessagesPage.vue", import.meta.url)
const chatWidgetPath = new URL("../src/navigation/presentation/components/ChatWidget.vue", import.meta.url)
const chatWidgetViewModelPath = new URL("../src/navigation/application/view-models/useChatWidgetVM.ts", import.meta.url)

test("tagged recipients render as a removable UListbox", async () => {
  const source = await readFile(chatListPath, "utf8")

  assert.match(source, /<UListbox[\s\S]*?v-model="selectedRecipientIdModel"/)
  assert.match(source, /<UListbox[\s\S]*?multiple/)
  assert.match(source, /selected-icon="i-ph-x-bold"/)
  assert.match(source, /import UListbox from "@nuxt\/ui\/components\/Listbox\.vue"/)
  assert.match(source, /\.cl-recipient-listbox\s*\{[\s\S]*?max-height:\s*108px;/)
  assert.doesNotMatch(source, /cl-recipient-chip/)
  assert.match(source, /<div v-if="activeTab !== 'multi'" class="cl-scroll-list/)
  assert.ok(
    source.indexOf('class="cl-multi-actions"') < source.indexOf('class="cl-recipient-heading"'),
    "the send action should render above the recipient list",
  )
})

test("selecting a tag defaults to all visible recipients", async () => {
  const source = await readFile(inboxPath, "utf8")

  assert.match(source, /watch\(\[activeTagFilter, filteredContacts, activeTab\]/)
  assert.match(source, /selectedRecipientIds\.value = visibleRecipientIds\.value/)
  assert.match(source, /function setSelectedRecipientIds\(userIds: number\[\]\)/)
})

test("listbox selection updates the inbox recipient state", async () => {
  const source = await readFile(messagesPagePath, "utf8")

  assert.match(source, /@update:selected-recipient-ids="setSelectedRecipientIds"/)
})

test("message tag filters use searchable Nuxt UI select menus", async () => {
  const [chatList, chatWidget] = await Promise.all([
    readFile(chatListPath, "utf8"),
    readFile(chatWidgetPath, "utf8"),
  ])

  assert.match(chatList, /<USelectMenu[\s\S]*?:items="tagFilterItems"/)
  assert.match(chatWidget, /<USelectMenu[\s\S]*?:items="sendTagFilterItems"/)
  assert.doesNotMatch(chatList, /<select[\s>]/)
  assert.doesNotMatch(chatWidget, /<select[\s>]/)
})

test("chat widget recipients use the same removable two-row listbox", async () => {
  const [chatWidget, viewModel] = await Promise.all([
    readFile(chatWidgetPath, "utf8"),
    readFile(chatWidgetViewModelPath, "utf8"),
  ])

  assert.match(chatWidget, /<UListbox[\s\S]*?v-model="selectedSendRecipientIdModel"/)
  assert.match(chatWidget, /selected-icon="i-ph-x-bold"/)
  assert.match(chatWidget, /\.chat-widget__recipient-listbox\s*\{[\s\S]*?max-height:\s*108px;/)
  assert.doesNotMatch(chatWidget, /chat-widget__recipient-chip/)
  assert.ok(
    chatWidget.indexOf('class="chat-widget__send-actions chat-widget__send-actions--inline"')
      < chatWidget.indexOf('class="chat-widget__recipient-heading"'),
    "the chat widget send action should render above the recipient list",
  )
  assert.match(viewModel, /function setSelectedSendRecipientIds\(userIds: number\[\]\)/)
  assert.match(viewModel, /selectedSendRecipientIds\.value = visibleSendRecipientIds\.value/)
})
