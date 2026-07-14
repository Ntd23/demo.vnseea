import assert from "node:assert/strict"
import jsQR from "jsqr"
import { PNG } from "pngjs"

const requiredEnv = [
  "VNSEEA_IT_BACKEND_API_BASE",
  "VNSEEA_IT_BACKEND_WEB_BASE",
  "VNSEEA_IT_NUXT_BASE",
  "VNSEEA_IT_SERVER_KEY",
  "VNSEEA_IT_USER_A_TOKEN",
  "VNSEEA_IT_USER_B_TOKEN",
]

if (process.env.VNSEEA_IT_CONFIRM_STAGING !== "YES") {
  throw new Error("Set VNSEEA_IT_CONFIRM_STAGING=YES. This test performs real staging transfers.")
}
for (const name of requiredEnv) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`)
}

const trimBase = value => String(value).replace(/\/+$/, "")
const backendApiBase = trimBase(process.env.VNSEEA_IT_BACKEND_API_BASE)
  .replace(/\/api(?:-v2\.php)?$/i, "")
const backendWebBase = trimBase(process.env.VNSEEA_IT_BACKEND_WEB_BASE)
const nuxtBase = trimBase(process.env.VNSEEA_IT_NUXT_BASE)
const serverKey = process.env.VNSEEA_IT_SERVER_KEY
const explicitlyAllowedHosts = String(process.env.VNSEEA_IT_STAGING_HOSTS || "")
  .split(",")
  .map(value => value.trim().toLowerCase())
  .filter(Boolean)

for (const url of [backendApiBase, backendWebBase, nuxtBase]) {
  const host = new URL(url).hostname.toLowerCase()
  const looksLikeStaging = /(^|[.-])(staging|stage|test|dev|localhost)([.-]|$)/.test(host)
    || host === "127.0.0.1"
    || explicitlyAllowedHosts.includes(host)
  if (!looksLikeStaging) {
    throw new Error(`Refusing real transfers against non-staging host: ${host}. Add it to VNSEEA_IT_STAGING_HOSTS only after verifying the environment.`)
  }
}
const users = {
  A: {token: process.env.VNSEEA_IT_USER_A_TOKEN},
  B: {token: process.env.VNSEEA_IT_USER_B_TOKEN},
}

const requestId = label =>
  `pt_it_${label}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 80)
    .padEnd(20, "0")

async function readJson(response) {
  const text = await response.text()
  let data
  try {
    data = JSON.parse(text)
  }
  catch {
    throw new Error(`Expected JSON from ${response.url}, received: ${text.slice(0, 300)}`)
  }
  return {response, data}
}

async function directApi(user, endpoint, {method = "GET", body} = {}) {
  const query = new URLSearchParams({access_token: user.token})
  const options = {method, headers: {accept: "application/json"}}
  if (method !== "GET") {
    const form = new URLSearchParams({server_key: serverKey})
    for (const [key, value] of Object.entries(body || {})) {
      if (value !== undefined && value !== null) form.set(key, String(value))
    }
    options.body = form
    options.headers["content-type"] = "application/x-www-form-urlencoded"
  }
  else {
    query.set("server_key", serverKey)
  }
  return readJson(await fetch(`${backendApiBase}/api/${endpoint}?${query}`, options))
}

async function nuxtPost(user, endpoint, body) {
  return readJson(await fetch(`${nuxtBase}/_api/${endpoint}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      cookie: `user_id=${encodeURIComponent(user.token)}`,
    },
    body: JSON.stringify(body),
  }))
}

async function overview(user) {
  const {response, data} = await directApi(user, "wallet-overview")
  assert.equal(response.status, 200)
  assert.equal(Number(data.api_status), 200)
  return data
}

async function decodeQr(url, user) {
  const response = await fetch(url, {
    headers: user ? {cookie: `user_id=${encodeURIComponent(user.token)}`} : undefined,
  })
  assert.equal(response.status, 200, `QR request failed: ${url}`)
  const png = PNG.sync.read(Buffer.from(await response.arrayBuffer()))
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
  assert.ok(decoded?.data, `Unable to decode QR: ${url}`)
  return decoded.data
}

function parsePointsQr(payload) {
  const parts = payload.split("|")
  assert.equal(parts.shift(), "POINTS")
  const values = new Map(parts.map(item => item.split("=", 2)))
  assert.match(values.get("to") || "", /^[1-9][0-9]*$/)
  if (values.has("points") || values.has("amount")) {
    assert.equal(values.get("points"), values.get("amount"))
    assert.match(values.get("points") || "", /^[1-9][0-9]*$/)
  }
  return {recipientUserId: Number(values.get("to")), points: Number(values.get("points") || 1)}
}

async function appQr(user, points = 1) {
  return parsePointsQr(await decodeQr(
    `${backendWebBase}/requests.php?f=qrcode&s=points-qr-code&to=${user.id}&points=${points}`,
  ))
}

async function webQr(user, points = 1) {
  return parsePointsQr(await decodeQr(
    `${nuxtBase}/_api/settings/points-qr-image?points=${points}`,
    user,
  ))
}

async function balances() {
  const [a, b] = await Promise.all([overview(users.A), overview(users.B)])
  return {A: Number(a.points), B: Number(b.points), overviews: {A: a, B: b}}
}

async function assertHistory(user, id, kind, transferRequestId) {
  const data = await overview(user)
  const matches = (data.transactions || []).filter(item =>
    item.kind === kind && item.extra?.request_id === transferRequestId,
  )
  assert.equal(matches.length, 1, `${kind} history count for ${transferRequestId}`)
  assert.equal(Number(matches[0].points), 1)
  assert.equal(Number(matches[0].counterparty_id), id)
}

const completed = []
let initial

async function runCase({label, sender, recipient, qr, surface}) {
  const before = await balances()
  const transferRequestId = requestId(label)
  const scanned = await qr(recipient, 1)
  assert.equal(scanned.recipientUserId, recipient.id)
  let result
  if (surface === "app") {
    result = await directApi(sender, "points-transfer", {
      method: "POST",
      body: {
        recipient_user_id: scanned.recipientUserId,
        points: scanned.points,
        request_id: transferRequestId,
      },
    })
  }
  else {
    result = await nuxtPost(sender, "settings/points-transfer", {
      recipientUserId: scanned.recipientUserId,
      points: scanned.points,
      requestId: transferRequestId,
    })
  }
  assert.equal(result.response.status, 200, JSON.stringify(result.data))
  assert.equal(result.data.success, true)
  assert.equal(result.data.request_id || result.data.requestId, transferRequestId)
  assert.equal(result.data.idempotent_replay ?? result.data.idempotentReplay, false)
  const after = await balances()
  const senderKey = sender === users.A ? "A" : "B"
  const recipientKey = recipient === users.A ? "A" : "B"
  assert.equal(after[senderKey], before[senderKey] - 1)
  assert.equal(after[recipientKey], before[recipientKey] + 1)
  await assertHistory(sender, recipient.id, "POINTS_SENT", transferRequestId)
  await assertHistory(recipient, sender.id, "POINTS_RECEIVED", transferRequestId)
  completed.push({sender, recipient, requestId: transferRequestId})
  console.log(`ok ${label}`)
}

async function reconcile() {
  if (!initial) return
  const current = await balances()
  const difference = current.A - initial.A
  if (difference === 0) return
  const sender = difference > 0 ? users.A : users.B
  const recipient = difference > 0 ? users.B : users.A
  const points = Math.abs(difference)
  await directApi(sender, "points-transfer", {
    method: "POST",
    body: {recipient_user_id: recipient.id, points, request_id: requestId("reconcile")},
  })
}

try {
  const initialOverview = await balances()
  users.A.id = Number(initialOverview.overviews.A.current_user.id)
  users.B.id = Number(initialOverview.overviews.B.current_user.id)
  assert.ok(users.A.id > 0 && users.B.id > 0 && users.A.id !== users.B.id)
  assert.ok(initialOverview.A >= 4 && initialOverview.B >= 4, "Both staging accounts need at least 4 VNSEEA.")
  initial = {A: initialOverview.A, B: initialOverview.B}

  await runCase({label: "app-to-app", sender: users.A, recipient: users.B, qr: appQr, surface: "app"})
  await runCase({label: "app-to-web", sender: users.B, recipient: users.A, qr: webQr, surface: "app"})
  await runCase({label: "web-to-app", sender: users.A, recipient: users.B, qr: appQr, surface: "web"})
  await runCase({label: "web-to-web", sender: users.B, recipient: users.A, qr: webQr, surface: "web"})

  const replay = completed[0]
  const beforeReplay = await balances()
  const replayResult = await directApi(replay.sender, "points-transfer", {
    method: "POST",
    body: {recipient_user_id: replay.recipient.id, points: 1, request_id: replay.requestId},
  })
  assert.equal(replayResult.response.status, 200)
  assert.equal(replayResult.data.idempotent_replay, true)
  const afterReplay = await balances()
  assert.deepEqual({A: afterReplay.A, B: afterReplay.B}, {A: beforeReplay.A, B: beforeReplay.B})

  const conflict = await directApi(replay.sender, "points-transfer", {
    method: "POST",
    body: {recipient_user_id: replay.recipient.id, points: 2, request_id: replay.requestId},
  })
  assert.equal(conflict.response.status, 409)

  for (const invalidPoints of ["0", "-1", "1.5"]) {
    const invalid = await directApi(users.A, "points-transfer", {
      method: "POST",
      body: {recipient_user_id: users.B.id, points: invalidPoints, request_id: requestId(`invalid_${invalidPoints}`)},
    })
    assert.equal(invalid.response.status, 400)
  }
  const self = await directApi(users.A, "points-transfer", {
    method: "POST",
    body: {recipient_user_id: users.A.id, points: 1, request_id: requestId("self")},
  })
  assert.equal(self.response.status, 422)
  const insufficient = await directApi(users.A, "points-transfer", {
    method: "POST",
    body: {recipient_user_id: users.B.id, points: initial.A + 1, request_id: requestId("insufficient")},
  })
  assert.equal(insufficient.response.status, 422)

  const final = await balances()
  assert.deepEqual({A: final.A, B: final.B}, initial)
  console.log("All four VNSEEA transfer directions passed with idempotency and validation checks.")
}
catch (error) {
  try {
    await reconcile()
  }
  catch (reconcileError) {
    console.error("Staging balance reconciliation failed:", reconcileError)
  }
  throw error
}
