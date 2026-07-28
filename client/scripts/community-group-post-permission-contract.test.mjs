import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("group composer is available only to group members or managers", () => {
  const section = read("src/community/presentation/components/GroupFeedSection.vue")

  assert.match(section, /<FeedPublisherBox\s+v-if="canPublish"/)
  assert.match(section, /props\.group\.canManage\s*\|\|\s*props\.group\.joined/)
  assert.match(section, /joinToPostTitle/)
})

test("Nuxt and PHP post endpoints reject non-members publishing into groups", () => {
  const bridge = read("server/api/feed/posts/create.post.ts")
  const api = read("../api/v2/endpoints/new_post.php")
  const xhr = read("../xhr/posts.php")

  assert.match(bridge, /"get-group-data"/)
  assert.match(bridge, /if \(!group \|\| \(!isOwner && !isMember\)\)/)
  assert.match(api, /Wo_IsGroupJoined\(\$group_id\) !== true/)
  assert.match(xhr, /Wo_IsGroupJoined\(\$group_id\) !== true/)
})

test("group settings controls and analytics initialize i18n before building translated options", () => {
  const controls = read("src/community/presentation/components/GroupSettingsControlsCard.vue")
  const analytics = read("src/community/presentation/components/GroupSettingsAnalyticCard.vue")
  const deleteCard = read("src/community/presentation/components/GroupSettingsDeleteCard.vue")

  assert.match(controls, /const \{ t \} = useI18n\(\)/)
  assert.match(controls, /const privacyItems = computed/)
  assert.match(analytics, /const \{ t \} = useI18n\(\)/)
  assert.match(analytics, /name: t\("community\.groupSettings\.analytics\.joined"\)/)
  assert.doesNotMatch(analytics, /name: "\{\{ \$t\(/)
  assert.match(deleteCard, /const \{ t \} = useI18n\(\)/)
})
