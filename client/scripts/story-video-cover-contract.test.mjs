import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = relativePath =>
  readFile(new URL(relativePath, import.meta.url), "utf8")

test("video stories upload a browser-captured frame as their cover", async () => {
  const [viewModel, repository, bridge, backend, storyFunctions] = await Promise.all([
    read("../src/feed/application/view-models/useStatusCreatePageVM.ts"),
    read("../src/feed/infrastructure/repositories/ApiFeedRepository.ts"),
    read("../server/api/feed/stories/create.post.ts"),
    read("../../api/v2/endpoints/create-story.php"),
    read("../../assets/includes/functions_three.php"),
  ])

  assert.match(viewModel, /context\.drawImage\(video/)
  assert.match(viewModel, /canvas\.toBlob\(resolve,\s*"image\/jpeg"/)
  assert.match(viewModel, /coverFile,/)
  assert.match(repository, /formData\.append\("cover", input\.coverFile/)
  assert.match(bridge, /part\.filename && part\.name === "cover"/)
  assert.match(bridge, /payload\.append\(\s*"cover"/)
  assert.match(backend, /'mov',\s*'webm'/)
  assert.match(
    storyFunctions,
    /function Wo_GetStroies[\s\S]*?Wo_GetStoryThumb\([\s\S]*?\$fetched_data\['thumbnail'\][\s\S]*?\$fetched_data\['thumb'\] = \$story_thumb/,
  )
})
