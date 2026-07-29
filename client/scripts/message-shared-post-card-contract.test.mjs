import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

import { parseMessageSharedPostReference } from "../src/messages/domain/message-shared-post.ts"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compile } = requireFromVue("@vue/compiler-dom")
const { compileScript, parse } = requireFromVue("@vue/compiler-sfc")

test("shared post parser accepts legacy web, canonical web, and native app links", () => {
  assert.deepEqual(
    parseMessageSharedPostReference("https://v2.vnseea.vn/home#feed-post-4414"),
    { postId: 4414, body: "" },
  )
  assert.deepEqual(
    parseMessageSharedPostReference("Ghi chú\n\nhttps://v2.vnseea.vn/post/4413"),
    { postId: 4413, body: "Ghi chú" },
  )
  assert.deepEqual(
    parseMessageSharedPostReference("vnseea://post/4412"),
    { postId: 4412, body: "" },
  )
  assert.deepEqual(
    parseMessageSharedPostReference("[a]http%3A%2F%2Fdemo.vnseea.test%3A8080%2Fpost%2F4354[/a]"),
    { postId: 4354, body: "" },
  )
  assert.deepEqual(
    parseMessageSharedPostReference("Xem bài này /post/4411?from=message"),
    { postId: 4411, body: "Xem bài này" },
  )
  assert.equal(parseMessageSharedPostReference("Tin nhắn bình thường"), null)
})

test("message BFF enriches shared links with the authorized post card", () => {
  const shared = read("server/api/messages/_shared.ts")
  const shareVm = read("src/feed/application/view-models/useFeedShareModalVM.ts")

  assert.match(shared, /parseMessageSharedPostReference/)
  assert.match(shared, /fetchFeedPostById\(event, postId\)/)
  assert.match(shared, /await enrichSharedPostMessages\(event, messages\)/)
  assert.match(shared, /authorAvatarUrl:\s*post\.authorAvatarUrl/)
  assert.match(shared, /productAttachment\?\.imageUrl/)
  assert.match(shared, /product:\s*productAttachment/)
  assert.match(shared, /title:\s*productAttachment\.title/)
  assert.match(shared, /href:\s*productAttachment\.href/)
  assert.match(shared, /point:\s*product\?\.point \?\? 0/)
  assert.match(shared, /fetchCanonicalProductPoint/)
  assert.match(shared, /post\?\.sharedPost\?\.jobId/)
  assert.match(shared, /fetchJobDetailByPostId\(event, jobPost\.id\)/)
  assert.match(shared, /job:\s*job/)
  assert.match(shared, /title:\s*job\.title/)
  assert.match(shared, /categoryLabel:\s*job\.categoryLabel/)
  assert.match(shared, /salaryLabel:\s*job\.salaryLabel/)
  assert.match(shared, /backendRoutes\.api\.publicContent/)
  assert.match(shared, /card\.product\.point = canonicalPoint/)
  assert.match(shared, /href:\s*appRoutes\.postDetail\(post\.id\)/)
  assert.match(shareVm, /new URL\(appRoutes\.postDetail\(input\.postId\), requestURL\.origin\)/)
  assert.match(shareVm, /\[input\.caption\?\.trim\(\), canonicalPostUrl\]/)
  assert.doesNotMatch(shareVm, /selectedDestination\.value === "message"[\s\S]{0,160}input\.postText\?\.trim/)
})

test("full and mini message surfaces render the same shared post card", () => {
  const bubble = read("src/messages/presentation/components/ChatBubble.vue")
  const messageList = read("src/messages/presentation/components/ChatMessageList.vue")
  const widget = read("src/navigation/presentation/components/ChatWidget.vue")
  const card = read("src/messages/presentation/components/MessageSharedPostCard.vue")

  assert.match(bubble, /<MessageSharedPostCard/)
  assert.match(bubble, /sharedPost\?: MessageSharedPostCardData/)
  assert.match(messageList, /:shared-post="msg\.isDeleted \? undefined : msg\.sharedPost"/)
  assert.match(widget, /:shared-post="message\.isDeleted \? undefined : message\.sharedPost"/)
  assert.match(card, /:to="cardHref"/)
  assert.match(card, /post\.authorAvatarUrl/)
  assert.match(card, /post\.imageUrl/)
  assert.match(card, /post\.product\.title/)
  assert.match(card, /post\.job\.title/)
  assert.match(card, /post\.job\.location/)
  assert.match(card, /post\.job\.categoryLabel/)
  assert.match(card, /pages\.messagesPage\.sharedJobLabel/)
  assert.match(card, /post\.job\.salaryLabel/)
  assert.match(card, /i-ph-briefcase-duotone/)
  assert.match(card, /formatProductPrice/)
  assert.match(card, /formatProductPoints/)
  assert.match(card, /message-shared-post__points/)
  assert.match(card, /-webkit-line-clamp:\s*2/)

  for (const [path, source] of [
    ["ChatBubble.vue", bubble],
    ["MessageSharedPostCard.vue", card],
  ]) {
    const { descriptor, errors: sfcErrors } = parse(source, { filename: path })
    assert.deepEqual(sfcErrors, [], `${path}: ${sfcErrors.join("; ")}`)
    assert.doesNotThrow(() => compileScript(descriptor, { id: path }))

    const template = source.slice(
      source.indexOf("<template>") + "<template>".length,
      source.indexOf("</template>"),
    )
    const errors = []
    compile(template, {
      expressionPlugins: ["typescript"],
      onError: error => errors.push(error.message),
    })
    assert.deepEqual(errors, [], `${path}: ${errors.join("; ")}`)
  }
})
