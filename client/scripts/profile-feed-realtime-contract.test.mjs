import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("profile feed commits create, update, share, hide, and delete mutations immediately", () => {
  const page = read("src/profile/presentation/pages/ProfilePage.vue")
  const profileVm = read("src/profile/application/composables/useProfileVM.ts")
  const postCard = read("src/feed/presentation/components/PostCard.vue")
  const postCardVm = read("src/feed/application/view-models/useFeedPostCardVM.ts")

  assert.match(page, /<FeedPublisherBox[\s\S]*?@created="handlePostCreated"/)
  assert.match(page, /@updated="updateProfilePost"/)
  assert.match(page, /@deleted="handleProfilePostRemoved"/)
  assert.match(page, /@hidden="handleProfilePostRemoved"/)
  assert.match(page, /watch\(timelinePosts/)
  assert.match(profileVm, /const handlePostCreated = async/)
  assert.match(profileVm, /const updateProfilePost =/)
  assert.match(profileVm, /const removeProfilePost =/)
  assert.match(postCard, /updated: \[post: FeedPostRecord\]/)
  assert.match(postCard, /emit\("updated"/)
  assert.match(postCardVm, /currentPost\.stats\.shares = sharesCount\.value/)
})
