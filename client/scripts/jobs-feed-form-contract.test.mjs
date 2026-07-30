// English description: Verifies public job posts remain in the main feed and job forms preview images and validate phone digits.

import assert from "node:assert/strict"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = path.resolve(clientRoot, "..")
const readClient = relativePath => fs.readFileSync(path.join(clientRoot, relativePath), "utf8")
const readRepo = relativePath => fs.readFileSync(path.join(repoRoot, relativePath), "utf8")
const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compile } = requireFromVue("@vue/compiler-dom")

const compileVueTemplate = (relativePath) => {
  const source = readClient(relativePath)
  const templateStart = source.indexOf("<template>")
  const scriptStart = source.indexOf("<script")
  const templateEnd = source.lastIndexOf("</template>", scriptStart)
  const template = source.slice(templateStart + "<template>".length, templateEnd)
  const errors = []

  compile(template, {
    expressionPlugins: ["typescript"],
    onError: error => errors.push(error.message),
  })

  assert.deepEqual(errors, [], `${relativePath}: ${errors.join("; ")}`)
}

test("regular feed no longer excludes enabled public job posts", () => {
  const feedQuery = readRepo("assets/includes/functions_one.php")

  assert.doesNotMatch(
    feedQuery,
    /filter_by'\]\s*!=\s*'job'[\s\S]{0,240}job_id`\s*=\s*'0'/,
  )
  assert.match(feedQuery, /job_system'\]\s*!=\s*1[\s\S]{0,160}job_id`\s*=\s*'0'/)
})

test("job composer renders and cleans up a local image preview", () => {
  const composer = readClient("src/jobs/presentation/components/JobPostModal.vue")

  assert.match(composer, /URL\.createObjectURL\(file\)/)
  assert.match(composer, /URL\.revokeObjectURL\(thumbnailPreviewUrl\.value\)/)
  assert.match(composer, /v-if="thumbnailPreviewUrl"/)
  assert.match(composer, /:src="thumbnailPreviewUrl"/)
  compileVueTemplate("src/jobs/presentation/components/JobPostModal.vue")
})

test("job locations use Google coordinates and distance filters use the current device origin", () => {
  const composer = readClient("src/jobs/presentation/components/JobPostModal.vue")
  const filtersComponent = readClient("src/jobs/presentation/components/JobsFilters.vue")
  const pageVm = readClient("src/jobs/application/view-models/useJobsPageVM.ts")
  const repository = readClient("src/jobs/infrastructure/repositories/ApiJobsRepository.ts")
  const jobsBridge = readClient("server/api/jobs/_shared.ts")
  const apiEndpoint = readRepo("api/v2/endpoints/job.php")
  const backendQuery = readRepo("assets/includes/functions_three.php")

  assert.match(composer, /<GooglePlaceField/)
  assert.match(composer, /require-coordinates/)
  assert.match(composer, /form\.lat === null \|\| form\.lng === null/)
  assert.match(pageVm, /navigator\.geolocation\.getCurrentPosition/)
  assert.match(pageVm, /const stableCatalogFilters = refDebounced\(requestedCatalogFilters, 80\)/)
  assert.match(pageVm, /window\.history\.replaceState/)
  assert.match(filtersComponent, /:max="distanceSliderMax"/)
  assert.match(filtersComponent, /distance > 0 \? String\(distance\) : ""/)
  assert.match(pageVm, /originLat: shouldFilterDistance/)
  assert.match(repository, /originLat: normalizeCoordinate/)
  assert.match(jobsBridge, /latitude: input\.originLat/)
  assert.match(apiEndpoint, /\$array\['latitude'\]/)
  assert.match(backendQuery, /\$has_request_coordinates/)
  assert.match(backendQuery, /acos\(LEAST\(1, GREATEST\(-1,/)
  compileVueTemplate("src/jobs/presentation/components/JobPostModal.vue")
  compileVueTemplate("src/jobs/presentation/components/JobsFilters.vue")
  compileVueTemplate("src/jobs/presentation/pages/JobsPage.vue")
})

test("job application accepts only a bounded string of phone digits on client and server", () => {
  const form = readClient("src/jobs/presentation/components/JobApplyModal.vue")
  const bridge = readClient("server/api/jobs/apply.post.ts")

  assert.match(form, /replace\(\/\\D\/g,\s*""\)/)
  assert.match(form, /\/\^\\d\{8,15\}\$\//)
  assert.match(bridge, /\/\^\\d\{8,15\}\$\//)
  compileVueTemplate("src/jobs/presentation/components/JobApplyModal.vue")
})
