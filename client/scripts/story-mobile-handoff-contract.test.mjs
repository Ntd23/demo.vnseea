import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")

test("story creation opens the web creator directly while the native app prompt is disabled", async () => {
  const [carousel, interstitial, vietnamese, english] = await Promise.all([
    readClient("src/feed/presentation/components/StoryCarousel.vue"),
    readClient("src/feed/presentation/components/StoryAppInterstitial.vue"),
    readClient("i18n/locales/vi.json"),
    readClient("i18n/locales/en.json"),
  ])
  const activeCarousel = carousel
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")

  assert.match(carousel, /Story app interstitial temporarily disabled until the iOS and Android apps are released/)
  assert.doesNotMatch(activeCarousel, /StoryAppInterstitial/)
  assert.doesNotMatch(
    activeCarousel,
    /appPromptOpen|isMobileViewport|storyAppPromptSkippedKey|continueStoryOnWeb/,
  )
  assert.match(
    activeCarousel,
    /async function handleCreateStory\(\) \{\s*await router\.push\(feedStoryCreatePath\)\s*\}/,
  )

  // Keep the dormant handoff component ready for re-enabling after App Store release.
  assert.match(interstitial, /@click="continueOnWeb"/)
  assert.match(interstitial, /emit\("continue"\)/)
  assert.equal(JSON.parse(vietnamese).feed.storyCarousel.continueOnWeb, "Bỏ qua, tiếp tục trên web")
  assert.equal(JSON.parse(english).feed.storyCarousel.continueOnWeb, "Skip and continue on web")
})
