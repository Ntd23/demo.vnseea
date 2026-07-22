import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const viewModel = readFileSync(
  new URL("../src/settings/application/view-models/useSettingsMyPointsPanelVM.ts", import.meta.url),
  "utf8",
)
const vi = JSON.parse(
  readFileSync(new URL("../i18n/locales/vi.json", import.meta.url), "utf8"),
)
const en = JSON.parse(
  readFileSync(new URL("../i18n/locales/en.json", import.meta.url), "utf8"),
)

test("Nuxt labels the API v2 registration reward explicitly", () => {
  assert.match(viewModel, /signup_bonus/)
  assert.match(viewModel, /signupBonusHistoryTitle/)
  assert.equal(
    vi.settings.data.pointsPanel.signupBonusHistoryTitle,
    "Thưởng đăng ký",
  )
  assert.equal(
    en.settings.data.pointsPanel.signupBonusHistoryTitle,
    "Registration bonus",
  )
})
