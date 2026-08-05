import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = path.resolve(clientRoot, "..")
const endpoint = fs.readFileSync(path.join(repoRoot, "api/v2/endpoints/job.php"), "utf8")

test("job creation does not require a page cover or uploaded image", () => {
  assert.doesNotMatch(endpoint, /if\s*\(!empty\(\$insert_array\['image'\]\)\)\s*\{/)
  assert.match(endpoint, /\$insert_array\['image'\]\s*=\s*'';/)
  assert.match(endpoint, /!empty\(\$page_data->cover\)/)
})

test("job creation supports the personal account when page_id is omitted", () => {
  assert.doesNotMatch(endpoint, /&&\s*!empty\(\$_POST\['page_id'\]\)/)
  assert.match(endpoint, /\$page_id\s*=\s*0;/)
  assert.match(endpoint, /'user_id'\s*=>\s*\$page_id\s*>\s*0\s*\?\s*0\s*:\s*\$wo\['user'\]\['id'\]/)
  assert.match(endpoint, /\$page_owner_valid\s*=\s*!empty\(\$page_data\).*\$wo\['user'\]\['id'\]/)
})

test("job and feed post creation are committed atomically", () => {
  assert.match(endpoint, /\$db->startTransaction\(\)/)
  assert.match(endpoint, /\$db->commit\(\)/)
  assert.match(endpoint, /\$db->rollback\(\)/)
  assert.match(endpoint, /'job_id'\s*=>\s*\$job_id/)
  assert.match(endpoint, /'post_id'\s*=>\s*\$post_id/)
})

test("an invalid explicit upload fails before creating database rows", () => {
  assert.match(endpoint, /job_upload_failed/)
  assert.match(endpoint, /empty\(\$media\['filename'\]\)/)
})
