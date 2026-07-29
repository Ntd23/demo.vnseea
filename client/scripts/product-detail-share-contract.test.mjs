// English description: Verifies product detail reuses the permission-aware feed post sharing flow beside the buy action.

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

const readClient = relativePath =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8")
const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compile } = requireFromVue("@vue/compiler-dom")

test("product detail shares the underlying post through the shared feed modal", () => {
  const page = readClient("src/product/presentation/pages/ProductDetailPage.vue")

  assert.match(page, /createApiFeedRepository/)
  assert.match(page, /feedRepository\.getPostById\(productPostId\.value\)/)
  assert.match(page, /v-if="productPost\?\.permissions\.canShare"/)
  assert.match(page, /@click="shareModalOpen = true"/)
  assert.match(page, /<FeedShareModal/)
  assert.match(page, /:can-share="productPost\.permissions\.canShare"/)
  assert.match(page, /id:\s*productPost\.id/)

  const templateStart = page.indexOf("<template>")
  const scriptStart = page.indexOf("<script")
  const templateEnd = page.lastIndexOf("</template>", scriptStart)
  const template = page.slice(templateStart + "<template>".length, templateEnd)
  const errors = []

  compile(template, {
    expressionPlugins: ["typescript"],
    onError: error => errors.push(error.message),
  })

  assert.deepEqual(errors, [], errors.join("; "))
})
