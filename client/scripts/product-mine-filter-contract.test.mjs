import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("my products requests and enforces the authenticated owner filter", async () => {
  const [overview, bridge] = await Promise.all([
    readClient("src/product/application/composables/useMyProductsOverview.ts"),
    readClient("server/api/product/index.get.ts"),
  ])

  assert.match(overview, /repository\.list\(\{\s*mine:\s*true,\s*limit:\s*50\s*\}\)/)
  assert.match(bridge, /\["1", "true"\]\.includes/)
  assert.match(bridge, /user_id:\s*mineOnly\s*\?\s*currentUserId/)
  assert.match(bridge, /if\s*\(mineOnly && !currentUserId\)/)
})
