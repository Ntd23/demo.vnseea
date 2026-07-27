import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const repoRoot = new URL("../../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("product price sorting compares VND-normalized values", async () => {
  const [service, normalizer, php] = await Promise.all([
    readClient("src/product/domain/services/product-marketplace.service.ts"),
    readClient("server/api/product/_shared.ts"),
    readRepo("assets/includes/functions_three.php"),
  ])

  assert.match(service, /left\.priceVnd - right\.priceVnd/)
  assert.match(service, /right\.priceVnd - left\.priceVnd/)
  assert.match(normalizer, /priceVnd:\s*asNumber\(product\.price_vnd/)
  assert.match(php, /function Wo_ConvertProductPriceToVnd/)
  assert.match(php, /ORDER BY \{\$vnd_price_sql\} ASC/)
  assert.match(php, /ORDER BY \{\$vnd_price_sql\} DESC/)
})

test("product prices always use Vietnamese dot grouping without backend mixed separators", async () => {
  const [formatter, directory] = await Promise.all([
    readClient("src/product/application/formatters/product-currency.ts"),
    readClient("src/directory/presentation/pages/DirectoryIndexPage.vue"),
  ])

  assert.match(formatter, /new Intl\.NumberFormat\("vi-VN"/)
  assert.match(formatter, /maximumFractionDigits:\s*0/)
  assert.doesNotMatch(formatter, /product\.priceFormat/)
  assert.doesNotMatch(formatter, /currencyRule:\s*product\.currencyRule/)
  assert.match(directory, /formatDirectoryProductPrice\(product\)/)
  assert.doesNotMatch(directory, /product\.priceFormat \|\|/)
})
