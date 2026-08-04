import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("mobile story app prompt has a session-aware web fallback", async () => {
  const [carousel, interstitial, vietnamese, english] = await Promise.all([
    readClient("src/feed/presentation/components/StoryCarousel.vue"),
    readClient("src/feed/presentation/components/StoryAppInterstitial.vue"),
    readClient("i18n/locales/vi.json"),
    readClient("i18n/locales/en.json"),
  ])

  assert.match(interstitial, /@click="continueOnWeb"/)
  assert.match(interstitial, /emit\("continue"\)/)
  assert.match(carousel, /@continue="continueStoryOnWeb"/)
  assert.match(carousel, /sessionStorage\.setItem\(storyAppPromptSkippedKey, "1"\)/)
  assert.match(carousel, /router\.push\(feedStoryCreatePath\)/)
  assert.equal(JSON.parse(vietnamese).feed.storyCarousel.continueOnWeb, "Bỏ qua, tiếp tục trên web")
  assert.equal(JSON.parse(english).feed.storyCarousel.continueOnWeb, "Skip and continue on web")
})
