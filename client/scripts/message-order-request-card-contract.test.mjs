import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")
const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compileTemplate, parse } = requireFromVue("@vue/compiler-sfc")

const assertVueTemplateCompiles = (source, filename) => {
  const { descriptor, errors } = parse(source, { filename })
  assert.deepEqual(errors, [], `${filename} must parse as an SFC`)
  const result = compileTemplate({
    id: filename,
    filename,
    source: descriptor.template?.content || "",
  })
  assert.deepEqual(result.errors, [], `${filename} template must compile`)
}

test("market order messages map backend context into a structured card", async () => {
  const [mapper, types, marketEndpoint, canonicalContext, batchHydration] = await Promise.all([
    readClient("server/api/messages/_shared.ts"),
    readClient("src/messages/domain/types/messages.types.ts"),
    readClient("../api/v2/endpoints/market.php"),
    readClient("../assets/includes/functions_one.php"),
    readClient("../assets/includes/vnseea_batch_hydration.php"),
  ])

  assert.match(mapper, /mapBackendMessageOrderRequest/)
  assert.match(mapper, /entity\.market_order/)
  assert.match(mapper, /entity\.marketplace_context/)
  assert.match(mapper, /orderRequest,/)
  assert.match(mapper, /systemEvent \|\| orderRequest/)
  assert.match(types, /export type MessageOrderRequest/)
  assert.match(marketEndpoint, /function VNSEEA_SendMarketOrderMessage/)
  assert.match(marketEndpoint, /'type_two'\s*=>\s*'market_order_request'/)
  assert.match(marketEndpoint, /'market_order_hash'\s*=>\s*\(string\)\$hash_id/)
  assert.doesNotMatch(
    marketEndpoint.match(/function VNSEEA_SendMarketOrderMessage[\s\S]*?^}/m)?.[0] ?? "",
    /Wo_Secure\(implode\("\\n", \$lines\)\)/,
  )
  assert.match(canonicalContext, /legacy_order_text/)
  assert.match(canonicalContext, /\[a-f0-9\]\{16,64\}/)
  assert.match(batchHydration, /legacy_order_match/)
  assert.match(mapper, /orderBuyerId > 0[\s\S]*?orderBuyerId === currentUserId/)
  assert.match(canonicalContext, /'buyer_id'\s*=>\s*\(string\)\$first_order->user_id/)
  assert.match(batchHydration, /'buyer_id'\s*=>\s*\(string\)\$first\['user_id'\]/)
})

test("full and mini conversations render the same order request card", async () => {
  const [bubble, card, list, widget, pinned] = await Promise.all([
    readClient("src/messages/presentation/components/ChatBubble.vue"),
    readClient("src/messages/presentation/components/OrderRequestMessageCard.vue"),
    readClient("src/messages/presentation/components/ChatMessageList.vue"),
    readClient("src/navigation/presentation/components/ChatWidget.vue"),
    readClient("src/messages/presentation/components/PinnedMessagesBar.vue"),
  ])

  assert.match(bubble, /<OrderRequestMessageCard/)
  assert.match(bubble, /orderRequest && !isDeleted/)
  assert.match(card, /order\.orderHash/)
  assert.match(card, /v-for="item in order\.items"/)
  assert.match(card, /order\.buyerPhone/)
  assert.match(card, /order\.buyerAddress/)
  assert.match(card, /@error="markImageFailed\(item\.productId\)"/)
  assert.doesNotMatch(card, /container-type: inline-size/)
  assert.match(card, /repeat\(auto-fit, minmax\(min\(100%, 115px\), 1fr\)\)/)
  assert.match(bubble, /chat-bubble__wrapper\.chat-bubble__wrapper--order/)
  assert.match(bubble, /width: min\(500px, calc\(100vw - 32px\)\)/)
  assert.match(list, /:order-request="msg\.isDeleted \? undefined : msg\.orderRequest"/)
  assert.match(widget, /:order-request="message\.isDeleted \? undefined : message\.orderRequest"/)
  assert.match(widget, /chat-widget__mini-message--order': Boolean\(message\.orderRequest\)/)
  assert.match(widget, /chat-bubble__wrapper--order\) \{[\s\S]*?width: min\(280px, calc\(100% - 24px\)\) !important/)
  assert.match(pinned, /if \(message\.orderRequest\)/)
  assert.match(pinned, /pinnedOrderRequest/)
  assertVueTemplateCompiles(bubble, "ChatBubble.vue")
  assertVueTemplateCompiles(card, "OrderRequestMessageCard.vue")
})
