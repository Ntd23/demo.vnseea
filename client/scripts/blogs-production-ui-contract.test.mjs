// English description: Verifies production-safe blog covers, the full comment toolbar, and feed share modal integration.

import assert from "node:assert/strict"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const readClient = relativePath => fs.readFileSync(path.join(clientRoot, relativePath), "utf8")
const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compile } = requireFromVue("@vue/compiler-dom")

const compileVueTemplate = (relativePath) => {
  const source = readClient(relativePath)
  const templateStart = source.indexOf("<template>")
  const scriptStart = source.indexOf("<script")
  const templateEnd = source.lastIndexOf("</template>", scriptStart)
  const errors = []

  compile(source.slice(templateStart + "<template>".length, templateEnd), {
    expressionPlugins: ["typescript"],
    onError: error => errors.push(error.message),
  })

  assert.deepEqual(errors, [], `${relativePath}: ${errors.join("; ")}`)
}

test("blog cover images bypass server-side image proxying in production", () => {
  for (const relativePath of [
    "src/blogs/presentation/components/BlogArticleCard.vue",
    "src/blogs/presentation/components/BlogsFeaturedArticle.vue",
    "src/blogs/presentation/components/ReadBlogHero.vue",
    "src/blogs/presentation/components/ReadBlogSidebar.vue",
  ]) {
    const component = readClient(relativePath)
    assert.match(component, /<img[\s\S]*?:src=/)
    compileVueTemplate(relativePath)
  }
})

test("read blog uses the full comment toolbar and the shared feed modal", () => {
  const main = readClient("src/blogs/presentation/components/ReadBlogMain.vue")
  const page = readClient("src/blogs/presentation/pages/ReadBlogPage.vue")

  assert.match(main, /<FeedCommentComposer[\s\S]*?enable-attachments/)
  assert.match(main, /emit\('openShare'\)|\$emit\('openShare'\)/)
  assert.doesNotMatch(main, /read-blog-main__share-url/)
  assert.match(page, /<FeedShareModal/)
  assert.match(page, /:share-url="shareUrl"/)
  compileVueTemplate("src/blogs/presentation/components/ReadBlogMain.vue")
  compileVueTemplate("src/blogs/presentation/pages/ReadBlogPage.vue")
})

test("blog editing reports validation errors at the exact invalid fields", () => {
  const pageVm = readClient("src/blogs/application/view-models/useCreateBlogPageVM.ts")
  const editorPage = readClient("src/blogs/presentation/pages/CreateBlogPage.vue")

  assert.match(pageVm, /const validationErrors = computed/)
  assert.match(pageVm, /titleValidation/)
  assert.match(pageVm, /contentValidation/)
  assert.match(pageVm, /thumbnailValidation/)
  assert.match(pageVm, /scrollIntoView/)
  assert.match(editorPage, /:error="validationErrors\.title \|\| undefined"/)
  assert.match(editorPage, /:error="validationErrors\.content \|\| undefined"/)
  assert.match(editorPage, /:error="validationErrors\.tags \|\| undefined"/)
  assert.match(editorPage, /:error="validationErrors\.thumbnail \|\| undefined"/)
  assert.match(editorPage, /:color="submitAlertColor"/)
  compileVueTemplate("src/blogs/presentation/pages/CreateBlogPage.vue")
})
