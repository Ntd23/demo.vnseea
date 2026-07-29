import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const repoRoot = new URL("../../", import.meta.url)
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("product API filters marketplace records by their page_id", async () => {
  const [queryType, bridge, endpoint, publicEndpoint, backend] = await Promise.all([
    readRepo("client/src/product/domain/types/product-marketplace.types.ts"),
    readRepo("client/server/api/product/index.get.ts"),
    readRepo("api/v2/endpoints/get-products.php"),
    readRepo("api/v2/endpoints/public-content.php"),
    readRepo("assets/includes/functions_three.php"),
  ])

  assert.match(queryType, /pageId\?: number \| string/)
  assert.match(bridge, /page_id: normalizedPageId \|\| undefined/)
  assert.match(endpoint, /\$options\['page_id'\]/)
  assert.match(publicEndpoint, /'page_id' => Wo_PublicContent_Read\('page_id', 0\)/)
  assert.ok((backend.match(/AND `page_id` = '\{\$page_id\}'/g) ?? []).length >= 2)
})

test("page detail renders a two-column card with four products per page", async () => {
  const [page, card, vietnamese, english] = await Promise.all([
    readRepo("client/src/community/presentation/pages/PageDetailPage.vue"),
    readRepo("client/src/community/presentation/components/PageProductsCard.vue"),
    readRepo("client/i18n/locales/vi.json"),
    readRepo("client/i18n/locales/en.json"),
  ])

  assert.match(page, /<PageProductsCard/)
  assert.match(page, /repository\.getPageBySlug\(pageRouteSlug\.value\)/)
  assert.match(page, /pageId: resolvedPageId/)
  assert.match(page, /limit: 50/)
  assert.match(page, /refresh: refreshPageProducts/)
  assert.match(page, /Promise\.all\(\[[\s\S]*refreshPagePosts\(\),[\s\S]*refreshPageProducts\(\)/)
  assert.ok(page.indexOf("<PageProductsCard") < page.indexOf("v-if=\"suggestedPages.length\""))
  assert.match(card, /const pageSize = 4/)
  assert.match(card, /currentPage\.value = 1/)
  assert.match(card, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(card, /formatProductPrice/)
  assert.match(card, /formatProductPoints/)
  assert.match(card, /product\.title/)
  assert.doesNotMatch(card, /line-clamp/)

  for (const source of [vietnamese, english]) {
    const messages = JSON.parse(source)
    const products = messages.pages.pageDetailPage.products

    assert.ok(products.title)
    assert.ok(products.empty)
    assert.ok(products.previousPage)
    assert.ok(products.nextPage)
  }
})
