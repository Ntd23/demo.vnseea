import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const source = await readFile(
  new URL("../src/feed/presentation/components/FeedPublisherBox.vue", import.meta.url),
  "utf8",
)

assert.match(source, /const visibleMediaPreviews = computed\(\(\) => mediaPreviews\.value\.slice\(0,\s*4\)\)/)
assert.match(source, /const hiddenMediaCount = computed/)
assert.match(source, /v-for="\(preview, idx\) in visibleMediaPreviews"/)
assert.match(source, /\+\{\{ hiddenMediaCount \}\}/)
assert.match(source, /publisher__media-previews--count-2/)
assert.match(source, /publisher__media-previews--count-3/)
assert.match(source, /publisher__media-previews--count-4/)
assert.match(source, /height:\s*clamp\(240px,\s*42vw,\s*360px\)/)
assert.match(source, /class="publisher__preview-backdrop"/)
assert.match(source, /publisher__preview-backdrop[\s\S]*object-fit:\s*cover/)
assert.match(source, /publisher__media-previews--multiple \.publisher__preview-content[\s\S]*object-fit:\s*contain/)

console.log("feed publisher media preview grid contract: ok")
