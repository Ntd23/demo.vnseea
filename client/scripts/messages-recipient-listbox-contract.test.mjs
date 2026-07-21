// Description: Verifies that tagged message recipients use a removable Nuxt UI listbox and default to selecting all visible users.
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const chatListPath = new URL("../src/messages/presentation/components/ChatList.vue", import.meta.url)
const inboxPath = new URL("../src/messages/application/composables/useMessagesInbox.ts", import.meta.url)
const messagesPagePath = new URL("../src/messages/presentation/pages/MessagesPage.vue", import.meta.url)

test("tagged recipients render as a removable UListbox", async () => {
  const source = await readFile(chatListPath, "utf8")

  assert.match(source, /<UListbox[\s\S]*?v-model="selectedRecipientIdModel"/)
  assert.match(source, /<UListbox[\s\S]*?multiple/)
  assert.match(source, /selected-icon="i-ph-x-bold"/)
  assert.match(source, /import UListbox from "@nuxt\/ui\/components\/Listbox\.vue"/)
  assert.match(source, /\.cl-recipient-listbox\s*\{[\s\S]*?max-height:\s*108px;/)
  assert.doesNotMatch(source, /cl-recipient-chip/)
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
