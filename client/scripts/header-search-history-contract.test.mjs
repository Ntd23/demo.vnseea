import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("home header search shows account-scoped recent selections and can clear them", () => {
  const content = read("src/navigation/presentation/components/HeaderSearchContent.client.vue")
  const history = read("src/navigation/application/composables/useHeaderSearchHistory.ts")

  assert.match(content, /useHeaderSearchHistory/)
  assert.match(content, /if \(!search\.value\.trim\(\)\)/)
  assert.match(content, /historyItems\.value\.map\(item => toContentSearchItem\(item, true\)\)/)
  assert.match(content, /addHistoryItem\(item\)/)
  assert.match(content, /#history-item-trailing/)
  assert.match(content, /@click\.prevent\.stop="removeSelectedHistoryItem\(item\)"/)
  assert.match(content, /onSelect: clearHistory/)
  assert.match(history, /navigation:header-search-history/)
  assert.match(history, /authStore\.user\?\.id/)
  assert.match(history, /MAX_HISTORY_ITEMS = 8/)
  assert.match(history, /localStorage\.setItem/)
  assert.match(history, /function remove\(/)
  assert.match(history, /localStorage\.removeItem/)
})
