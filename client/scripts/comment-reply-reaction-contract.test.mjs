import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const repoRoot = new URL("../../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("reply composer stays open and focused while a reply is submitted", async () => {
  const [item, composer] = await Promise.all([
    readClient("src/feed/presentation/components/CommentItem.vue"),
    readClient("src/feed/presentation/components/CommentComposer.vue"),
  ])

  assert.match(item, /ref="replyComposerRef"/)
  assert.match(item, /preserve-focus-while-submitting/)
  assert.match(item, /@submit="handleSubmitReply"/)
  assert.doesNotMatch(item, /:enable-attachments="false"/)
  assert.match(item, /await submitReply\(payload\)[\s\S]*?await nextTick\(\)[\s\S]*?replyComposerRef\.value\?\.focus\(\)/)
  assert.match(composer, /:disabled="submitting && !preserveFocusWhileSubmitting"/)
  assert.match(composer, /preserveFocusWhileSubmitting\?: boolean/)
})

test("realtime comment refresh preserves submitted replies instead of clearing them", async () => {
  const viewModel = await readClient("src/feed/application/view-models/useFeedCommentItemVM.ts")

  assert.match(viewModel, /const mergeReplyItems =/)
  assert.match(viewModel, /replyItems\.value = mergeReplyItems\(replyItems\.value, value\)/)
  assert.match(viewModel, /mergeReplyItems\(replyItems\.value, savedReplies, \[reply\]\)/)
  assert.doesNotMatch(viewModel, /replyItems\.value = value \? \[\.\.\.value\] : \[\]/)
})

test("reply composer attachments are forwarded through multipart to the PHP API", async () => {
  const [repository, actionRoute, bridge, php] = await Promise.all([
    readClient("src/feed/infrastructure/repositories/ApiFeedRepository.ts"),
    readClient("server/api/feed/comments/action.post.ts"),
    readClient("server/api/feed/_shared.ts"),
    readRepo("api/v2/endpoints/comments.php"),
  ])

  for (const field of ["commentImage", "commentGif", "commentAudio"]) {
    assert.match(repository, new RegExp(`formData\\.append\\("${field}"`))
    assert.match(actionRoute, new RegExp(`part\\.name === "${field}"`))
  }
  assert.match(bridge, /body\.append\(\s*"image"/)
  assert.match(bridge, /body\.append\(\s*"audio"/)
  assert.match(php, /create_reply[\s\S]*?\$_FILES\['audio'\]/)
  assert.match(bridge, /fileAttachmentIsAudio/)
})

test("comment and reply reactions remove the selected reaction when pressed again", async () => {
  const [viewModel, bridge, repository] = await Promise.all([
    readClient("src/feed/application/view-models/useFeedCommentItemVM.ts"),
    readClient("server/api/feed/_shared.ts"),
    readClient("src/feed/domain/repositories/FeedRepository.ts"),
  ])

  assert.match(viewModel, /const isRemoving = previousReaction === reaction/)
  assert.match(viewModel, /reaction: isRemoving \? undefined : reaction/)
  assert.match(viewModel, /remove: isRemoving/)
  assert.match(viewModel, /localSelectedReaction\.value = null/)
  assert.match(viewModel, /Math\.max\(0, localReactionsCount\.value - 1\)/)
  assert.match(viewModel, /localSelectedReaction\.value \?\? defaultFeedStoryReaction\.value/)
  assert.match(repository, /reaction\?: FeedStoryReactionType[\s\S]*?remove\?: boolean/)
  assert.match(bridge, /remove_reaction: 1/)
  assert.match(bridge, /reaction: input\.remove \? null : input\.reaction/)
})

test("PHP comment API explicitly removes reactions for comments and replies", async () => {
  const source = await readRepo("api/v2/endpoints/comments.php")
  const commentReaction = source.slice(
    source.indexOf("if ($_POST['type'] == 'reaction_comment')"),
    source.indexOf("if ($_POST['type'] == 'reaction_reply')"),
  )
  const replyReaction = source.slice(
    source.indexOf("if ($_POST['type'] == 'reaction_reply')"),
    source.indexOf("if ($_POST['type'] == 'comment_like')"),
  )

  assert.match(commentReaction, /remove_reaction[\s\S]*?Wo_DeleteCommentReactions/)
  assert.match(replyReaction, /remove_reaction[\s\S]*?Wo_DeleteReplayReactions/)
  assert.match(commentReaction, /reaction successfully deleted/)
  assert.match(replyReaction, /reaction successfully deleted/)
})
