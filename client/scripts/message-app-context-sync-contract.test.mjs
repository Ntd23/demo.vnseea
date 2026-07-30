import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const sharedMapper = await readFile(
  new URL("../server/api/messages/_shared.ts", import.meta.url),
  "utf8",
)
const bubbleContent = await readFile(
  new URL("../src/messages/application/utils/message-bubble-content.ts", import.meta.url),
  "utf8",
)
const appMessagesEndpoint = await readFile(
  new URL("../../api/v2/endpoints/get_user_messages.php", import.meta.url),
  "utf8",
)
const chatWidget = await readFile(
  new URL("../src/navigation/presentation/components/ChatWidget.vue", import.meta.url),
  "utf8",
)
const messageList = await readFile(
  new URL("../src/messages/presentation/components/ChatMessageList.vue", import.meta.url),
  "utf8",
)

assert.match(
  sharedMapper,
  /const reply = asRecord\(entity\.reply\)/,
  "The web mapper must consume the original message nested by the app API.",
)
assert.match(
  sharedMapper,
  /asNumber\(entity\.reply_id\) \|\| asNumber\(reply\.id\)/,
  "The mapped reply must retain its original message id.",
)
assert.match(
  sharedMapper,
  /return `\$\{MESSAGE_REPLY_PREFIX\}\$\{payload\}\\n\$\{body\}`/,
  "App replies must be converted to the same inline reply contract used by web messages.",
)
assert.match(
  sharedMapper,
  /const marketplaceContext = asRecord\(entity\.marketplace_context\)/,
  "The web mapper must consume marketplace context sent by the app API.",
)
assert.match(
  sharedMapper,
  /asNumber\(marketplaceContext\.product_id\)/,
  "Marketplace context must resolve the product card id.",
)
assert.match(
  sharedMapper,
  /firstString\(marketplaceContext, \["name", "title"\]\)/,
  "Marketplace context must resolve the product card title.",
)
assert.match(
  bubbleContent,
  /replyLine\?\.startsWith\(MESSAGE_REPLY_PREFIX\)/,
  "Both chat surfaces must parse the shared inline reply contract.",
)
assert.match(
  chatWidget,
  /:reply-title="!message\.isDeleted && getMiniReplyMeta\(message\) \? getMiniReplyTitle\(message\) : undefined"/,
  "The chat widget must render the original message attached to an app reply.",
)
assert.match(
  chatWidget,
  /:product-card="message\.isDeleted \? undefined : getMiniProductMeta\(message\)\?\.card"/,
  "The chat widget must render app marketplace questions with their product card.",
)
assert.match(
  messageList,
  /:reply-title="getReplyMeta\(msg\) && !msg\.isDeleted \? getReplyTitle\(msg\) : undefined"/,
  "The Messages page must render the original message attached to an app reply.",
)
assert.match(
  messageList,
  /:product-card="msg\.isDeleted \? undefined : getProductMeta\(msg\)\?\.card"/,
  "The Messages page must render app marketplace questions with their product card.",
)
assert.match(
  appMessagesEndpoint,
  /\['reply'\]\['messageUser'\]\['name'\]/,
  "The app response must retain the replied message sender name for web display.",
)

console.log("message app context sync contract: ok")
