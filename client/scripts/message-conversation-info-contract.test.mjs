import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8")
const readRoot = relativePath => readFile(new URL(`../../${relativePath}`, import.meta.url), "utf8")

test("one-to-one info panel uses backend mute, search, and shared-content APIs", async () => {
  const [
    backendChat,
    bridge,
    muteRoute,
    searchRoute,
    contentRoute,
    repository,
    composable,
    panel,
  ] = await Promise.all([
    readRoot("api/v2/endpoints/chat.php"),
    read("server/api/messages/_shared.ts"),
    read("server/api/messages/conversation-notifications.post.ts"),
    read("server/api/messages/conversation-search.get.ts"),
    read("server/api/messages/shared-content.get.ts"),
    read("src/messages/infrastructure/repositories/ApiMessagesRepository.ts"),
    read("src/messages/application/composables/useUserConversationInfo.ts"),
    read("src/messages/presentation/components/UserDetailPanel.vue"),
  ])

  assert.match(backendChat, /page_id", 0/)
  assert.match(backendChat, /group_id", 0/)
  assert.match(bridge, /type: "get_media"/)
  assert.match(bridge, /mediaTypes = \["images", "videos", "docs", "links"\]/)
  assert.match(muteRoute, /updateUserConversationNotifications/)
  assert.match(searchRoute, /searchUserConversation/)
  assert.match(contentRoute, /fetchUserConversationSharedContent/)
  assert.match(repository, /setConversationNotifications/)
  assert.match(repository, /searchConversation/)
  assert.match(repository, /getSharedContent/)
  assert.match(composable, /watchDebounced/)
  assert.match(panel, /i-ph-bell-slash-fill/)
  assert.match(panel, /searchResults/)
  assert.match(panel, /sharedContent\.media/)
  assert.match(panel, /sharedContent\.files/)
  assert.match(panel, /sharedContent\.links/)
})
