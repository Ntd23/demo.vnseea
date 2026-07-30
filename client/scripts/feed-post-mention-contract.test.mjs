import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const mentionSearch = await readFile(
  new URL("../src/feed/application/composables/useFeedMentionSearch.ts", import.meta.url),
  "utf8",
)
const mentionUtils = await readFile(
  new URL("../src/feed/application/utils/feed-mentions.ts", import.meta.url),
  "utf8",
)
const publisher = await readFile(
  new URL("../src/feed/presentation/components/FeedPublisherBox.vue", import.meta.url),
  "utf8",
)
const publisherViewModel = await readFile(
  new URL("../src/feed/application/view-models/useFeedPublisherBoxVM.ts", import.meta.url),
  "utf8",
)
const postCard = await readFile(
  new URL("../src/feed/presentation/components/PostCard.vue", import.meta.url),
  "utf8",
)
const feedMapper = await readFile(
  new URL("../server/api/feed/_shared.ts", import.meta.url),
  "utf8",
)

assert.doesNotMatch(
  mentionSearch,
  /\.split\(\/\\s\+\/\)[\s\S]*?\.filter\(Boolean\)\[0\]/,
  "Mention selection must not reduce a person's name to its first word.",
)
assert.match(
  mentionSearch,
  /const value = \(user\.title \|\| user\.firstName \|\| fallback\)/,
  "Mention selection must prefer the user's full display name.",
)
assert.match(
  publisher,
  /publishPost\(\{\s*text:\s*createBackendMentionText\(\),\s*\}\)/,
  "The post publisher must send the selected account username instead of its display label.",
)
assert.match(
  publisherViewModel,
  /text:\s*input\?\.text \?\? draft\.value\?\.text \?\? ""/,
  "The publisher view model must accept a validated backend mention text override.",
)
assert.match(
  mentionUtils,
  /mentionUsername:\s*segment\.isMention/,
  "Rendered mention segments must retain the target username.",
)
assert.match(
  postCard,
  /:to="appRoutes\.profile\(segment\.mentionUsername\)"/,
  "A rendered post mention must link to the tagged profile.",
)
assert.doesNotMatch(
  feedMapper,
  /firstDisplayNamePart/,
  "The feed mapper must preserve the tagged user's full display name.",
)

console.log("feed post mention contract: ok")
