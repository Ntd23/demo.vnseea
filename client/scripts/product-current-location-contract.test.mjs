import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientRoot = new URL("../", import.meta.url)
const repoRoot = new URL("../../", import.meta.url)
const readClient = path => readFile(new URL(path, clientRoot), "utf8")
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("nearby stores applies 15 km without navigating to the map", async () => {
  const [page, marketplace] = await Promise.all([
    readClient("src/product/presentation/pages/ProductsPage.vue"),
    readClient("src/product/application/composables/useProductMarketplace.ts"),
  ])

  assert.match(page, /@click="applyNearbyStores"/)
  assert.doesNotMatch(page, /:to="appRoutes\.searchNearby"/)
  assert.match(marketplace, /distanceRange\.value = 15/)
  assert.match(marketplace, /navigator\.geolocation\.getCurrentPosition/)
})

test("distance filtering forwards browser coordinates instead of relying on profile pins", async () => {
  const [marketplace, bridge, endpoint, productQuery] = await Promise.all([
    readClient("src/product/application/composables/useProductMarketplace.ts"),
    readClient("server/api/product/index.get.ts"),
    readRepo("api/v2/endpoints/get-products.php"),
    readRepo("assets/includes/functions_three.php"),
  ])

  assert.match(marketplace, /latitude:\s*currentCoordinates\.value\?\.latitude/)
  assert.match(marketplace, /longitude:\s*currentCoordinates\.value\?\.longitude/)
  assert.match(bridge, /latitude:\s*requestedDistance && hasCurrentCoordinates/)
  assert.match(endpoint, /\$has_request_coordinates/)
  assert.doesNotMatch(endpoint, /\$has_user_coordinates/)
  assert.match(productQuery, /\$has_request_coordinates \? \(float\) \$filter_data\['latitude'\]/)
  assert.match(productQuery, /LEFT JOIN " \. T_PAGES/)
  assert.match(productQuery, /LEFT JOIN " \. T_USERS/)
  assert.match(productQuery, /LEAST\(1, GREATEST\(-1,/)
  assert.match(productQuery, /HAVING distance <=/)
})

test("editing without coordinates does not erase an existing product position", async () => {
  const endpoint = await readRepo("api/v2/endpoints/edit-product.php")

  assert.match(endpoint, /isset\(\$_POST\['lat'\], \$_POST\['lng'\]\)/)
  assert.doesNotMatch(endpoint, /\$lat\s*=\s*\(!empty\(\$_POST\['lat'\]\)\)\s*\?.*:\s*0/)
})
