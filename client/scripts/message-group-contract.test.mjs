import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const shared = await readFile(
  new URL("../server/api/messages/_shared.ts", import.meta.url),
  "utf8",
)
const types = await readFile(
  new URL("../src/messages/domain/types/messages.types.ts", import.meta.url),
  "utf8",
)
const repository = await readFile(
  new URL("../src/messages/infrastructure/repositories/ApiMessagesRepository.ts", import.meta.url),
  "utf8",
)
const inbox = await readFile(
  new URL("../src/messages/application/composables/useMessagesInbox.ts", import.meta.url),
  "utf8",
)

assert.match(types, /replyId\?: number/)
assert.match(types, /mentionedUserIds\?: number\[\]/)
assert.match(repository, /formData\.append\("replyId", String\(input\.replyId\)\)/)
assert.match(repository, /mentionedUserIds/)
assert.match(shared, /replyId\?: number/)
assert.match(shared, /mentionedUserIds\?: number\[\]/)
assert.match(shared, /reply_id: input\.replyId/)
assert.match(shared, /mentioned_user_ids:/)
assert.match(inbox, /replyId: replyTarget\.value\?\.id/)
assert.doesNotMatch(
  inbox,
  /const text = getMessageLocationMeta[\s\S]+buildReplyMessageText/,
  "new Web replies must not serialize quoted metadata into the message body",
)

console.log("message group contract: ok")
