import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

const root = new URL("../../", import.meta.url)
const clientRoot = new URL("../", import.meta.url)
const readRoot = path => readFile(new URL(path, root), "utf8")
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("canonical backend endpoint delegates to the shared transactional service", async () => {
  const endpoint = await readRoot("api/v2/endpoints/points-transfer.php")
  const service = await readRoot("assets/includes/vnseea_points_transfer.php")

  assert.match(endpoint, /Wo_TransferPoints/)
  assert.match(service, /POINTS_SENT/)
  assert.match(service, /POINTS_RECEIVED/)
  assert.match(service, /mysqli_begin_transaction/)
  assert.match(service, /mysqli_commit/)
  assert.match(service, /mysqli_rollback/)
  assert.match(service, /sender_transaction_id/)
  assert.match(service, /recipient_transaction_id/)
  assert.match(service, /if \(!\$recipient_transaction_id \|\| !\$sender_transaction_id\)[\s\S]*mysqli_rollback/)
  assert.ok(service.indexOf("$recipient_transaction_id = Wo_PointsTransferInsertHistory") < service.lastIndexOf("mysqli_commit"))
  assert.match(service, /'POINTS_SENT'/)
  assert.match(service, /'POINTS_RECEIVED'/)
  assert.ok(service.includes("VALUES ({$safe_user_id}, '{$safe_kind}', 0"))
})

test("migration enforces sender scoped request id uniqueness", async () => {
  const migration = await readRoot("database/migrations/20260713_create_points_transfer_requests.sql")

  assert.match(migration, /ENGINE=InnoDB/i)
  assert.match(migration, /UNIQUE KEY `uniq_sender_request` \(`sender_id`, `request_id`\)/)
  assert.match(migration, /request_id` VARCHAR\(80\) CHARACTER SET ascii COLLATE ascii_bin/)
})

test("Nuxt points transfer BFF uses the canonical API and strict request fields", async () => {
  const source = await readClient("server/api/settings/points-transfer.post.ts")

  assert.match(source, /createBackendApiClient/)
  assert.match(source, /"points-transfer"/)
  assert.match(source, /requestId/)
  assert.doesNotMatch(source, /send-points/)
  assert.doesNotMatch(source, /Math\.trunc\(asNumber/)
})

test("Nuxt receive QR keeps the canonical backend PNG proxy", async () => {
  const source = await readClient("server/api/settings/points-qr-image.get.ts")
  const packageJson = await readClient("package.json")

  assert.match(source, /points-qr-code/)
  assert.match(source, /image\/png/)
  assert.match(source, /\^\[1-9\]\[0-9\]\*\$/)
  assert.match(source, /getBackendBaseCandidates/)
  assert.doesNotMatch(source, /renderSVG|from ["']uqr["']/)
  assert.doesNotMatch(packageJson, /"uqr"\s*:/)
})

test("Nuxt points UI persists the idempotency key for ambiguous retries", async () => {
  const source = await readClient("src/settings/application/view-models/useSettingsMyPointsPanelVM.ts")

  assert.match(source, /sessionStorage/)
  assert.match(source, /points-transfer:pending/)
  assert.match(source, /requestId/)
  assert.match(source, /prefix !== "POINTS" && prefix !== "WALLET"/)
})

test("legacy transfer bridges delegate to the canonical service", async () => {
  const apiWallet = await readRoot("api/v2/endpoints/wallet.php")
  const xhrWallet = await readRoot("xhr/wallet.php")

  assert.match(apiWallet, /Wo_TransferPoints/)
  assert.match(xhrWallet, /Wo_TransferPoints/)
  assert.doesNotMatch(apiWallet, /POINTS_EARNED|POINTS_DEDUCT/)
})

test("unused Nuxt wallet-money transfer routes are removed", async () => {
  await assert.rejects(readClient("server/api/wallet/send.post.ts"), /ENOENT/)
  await assert.rejects(readClient("server/api/wallet/receive-qr.get.ts"), /ENOENT/)
})
