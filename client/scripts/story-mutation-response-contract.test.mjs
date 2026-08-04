import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("story creation parses warning-prefixed PHP upload responses", async () => {
  const [uploadClient, createStory] = await Promise.all([
    readClient("server/utils/backend-api-upload.ts"),
    readClient("server/api/feed/stories/create.post.ts"),
  ])

  assert.match(uploadClient, /parseBackendApiResponse<TResponse>\(response\)/)
  assert.match(createStory, /assertBackendApiSuccess/)
  assert.match(createStory, /fetchLatestOwnStory\(event\)\.catch\(\(\) => null\)/)
})

test("story deletion returns only data from the delete response", async () => {
  const action = await readClient("server/api/feed/stories/action.post.ts")
  const deleteBranch = action.match(/if \(action === "delete"\) \{([\s\S]*?)\n  \}\n\n  if \(action === "reply"\)/)?.[1] || ""

  assert.match(deleteBranch, /const response = assertBackendApiSuccess/)
  assert.match(deleteBranch, /message: response\.message/)
  assert.doesNotMatch(deleteBranch, /response\.story/)
})
