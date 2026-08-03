import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

const root = new URL("../../", import.meta.url)
const clientRoot = new URL("../", import.meta.url)
const readRoot = path => readFile(new URL(path, root), "utf8")
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("tag update is owner-scoped in the shared PHP service", async () => {
  const source = await readRoot("assets/includes/functions_one.php")

  assert.match(source, /function Wo_UpdateTagLabel/)
  assert.match(source, /WHERE `id`=\{\$label_id\} AND `owner_id`=\{\$owner_id\}/)
  assert.match(source, /UPDATE .*T_USER_TAG_LABELS/)
})

test("legacy and v2 tag endpoints expose update_label", async () => {
  const legacy = await readRoot("xhr/tags.php")
  const apiV2 = await readRoot("api/v2/endpoints/tags.php")

  assert.match(legacy, /\$s == 'update_label'/)
  assert.match(legacy, /Wo_UpdateTagLabel/)
  assert.match(apiV2, /\$action == 'update_label'/)
  assert.match(apiV2, /Wo_UpdateTagLabel/)
})

test("Nuxt tag update is wired through repository, view models, and modal UI", async () => {
  const bridge = await readClient("server/api/messages/tags.post.ts")
  const repository = await readClient("src/messages/infrastructure/repositories/ApiMessagesRepository.ts")
  const modal = await readClient("src/messages/presentation/components/MessageTagsModal.vue")
  const chatWidget = await readClient("src/navigation/presentation/components/ChatWidget.vue")
  const messagesPage = await readClient("src/messages/presentation/pages/MessagesPage.vue")

  assert.match(bridge, /action === "update"/)
  assert.match(bridge, /endpoint: "update_label"/)
  assert.match(repository, /async updateTagLabel/)
  assert.match(modal, /submitUpdateTag/)
  assert.match(modal, /props\.updateTag/)
  assert.match(chatWidget, /:update-tag="updateTagLabel"/)
  assert.match(messagesPage, /:update-tag="updateTagLabel"/)
})
