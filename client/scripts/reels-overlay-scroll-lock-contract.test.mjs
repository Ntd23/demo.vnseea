import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const source = await readFile(
  new URL("../src/reels/presentation/components/ReelsViewerOverlay.vue", import.meta.url),
  "utf8",
)

assert.match(source, /const scrollLockClass = "reels-viewer-scroll-locked"/)
assert.match(source, /document\.documentElement\.classList\.add\(scrollLockClass\)/)
assert.match(source, /document\.body\.classList\.add\(scrollLockClass\)/)
assert.match(source, /document\.documentElement\.classList\.remove\(scrollLockClass\)/)
assert.match(source, /document\.body\.classList\.remove\(scrollLockClass\)/)
assert.match(source, /\{ flush: "sync", immediate: true \}/)
assert.match(source, /overflow: hidden !important/)
assert.match(source, /onBeforeUnmount\(\(\) => \{[\s\S]*unlockPageScroll\(\)/)

console.log("reels overlay scroll lock contract: ok")
