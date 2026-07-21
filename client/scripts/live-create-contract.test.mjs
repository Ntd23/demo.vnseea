import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

const assertLiveWebSuccessSource = source => {
  const start = source.indexOf("const assertLiveWebSuccess")
  const end = source.indexOf("const getBackendWebBase", start)

  assert.ok(start >= 0 && end > start, "live response assertion helper exists")
  return source.slice(start, end)
}

test("live create success keeps the established backend session mapping", async () => {
  const source = await readClient("server/api/live/_shared.ts")

  assert.match(source, /if \(status >= 200 && status < 300\) \{\s*return normalized as T/)
  assert.match(source, /postId:\s*asNumber\(normalized\.post_id\)/)
  assert.match(source, /streamName:\s*asString\(normalized\.stream_name\) \|\| input\.streamName/)
  assert.match(source, /startedAt:\s*new Date\(\(startedAtSeconds > 0 \? startedAtSeconds \* 1000 : Date\.now\(\)\)\)\.toISOString\(\)/)
})

test("live create body errors retain backend status and recovery data", async () => {
  const source = await readClient("server/api/live/_shared.ts")
  const helper = assertLiveWebSuccessSource(source)
  const bodyError = helper.slice(helper.lastIndexOf("throw createError"))

  assert.match(helper, /const errorStatus = status >= 400 && status < 600 \? status : 400/)
  assert.match(bodyError, /statusCode:\s*errorStatus/)
  assert.match(bodyError, /error_code:\s*normalized\.error_code/)
  assert.match(bodyError, /blocked_reason:\s*normalized\.blocked_reason/)
  assert.match(bodyError, /retryable:\s*normalized\.retryable/)
  assert.doesNotMatch(bodyError, /statusCode:\s*400/)
})

test("live studio maps canonical backend error codes to localized UI copy", async () => {
  const source = await readClient("src/live/application/view-models/useLiveStudioPageVM.ts")

  assert.match(source, /const getLiveCreateErrorCode/)
  assert.match(source, /case "live_video_disabled"/)
  assert.match(source, /case "live_permission_disabled"/)
  assert.match(source, /case "livekit_not_ready"/)
  assert.match(source, /case "live_already_running"/)
  assert.match(source, /case "live_post_insert_failed"/)
  assert.match(source, /case "live_post_finalize_failed"/)
  assert.match(source, /getLiveStartErrorMessage\(\s*startError/)
})
