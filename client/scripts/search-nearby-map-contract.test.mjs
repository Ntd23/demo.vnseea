import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const source = fs.readFileSync(
  new URL("../src/search-nearby/presentation/components/NearbySearchMap.vue", import.meta.url),
  "utf8",
)

test("Google Map initialization stops when its Vue host has unmounted", () => {
  assert.match(source, /let isMapComponentMounted = false/)
  assert.match(
    source,
    /const targetElement = mapElement\.value[\s\S]*!isMapComponentMounted[\s\S]*targetElement instanceof HTMLElement/,
  )
  assert.match(source, /new constructors\.Map\(targetElement,/)
  assert.match(source, /onBeforeUnmount\(\(\) => \{\s*isMapComponentMounted = false/)
})
