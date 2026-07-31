// English description: Verifies message invalidation, typing, and scoped presence events in the Socket.IO relay.

import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import test from "node:test"
import { io as createClient } from "socket.io-client"
import { createRealtimeRelay } from "../realtime/notification-server.mjs"

const secret = "message-realtime-test-secret"

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

function watchPresence(socket, userIds) {
  return new Promise((resolve) => {
    socket.emit("message:presence:watch", { userIds }, resolve)
  })
}

async function publishPresence(url, payload, requestSecret = secret) {
  return await fetch(`${url}/internal/messages/presence/publish`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-realtime-secret": requestSecret,
    },
    body: JSON.stringify(payload),
  })
}

test("message invalidation and typing only reach the intended user", async (t) => {
  const { relay, url } = await startRelay()
  const sender = await connect(url, "1")
  const recipient = await connect(url, "2")
  const other = await connect(url, "3")
  t.after(async () => {
    sender.disconnect()
    recipient.disconnect()
    other.disconnect()
    await relay.close()
  })

  let leaked = false
  other.on("messages:count", () => {
    leaked = true
  })
  const invalidation = new Promise(resolve => {
    recipient.once("messages:count", resolve)
  })
  const response = await fetch(`${url}/internal/notifications/publish`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-realtime-secret": secret,
    },
    body: JSON.stringify({
      recipientId: "2",
      notificationId: "",
      kind: "message",
    }),
  })
  assert.equal(response.status, 200)
  assert.deepEqual(await invalidation, {
    notificationId: "",
    kind: "message",
  })

  const typingStarted = new Promise(resolve => {
    recipient.once("message:typing", resolve)
  })
  sender.emit("message:typing", { recipientId: "2" })
  assert.deepEqual(await typingStarted, { senderId: 1 })

  const typingStopped = new Promise(resolve => {
    recipient.once("message:typing-stop", resolve)
  })
  sender.emit("message:typing-stop", { recipientId: "2" })
  assert.deepEqual(await typingStopped, { senderId: 1 })

  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(leaked, false)
})

test("presence changes only reach subscribed contact rooms", async (t) => {
  const { relay, url } = await startRelay()
  const watcher = await connect(url, "10")
  const other = await connect(url, "11")
  t.after(async () => {
    watcher.disconnect()
    other.disconnect()
    await relay.close()
  })

  assert.deepEqual(await watchPresence(watcher, ["2", "2", "invalid"]), {
    watched: 1,
    accepted: ["2"],
  })
  assert.deepEqual(await watchPresence(other, ["3"]), {
    watched: 1,
    accepted: ["3"],
  })

  let leaked = false
  other.on("message:presence", () => {
    leaked = true
  })
  const received = new Promise(resolve => watcher.once("message:presence", resolve))
  const response = await publishPresence(url, {
    userId: 2,
    online: true,
    eventId: "presence-test",
    occurredAt: 123,
  })

  assert.equal(response.status, 200)
  assert.deepEqual(await received, {
    eventId: "presence-test",
    userId: 2,
    online: true,
    occurredAt: 123,
  })
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(leaked, false)

  assert.deepEqual(await watchPresence(watcher, ["4"]), {
    watched: 1,
    accepted: ["4"],
  })

  let receivedAfterReplacement = false
  watcher.once("message:presence", () => {
    receivedAfterReplacement = true
  })
  assert.equal((await publishPresence(url, {
    userId: 2,
    online: false,
  })).status, 200)
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(receivedAfterReplacement, false)
})

test("presence publisher rejects unauthorized and invalid changes", async (t) => {
  const { relay, url } = await startRelay()
  t.after(async () => {
    await relay.close()
  })

  assert.equal((await publishPresence(url, {
    userId: 2,
    online: true,
  }, "wrong-secret")).status, 401)

  assert.equal((await publishPresence(url, {
    userId: 0,
    online: "yes",
  })).status, 400)
})
