import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = relativePath =>
  readFile(new URL(relativePath, import.meta.url), "utf8")

test("Nuxt captures and forwards an aspect-preserving Feed video thumbnail", async () => {
  const [thumbnailHelper, viewModel, domain, repository, bridge, backend] = await Promise.all([
    read("../src/feed/application/utils/createFeedVideoThumbnailFile.ts"),
    read("../src/feed/application/view-models/useFeedPublisherBoxVM.ts"),
    read("../src/feed/domain/repositories/FeedRepository.ts"),
    read("../src/feed/infrastructure/repositories/ApiFeedRepository.ts"),
    read("../server/api/feed/posts/create.post.ts"),
    read("../../api/v2/endpoints/new_post.php"),
  ])

  assert.match(thumbnailHelper, /video\.videoWidth/)
  assert.match(thumbnailHelper, /video\.videoHeight/)
  assert.match(thumbnailHelper, /context\.drawImage\(video/)
  assert.match(thumbnailHelper, /canvas\.toBlob\(resolve,\s*"image\/jpeg",\s*0\.86\)/)
  assert.match(thumbnailHelper, /URL\.revokeObjectURL\(videoUrl\)/)

  assert.match(viewModel, /createFeedVideoThumbnailFile/)
  assert.match(viewModel, /videoThumbnailFile:/)
  assert.match(domain, /videoThumbnailFile\?: File/)
  assert.match(repository, /formData\.append\("video_thumb", input\.videoThumbnailFile/)
  assert.match(bridge, /part\.name === "video_thumb"/)
  assert.match(bridge, /requestBody\.append\(\s*"video_thumb"/)
  assert.match(bridge, /requestBody\.append\("video_thumbnail_contract", "preserve_aspect_v1"\)/)
  assert.match(backend, /\$preserve_video_thumbnail_aspect/)
})
