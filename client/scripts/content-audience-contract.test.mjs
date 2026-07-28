import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

import {
  contentAudiencePrivacy,
  isCanonicalPublicContentAudience,
  normalizeContentAudienceSelection,
  validateContentPostAudience,
} from "../src/shared-kernel/domain/content-audience.ts"

const readClient = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compile } = requireFromVue("@vue/compiler-dom")

test("content audience contract defines audience_v2 and maps legacy anonymous privacy safely", () => {
  assert.deepEqual(contentAudiencePrivacy, {
    public: "0",
    friends: "1",
    followers: "2",
    only_me: "3",
  })
  assert.deepEqual(normalizeContentAudienceSelection("postPrivacy4"), {
    audience: "public",
    privacy: "0",
    isAnonymous: true,
  })
  assert.deepEqual(normalizeContentAudienceSelection("4"), {
    audience: "public",
    privacy: "0",
    isAnonymous: true,
  })
  assert.equal(isCanonicalPublicContentAudience("public"), true)
  assert.equal(isCanonicalPublicContentAudience("0"), true)
  assert.equal(isCanonicalPublicContentAudience(undefined), false)
  assert.equal(isCanonicalPublicContentAudience("bogus"), false)
  assert.equal(isCanonicalPublicContentAudience("postPrivacy4"), false)
})

test("post audience validation enforces personal, page, group, and event contexts", () => {
  assert.deepEqual(validateContentPostAudience({ context: "personal", audience: "only_me" }), {
    audience: "only_me",
    privacy: "3",
    isAnonymous: false,
  })
  assert.deepEqual(validateContentPostAudience({
    context: "personal",
    audience: "friends",
    isAnonymous: true,
  }), {
    audience: "public",
    privacy: "0",
    isAnonymous: true,
  })
  assert.deepEqual(validateContentPostAudience({ context: "page", audience: "followers" }), {
    audience: "followers",
    privacy: "2",
    isAnonymous: false,
  })
  assert.deepEqual(validateContentPostAudience({ context: "group", audienceProvided: false }), {
    audience: null,
    privacy: null,
    isAnonymous: false,
  })
  assert.deepEqual(validateContentPostAudience({ context: "event", audienceProvided: false }), {
    audience: null,
    privacy: null,
    isAnonymous: false,
  })

  assert.throws(() => validateContentPostAudience({ context: "personal", audience: "bogus" }), /invalid/i)
  assert.throws(() => validateContentPostAudience({ context: "page", audience: "friends" }), /invalid/i)
  assert.throws(() => validateContentPostAudience({ context: "page", isAnonymous: true }), /anonymous/i)
  assert.throws(() => validateContentPostAudience({ context: "group", audience: "public", audienceProvided: true }), /inherited/i)
  assert.throws(() => validateContentPostAudience({ context: "event", isAnonymous: true }), /anonymous/i)
  assert.doesNotThrow(() => validateContentPostAudience({ context: "personal", isAnonymous: true }))
})

test("feed, story, and live requests declare audience_v2 and use the shared audience contract", () => {
  const [feedRepository, feedBff, storyBff, liveBff] = [
    "src/feed/infrastructure/repositories/ApiFeedRepository.ts",
    "server/api/feed/posts/create.post.ts",
    "server/api/feed/stories/create.post.ts",
    "server/api/live/_shared.ts",
  ].map(readClient)

  for (const source of [feedRepository, feedBff, storyBff, liveBff]) {
    assert.match(source, /privacy_contract["']?[,\s:]*["']audience_v2["']/)
  }
  assert.match(feedBff, /validateContentPostAudience/)
  assert.match(storyBff, /privacy/)
  assert.match(liveBff, /normalizeContentAudience/)

  const storyPage = readClient("src/feed/presentation/pages/StatusCreatePage.vue")
  assert.match(storyPage, /locale\.value === "vi"/)
  assert.match(storyPage, /Công khai/)
  assert.match(storyPage, /Bạn bè/)
  assert.match(storyPage, /Người theo dõi/)
  assert.match(storyPage, /Chỉ mình tôi/)
})

test("changed Vue share surfaces compile without template errors", () => {
  for (const path of [
    "src/feed/presentation/components/PostCard.vue",
    "src/feed/presentation/components/LivePostPlayer.vue",
    "src/feed/presentation/components/ShareModal.vue",
    "src/feed/presentation/components/LightboxViewer.vue",
    "src/lightbox/presentation/components/LightboxModal.vue",
    "src/reels/presentation/pages/ReelsPage.vue",
    "src/profile/presentation/pages/ProfilePage.vue",
  ]) {
    const source = readClient(path)
    const templateStart = source.indexOf("<template>")
    const scriptStart = source.indexOf("<script")
    const templateEnd = source.lastIndexOf("</template>", scriptStart)
    const template = templateStart >= 0 && templateEnd > templateStart
      ? source.slice(templateStart + "<template>".length, templateEnd)
      : ""
    assert.ok(template, `${path} has a template`)

    const errors = []
    compile(template, {
      expressionPlugins: ["typescript"],
      onError: error => errors.push(error.message),
    })
    assert.deepEqual(errors, [], `${path}: ${errors.join("; ")}`)
  }
})

test("all post share entry points and modal actions require post canShare", () => {
  const [postCard, livePlayer, reelsPage, profilePage, lightboxViewer, lightboxModal, shareModal, shareModalVm] = [
    "src/feed/presentation/components/PostCard.vue",
    "src/feed/presentation/components/LivePostPlayer.vue",
    "src/reels/presentation/pages/ReelsPage.vue",
    "src/profile/presentation/pages/ProfilePage.vue",
    "src/feed/presentation/components/LightboxViewer.vue",
    "src/lightbox/presentation/components/LightboxModal.vue",
    "src/feed/presentation/components/ShareModal.vue",
    "src/feed/application/view-models/useFeedShareModalVM.ts",
  ].map(readClient)

  assert.match(postCard, /v-if="post\.permissions\.canShare"[\s\S]*?feed\.postCard\.share/)
  assert.match(postCard, /:can-share="post\.permissions\.canShare"/)
  assert.match(livePlayer, /<!-- Share -->[\s\S]*?v-if="canShare"/)
  assert.doesNotMatch(livePlayer, /<!-- Like \/ Reaction -->\s*<div v-if="canShare"/)
  assert.match(reelsPage, /v-if="activeReel\.permissions\.canShare"[\s\S]*?reelsPage\.share/)
  assert.match(profilePage, /:can-share="profileLightboxPost\.permissions\.canShare"/)
  assert.match(lightboxViewer, /:can-share="canShare"/)
  assert.match(lightboxViewer, /canShare:\s*false/)
  assert.doesNotMatch(lightboxModal, /v-if="canShare"\s+type="button"\s+class="lightbox-modal__comment-btn"/)
  assert.match(lightboxModal, /v-if="canShare"\s+type="button"\s+class="lightbox-modal__share-btn"/)
  assert.match(lightboxModal, /canShare:\s*false/)
  assert.match(shareModal, /canShare\?: boolean/)
  assert.match(shareModal, /if \(!props\.canShare\)[\s\S]*?navigator\.clipboard/)
  assert.match(shareModal, /if \(!props\.canShare\)[\s\S]*?window\.open/)
  assert.match(shareModalVm, /shareAllowed: Readonly<Ref<boolean>>/)
  assert.match(shareModalVm, /shareAllowed\.value[\s\S]*?selectedDestination/)
})

test("post BFF accepts both anonymous payload forms and validates context before backend mapping", () => {
  const [bff, repository, publisherVm] = [
    "server/api/feed/posts/create.post.ts",
    "src/feed/infrastructure/repositories/ApiFeedRepository.ts",
    "src/feed/application/view-models/useFeedPublisherBoxVM.ts",
  ].map(readClient)

  assert.match(bff, /isAnonymous:\s*parseBooleanFlag\(body\.isAnonymous\)/)
  assert.match(bff, /part\.name === "is_anonymous"/)
  assert.match(bff, /validateContentPostAudience/)
  assert.match(bff, /context === "personal" \|\| context === "page"/)
  assert.doesNotMatch(bff, /isPlainText/)
  assert.match(repository, /formData\.append\("is_anonymous", "1"\)/)
  assert.match(repository, /\.\.\.input,[\s\S]*?privacy_contract:\s*"audience_v2"/)
  assert.match(publisherVm, /if \(groupId \|\| eventId\) return \[\]/)
  assert.match(publisherVm, /!pageId && !eventId && !groupId/)
})

test("anonymous composer forces public audience and locks the audience picker", () => {
  const publisherVm = readClient("src/feed/application/view-models/useFeedPublisherBoxVM.ts")
  const publisher = readClient("src/feed/presentation/components/FeedPublisherBox.vue")

  assert.match(publisherVm, /\(\) => draft\.value\.isAnonymous[\s\S]*?draft\.value\.audience = "public"/)
  assert.match(publisher, /:disabled="draft\.isAnonymous"/)
  assert.match(publisher, /function toggleAudienceMenu\(\) \{\s*if \(draft\.value\?\.isAnonymous\) return/)
  assert.match(publisher, /function selectAudienceOption\(val: any\) \{\s*if \(draft\.value\?\.isAnonymous\) return/)
})

test("old-backend post mapping allows public and friends sharing but blocks anonymous posts", () => {
  const mapper = readClient("server/api/feed/_shared.ts")

  assert.match(mapper, /hasOwn\(entity, "can_share"\)/)
  assert.match(mapper, /isCanonicalPublicContentAudience\(rawAudience\)/)
  assert.match(mapper, /audienceSelection\.audience === "friends"/)
  assert.match(mapper, /audienceSelection\.audience !== "only_me"/)
  assert.match(mapper, /!audienceSelection\.isAnonymous/)
  assert.match(mapper, /isAnonymous:\s*audienceSelection\.isAnonymous/)
})

test("anonymous post mapping redacts raw publisher identity before presentation mapping", () => {
  const mapper = readClient("server/api/feed/_shared.ts")
  const audienceIndex = mapper.indexOf("const audienceSelection = normalizeContentAudienceSelection")
  const publisherIndex = mapper.indexOf("const publisher = asRecord", mapper.indexOf("export const mapPostRecord"))

  assert.ok(audienceIndex > 0 && audienceIndex < publisherIndex, "anonymity is normalized before publisher identity")
  assert.match(mapper, /isTruthy\(entity\.is_anonymous\) \? "postPrivacy4" : rawAudience/)
  assert.match(mapper, /const authorId = audienceSelection\.isAnonymous\s*\? 0/)
  assert.match(mapper, /const author = audienceSelection\.isAnonymous\s*\? "Anonymous"/)
  assert.match(mapper, /const authorUsername = audienceSelection\.isAnonymous\s*\? ""/)
  assert.match(mapper, /const authorAvatarUrl = audienceSelection\.isAnonymous\s*\? ""/)
  assert.match(mapper, /authorPath:\s*audienceSelection\.isAnonymous\s*\? undefined/)
  assert.match(mapper, /role:\s*audienceSelection\.isAnonymous\s*\? "Anonymous"/)
  assert.match(mapper, /sourcePath:\s*audienceSelection\.isAnonymous\s*\? appRoutes\.feed/)
})
