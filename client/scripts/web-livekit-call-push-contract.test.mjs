import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const root = path.resolve(import.meta.dirname, "../..")

const read = relativePath =>
  fs.readFileSync(path.join(root, relativePath), "utf8")

test("Nuxt creates direct calls through the canonical LiveKit bridge", () => {
  const source = read("client/server/api/messages/calls/create.post.ts")

  assert.match(source, /callBackend\(event,\s*"create_livekit_call"/)
  assert.doesNotMatch(source, /create_new_audio_call/)
  assert.doesNotMatch(source, /create_new_video_call/)
  assert.match(source, /recipient_id:\s*input\.userId/)
  assert.match(source, /call_type:\s*input\.type/)
})

test("the web bridge delegates creation to the shared LiveKit call service", () => {
  assert.equal(fs.existsSync(path.join(root, "xhr/create_livekit_call.php")), true)
  assert.equal(
    fs.existsSync(path.join(root, "assets/includes/vnseea_livekit_call.php")),
    true,
  )
  const endpoint = read("xhr/create_livekit_call.php")
  const service = read("assets/includes/vnseea_livekit_call.php")
  const apiEndpoint = read("api/v2/endpoints/livekit.php")

  assert.match(endpoint, /Wo_CreateCanonicalLiveKitDirectCall/)
  assert.match(service, /function Wo_CreateCanonicalLiveKitDirectCall/)
  assert.match(service, /Wo_SendCanonicalLiveKitCallPush/)
  assert.match(service, /Wo_ApiSendApnsVoipPush/)
  assert.match(service, /'provider'\s*=>\s*'livekit'/)
  assert.match(service, /'event_type'\s*=>\s*'livekit_call'/)
  assert.match(apiEndpoint, /Wo_CreateCanonicalLiveKitDirectCall/)
})
