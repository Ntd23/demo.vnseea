import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const component = readFileSync(
  new URL("../src/community/presentation/components/PageSettingsAnalyticCard.vue", import.meta.url),
  "utf8",
)

test("page analytics template relies on Vue computed auto-unwrapping", () => {
  const template = component.match(/<template>([\s\S]*?)<\/template>/)?.[1] ?? ""

  assert.doesNotMatch(template, /copy\.value\./)
  assert.match(template, /\{\{\s*copy\.loading\s*\}\}/)
  assert.match(template, /:aria-label="copy\.filterAria"/)
})

test("page analytics period fallback reads the computed value", () => {
  assert.match(component, /periodOptions\.value\[1\]/)
  assert.doesNotMatch(component, /periodOptions\[1\]/)
})
