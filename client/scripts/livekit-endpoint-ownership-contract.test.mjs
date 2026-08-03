import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = path => readFileSync(resolve(root, path), 'utf8')

test('Nuxt forwards a stable browser endpoint to PHP call and live handlers', () => {
  const backendClient = read('server/utils/backend-web-client.ts')
  const endpoint = read('server/utils/client-endpoint.ts')
  const directAnswer = read('server/api/messages/calls/answer.post.ts')
  const groupCreate = read('server/api/messages/calls/group/create.post.ts')
  const groupJoin = read('server/api/messages/calls/group/join.post.ts')
  const groupPageVm = read('src/messages/application/view-models/useGroupCallPageVM.ts')
  const groupRoom = read('src/messages/application/composables/useGroupCallRoomSession.ts')

  assert.match(endpoint, /vnseea_endpoint_id/)
  assert.match(endpoint, /getOrCreateClientEndpointId/)
  assert.match(backendClient, /X-VNSEEA-Endpoint-ID/)
  assert.match(directAnswer, /Number\(answerResponse\.status \?\? 0\) !== 200/)
  assert.match(directAnswer, /callBackend\(event, "close_call"/)
  assert.match(groupCreate, /assertBackendStatus/)
  assert.match(groupJoin, /assertBackendStatus/)
  assert.match(groupPageVm, /repository\.leaveGroupCall\(\{ id: callId\.value \}\)/)
  assert.match(groupRoom, /await vm\.leaveCall\(\)/)
})

test('Nuxt clears a group-call invitation after another endpoint joins', () => {
  const calls = read('src/messages/application/composables/useMessageCalls.ts')

  assert.match(calls, /const validateCurrentIncomingGroupCall = async \(\) =>/)
  assert.match(calls, /await validateCurrentIncomingGroupCall\(\)/)
  assert.match(calls, /ringingGroupCall\.value = null/)
})
