import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const source = readFileSync(
  new URL("../src/reels/presentation/pages/ReelsPage.vue", import.meta.url),
  "utf8",
)

const readZIndex = selector => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{[\\s\\S]*?z-index:\\s*(\\d+)`))

  assert.ok(match, `Missing z-index for ${selector}`)
  return Number(match[1])
}

test("paused reel overlay stays below interactive controls", () => {
  const playOverlayZIndex = readZIndex(".reels-page__play-overlay")

  assert.ok(playOverlayZIndex > readZIndex(".reels-page__video"))
  assert.ok(playOverlayZIndex < readZIndex(".reels-page__info"))
  assert.ok(playOverlayZIndex < readZIndex(".reels-page__actions"))
  assert.ok(playOverlayZIndex < readZIndex(".reels-page__back-button"))
})
