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
