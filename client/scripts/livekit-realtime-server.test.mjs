// English description: Verifies canonical direct and group LiveKit events on the Socket.IO v4 relay.

import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import test from "node:test"
import { io as createClient } from "socket.io-client"
import { createRealtimeRelay } from "../realtime/notification-server.mjs"

const secret = "livekit-realtime-test-secret"

function createToken(userId) {
  const encoded = Buffer.from(JSON.stringify({
    userId,
    exp: Math.floor(Date.now() / 1000) + 60,
  })).toString("base64url")
  const signature = createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url")
  return `${encoded}.${signature}`
}

async function startRelay() {
  const relay = createRealtimeRelay({
    realtimeSecret: secret,
    corsOrigin: ["*"],
  })
  await new Promise(resolve => relay.server.listen(0, "127.0.0.1", resolve))
  const address = relay.server.address()
  return { relay, url: `http://127.0.0.1:${address.port}` }
}

function connect(url, userId) {
  return new Promise((resolve, reject) => {
    const socket = createClient(url, {
      auth: { token: createToken(userId) },
      transports: ["websocket"],
      forceNew: true,
    })
    socket.once("connect", () => resolve(socket))
    socket.once("connect_error", reject)
  })
}

async function publish(url, payload, requestSecret = secret) {
  return await fetch(`${url}/internal/livekit-call/publish`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-realtime-secret": requestSecret,
    },
    body: JSON.stringify(payload),
  })
}

test("direct incoming and state events reach only call participants", async (t) => {
  const { relay, url } = await startRelay()
  const caller = await connect(url, "1")
  const recipient = await connect(url, "2")
  const other = await connect(url, "3")
  t.after(async () => {
    caller.disconnect()
    recipient.disconnect()
    other.disconnect()
    await relay.close()
  })

  let callerIncoming = false
  let otherIncoming = false
  caller.once("livekit_call_incoming", () => {
    callerIncoming = true
  })
  other.once("livekit_call_incoming", () => {
    otherIncoming = true
  })
  const incoming = new Promise(resolve => {
    recipient.once("livekit_call_incoming", resolve)
  })
  const incomingPayload = {
    event: "incoming",
    call_id: "42",
    call_type: "video",
    from_id: "1",
    to_id: "2",
    provider: "livekit",
    room_name: "call-42",
    peer: { id: "1", name: "Caller" },
  }
  assert.equal((await publish(url, incomingPayload)).status, 200)
  assert.deepEqual(await incoming, incomingPayload)
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(callerIncoming, false)
  assert.equal(otherIncoming, false)

  const callerAnswered = new Promise(resolve => {
    caller.once("livekit_call_answered", resolve)
  })
  const recipientAnswered = new Promise(resolve => {
    recipient.once("livekit_call_answered", resolve)
  })
  const answeredPayload = {
    event: "answered",
    call_id: "42",
    call_type: "video",
    from_id: "1",
    to_id: "2",
    status: "answered",
  }
  assert.equal((await publish(url, answeredPayload)).status, 200)
  assert.deepEqual(await callerAnswered, answeredPayload)
  assert.deepEqual(await recipientAnswered, answeredPayload)
})

test("group events fan out once to the explicit recipient user rooms", async (t) => {
  const { relay, url } = await startRelay()
  const first = await connect(url, "10")
  const second = await connect(url, "11")
  const other = await connect(url, "12")
  t.after(async () => {
    first.disconnect()
    second.disconnect()
    other.disconnect()
    await relay.close()
  })

  let leaked = false
  other.once("livekit_group_call_sync", () => {
    leaked = true
  })
  const firstEvent = new Promise(resolve => {
    first.once("livekit_group_call_sync", resolve)
  })
  const secondEvent = new Promise(resolve => {
    second.once("livekit_group_call_sync", resolve)
  })
  const payload = {
    context: "group",
    event: "sync",
    call_id: "99",
    group_id: "7",
    call_type: "video",
    recipient_ids: ["10", "11", "11", "invalid"],
    participants: [],
  }
  assert.equal((await publish(url, payload)).status, 200)
  assert.deepEqual(await firstEvent, payload)
  assert.deepEqual(await secondEvent, payload)
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(leaked, false)
})

test("LiveKit publisher rejects unauthorized and malformed changes", async (t) => {
  const { relay, url } = await startRelay()
  t.after(async () => {
    await relay.close()
  })

  assert.equal((await publish(url, {
    event: "incoming",
    call_id: "1",
    from_id: "1",
    to_id: "2",
  }, "wrong-secret")).status, 401)

  assert.equal((await publish(url, {
    event: "unknown",
    call_id: "1",
    from_id: "1",
    to_id: "2",
  })).status, 400)
})
