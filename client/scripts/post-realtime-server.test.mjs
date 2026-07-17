import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import test from "node:test"
import { io as createClient } from "socket.io-client"
import { createRealtimeRelay } from "../realtime/notification-server.mjs"

const secret = "post-realtime-test-secret"

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
  return {
    relay,
    url: `http://127.0.0.1:${address.port}`,
  }
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

test("post rooms isolate events and enforce the 50-id limit", async (t) => {
  const { relay, url } = await startRelay()
  const first = await connect(url, "1")
  const second = await connect(url, "2")
  t.after(async () => {
    first.disconnect()
    second.disconnect()
    await relay.close()
  })

  const ids = Array.from({ length: 60 }, (_, index) => String(index + 1))
  const watchResult = await new Promise(resolve => {
    first.emit("posts:watch", { postIds: ids }, resolve)
  })
  assert.equal(watchResult.watched, 50)

  await new Promise(resolve => {
    second.emit("posts:watch", { postIds: ["51"] }, resolve)
  })

  const received = new Promise(resolve => {
    first.once("post:changed", resolve)
  })
  let leaked = false
  second.once("post:changed", () => {
    leaked = true
  })

  const response = await fetch(`${url}/internal/posts/publish`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-realtime-secret": secret,
    },
    body: JSON.stringify({
      eventId: "event-10",
      postId: "10",
      mutation: "reaction",
      occurredAt: 123,
    }),
  })
  assert.equal(response.status, 200)
  assert.deepEqual(await received, {
    eventId: "event-10",
    postId: "10",
    mutation: "reaction",
    occurredAt: 123,
  })
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(leaked, false)
})

test("internal post publisher rejects bad secrets and invalid payloads", async (t) => {
  const { relay, url } = await startRelay()
  t.after(() => relay.close())

  const unauthorized = await fetch(`${url}/internal/posts/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ postId: "1", mutation: "comment" }),
  })
  assert.equal(unauthorized.status, 401)

  const invalid = await fetch(`${url}/internal/posts/publish`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-realtime-secret": secret,
    },
    body: JSON.stringify({ postId: "not-a-number", mutation: "comment" }),
  })
  assert.equal(invalid.status, 400)
})
