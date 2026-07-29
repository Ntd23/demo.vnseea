import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8")

const [
  jobsPageVm,
  jobDetailVm,
  jobCard,
  feedPostVm,
  routeRegistry,
  phpJobEndpoint,
] = await Promise.all([
  read("src/jobs/application/view-models/useJobsPageVM.ts"),
  read("src/jobs/application/view-models/useJobDetailVM.ts"),
  read("src/jobs/presentation/components/JobCard.vue"),
  read("src/feed/application/view-models/useFeedPostCardVM.ts"),
  read("src/shared-kernel/application/constants/route-registry.ts"),
  read("../api/v2/endpoints/job.php"),
])

assert.match(jobsPageVm, /alreadyApplied:\s*true[\s\S]*canApply:\s*false/)
assert.doesNotMatch(jobsPageVm, /items\.value\s*=\s*items\.value\.filter\([^)]*alreadyApplied/)
assert.match(jobsPageVm, /selectedJob\.alreadyApplied[\s\S]*!selectedJob\.canApply/)

assert.match(jobCard, /v-else-if="job\.alreadyApplied"[\s\S]*disabled/)
assert.match(jobCard, /appRoutes\.jobDetail\(props\.job\.id\)/)
assert.match(jobDetailVm, /alreadyApplied:\s*true[\s\S]*canApply:\s*false/)

assert.match(feedPostVm, /!Number\.isInteger\(currentPostId\)[\s\S]*currentPostId < 1/)
assert.match(routeRegistry, /jobDetail:\s*\(id:[^)]+\)\s*=>\s*`\/jobs\//)
assert.match(phpJobEndpoint, /if \(\$_POST\['type'\] == 'detail'\)/)

console.log("jobs applied visibility contract: ok")
