import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const repoRoot = new URL("../../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("product edit sends fields, removed image ids, and new images as multipart data", async () => {
  const [repository, bridge] = await Promise.all([
    readClient("src/product/infrastructure/repositories/ApiProductRepository.ts"),
    readClient("server/api/product/[id].post.ts"),
  ])

  assert.match(repository, /const form = new FormData\(\)/)
  assert.match(repository, /form\.append\("deleted_images_ids"/)
  assert.match(repository, /form\.append\("images\[\]"/)
  assert.match(bridge, /readMultipartFormData\(event\)/)
  assert.match(bridge, /form\.append\("product_id", id\)/)
})

test("PHP edit API reports a failed database update instead of returning false success", async () => {
  const endpoint = await readRepo("api/v2/endpoints/edit-product.php")

  assert.match(endpoint, /\$product_data\s*=\s*Wo_UpdateProductData/)
  assert.match(endpoint, /if \(!\$product_data\)/)
  assert.match(endpoint, /'api_status'\s*=>\s*400/)
  assert.match(endpoint, /\$_POST\['units'\]\s*>=\s*0/)
})
