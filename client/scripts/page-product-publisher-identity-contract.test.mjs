import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const repoRoot = new URL("../../", import.meta.url)
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("embedded page product form forwards page_id through product and post creation", async () => {
  const [publisher, productForm, backend] = await Promise.all([
    readRepo("client/src/feed/presentation/components/FeedPublisherBox.vue"),
    readRepo("client/src/product/presentation/pages/NewProductPage.vue"),
    readRepo("api/v2/endpoints/create-product.php"),
  ])

  assert.match(publisher, /<NewProductPage[\s\S]*:page-id="pageId"/)
  assert.match(productForm, /pageId\?: number/)
  assert.match(productForm, /form\.append\("page_id", String\(props\.pageId\)\)/)
  assert.match(backend, /Wo_IsPageOnwer\(\$requested_page_id\)/)
  assert.match(backend, /'page_id' => \$page_id/)
  assert.ok((backend.match(/'page_id' => \$page_id/g) ?? []).length >= 2)
})

test("feed mapper uses page_info as the visible publisher for page posts", async () => {
  const mapper = await readRepo("client/server/api/feed/_shared.ts")

  assert.match(mapper, /const directPageData = asRecord\(entity\.page_data\)/)
  assert.match(mapper, /const pageInfo = asRecord\(entity\.page_info\)/)
  assert.match(mapper, /const publisherIsPage =/)
  assert.match(mapper, /const pageIdentity =/)
  assert.match(mapper, /pageId && Object\.keys\(pageIdentity\)\.length > 0/)
  assert.match(mapper, /firstString\(pageIdentity, \["name", "page_title", "page_name", "username"\]\)/)
  assert.match(mapper, /pageSlug \? "page"/)
})
