import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const source = readFileSync(
  new URL("../src/offer/presentation/components/OfferFormModal.vue", import.meta.url),
  "utf8",
)

test("page offer modal owns the same responsive width as its form", () => {
  assert.match(source, /content: 'w-\[calc\(100vw-24px\)\] max-w-\[800px\]/)
  assert.match(source, /\.offer-form\s*\{[\s\S]*?width:\s*100%/)
  assert.match(source, /max-width:\s*100%/)
  assert.doesNotMatch(source, /width:\s*min\(92vw,\s*800px\)/)
})

test("page offer modal keeps actions visible while only the form body scrolls", () => {
  assert.match(source, /class="offer-form__body"/)
  assert.match(source, /\.offer-form__body\s*\{[\s\S]*?overflow-y:\s*auto/)
  assert.match(source, /\.offer-form\s*\{[\s\S]*?overflow:\s*hidden/)
  assert.match(source, /\.offer-form__header,[\s\S]*?\.offer-form__footer\s*\{[\s\S]*?flex:\s*0 0 auto/)
})

test("page offer modal fields can shrink without horizontal overflow", () => {
  assert.match(source, /grid min-w-0 grid-cols-1/)
  assert.match(source, /\.offer-form__file\s*\{[\s\S]*?min-width:\s*0/)
  assert.match(source, /class="min-w-0 w-full"/)
})
