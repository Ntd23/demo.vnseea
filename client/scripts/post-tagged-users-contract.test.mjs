import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("publisher selects followed users and sends their ids to the existing post API", async () => {
  const [publisher, viewModel, repository, bff] = await Promise.all([
    readClient("src/feed/presentation/components/FeedPublisherBox.vue"),
    readClient("src/feed/application/view-models/useFeedPublisherBoxVM.ts"),
    readClient("src/feed/infrastructure/repositories/ApiFeedRepository.ts"),
    readClient("server/api/feed/posts/create.post.ts"),
  ])

  assert.match(publisher, /toggleTagPeoplePicker/)
  assert.match(publisher, /v-for="user in taggableUsers"/)
  assert.match(publisher, /selectedTaggedUsers\.length - 1/)
  assert.match(viewModel, /repository\.getTaggableUsers/)
  assert.match(viewModel, /taggedUserIds: selectedTaggedUsers\.value\.map\(user => user\.id\)/)
  assert.match(viewModel, /taggedUsers: response\.post\.taggedUsers\?\.length[\s\S]*?\[\.\.\.selectedTaggedUsers\.value\]/)
  assert.match(repository, /formData\.append\("taggedUserIds\[\]", String\(userId\)\)/)
  assert.match(bff, /requestBody\.append\("tagged_user_ids", JSON\.stringify\(payload\.taggedUserIds\)\)/)
})

test("legacy web post header renders the same tagged people summary", async () => {
  const [tagHelper, legacyHeader] = await Promise.all([
    readFile(new URL("../../assets/includes/vnseea_post_tags.php", import.meta.url), "utf8"),
    readFile(new URL("../../themes/wowonder/layout/story/includes/header.phtml", import.meta.url), "utf8"),
  ])

  assert.match(tagHelper, /function VNSEEA_RenderPostTaggedUsers/)
  assert.match(tagHelper, /'cùng với'/)
  assert.match(tagHelper, /' người khác'/)
  assert.match(legacyHeader, /VNSEEA_RenderPostTaggedUsers\(\$wo\['story'\]\)/)
})

test("feed mapper and post header render backend tagged users in a profile-aware modal", async () => {
  const [mapper, card, header, modal, modalViewModel] = await Promise.all([
    readClient("server/api/feed/_shared.ts"),
    readClient("src/feed/presentation/components/PostCard.vue"),
    readClient("src/feed/presentation/components/PostHeader.vue"),
    readClient("src/feed/presentation/components/TaggedPeopleModal.vue"),
    readClient("src/feed/application/composables/useTaggedPeopleModal.ts"),
  ])

  assert.match(mapper, /asArray\(entity\.tagged_users\)/)
  assert.match(mapper, /profilePath: appRoutes\.profile\(username\)/)
  assert.match(card, /:tagged-users="post\.taggedUsers"/)
  assert.match(header, /v-model:open="taggedPeopleOpen"/)
  assert.match(header, /@click\.stop="taggedPeopleOpen = true"/)
  assert.match(header, /người khác/)
  assert.match(modal, /:to="user\.profilePath"/)
  assert.match(modal, /feed\.postHeader\.taggedPeopleTitle/)
  assert.match(modal, /!user\.isFollowing && !user\.isFollowRequested/)
  assert.match(modalViewModel, /getProfileByUsername\(user\.username\)/)
  assert.match(modalViewModel, /runProfileAction\(\{ action: "follow", userId: user\.id \}\)/)
})
