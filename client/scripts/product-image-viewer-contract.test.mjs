// English description: Verifies the product lightbox bypasses production image proxying and supports desktop and mobile navigation.

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

const source = readFileSync(new URL("../src/product/presentation/components/ProductImageViewer.vue", import.meta.url), "utf8")
const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compileScript, parse } = requireFromVue("@vue/compiler-sfc")

test("product lightbox uses original images and exposes multi-image navigation", () => {
  assert.match(source, /<img[\s\S]*?:src="currentImage\.src"/)
  assert.doesNotMatch(source, /<NuxtImg/)
  assert.match(source, /product-image-viewer__nav--previous[\s\S]*?@click="previous"/)
  assert.match(source, /product-image-viewer__nav--next[\s\S]*?@click="next"/)
  assert.match(source, /const canNavigate = computed\(\(\) => props\.images\.length > 1\)/)
  assert.match(source, /\.product-image-viewer__nav\s*\{[\s\S]*?border:\s*1px solid var\(--border-light\)/)
  assert.match(source, /\.product-image-viewer__nav\s*\{[\s\S]*?color:\s*var\(--text-primary\)/)
  assert.match(source, /\.product-image-viewer__nav\s*\{[\s\S]*?background:\s*var\(--bg-surface\)/)
  assert.match(source, /\.product-image-viewer__nav:hover\s*\{[\s\S]*?background:\s*var\(--bg-surface-active\)/)
  assert.match(source, /\.product-image-viewer__heading\s*\{[\s\S]*?background:\s*var\(--bg-surface\)/)
  assert.match(source, /\.product-image-viewer__heading strong\s*\{[\s\S]*?color:\s*var\(--text-primary\)/)
  assert.match(source, /\.product-image-viewer__heading span\s*\{[\s\S]*?color:\s*var\(--text-secondary\)/)
})

test("product lightbox accepts horizontal touch swipes", () => {
  assert.match(source, /@touchstart\.passive="handleTouchStart"/)
  assert.match(source, /@touchend\.passive="handleTouchEnd"/)
  assert.match(source, /Math\.abs\(deltaX\) < minimumSwipeDistance/)
  assert.match(source, /if \(deltaX > 0\) previous\(\)/)
  assert.match(source, /touch-action:\s*pan-y pinch-zoom/)

  const { descriptor, errors } = parse(source, { filename: "ProductImageViewer.vue" })
  assert.deepEqual(errors, [])
  assert.doesNotThrow(() => compileScript(descriptor, { id: "product-image-viewer" }))
})
