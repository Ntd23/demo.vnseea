// English description: Verifies shared job posts keep the dedicated job presentation in feed and message surfaces.

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const readClient = relativePath =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8")

test("feed shares render the original job through the dedicated job card", () => {
  const card = readClient("src/feed/presentation/components/PostCard.vue")

  assert.match(card, /v-else-if="post\.sharedPost\?\.jobId"/)
  assert.match(card, /:post-id="post\.sharedPost\.id"/)
  assert.match(card, /:fallback-title="post\.sharedPost\.text"/)
})

test("message shares enrich job data and render job-specific details", () => {
  const bridge = readClient("server/api/messages/_shared.ts")
  const card = readClient("src/messages/presentation/components/MessageSharedPostCard.vue")
  const types = readClient("src/messages/domain/types/messages.types.ts")

  assert.match(bridge, /post\?\.sharedPost\?\.jobId/)
  assert.match(bridge, /fetchJobDetailByPostId\(event, jobPost\.id\)/)
  assert.match(bridge, /imageUrl:\s*job\?\.imageUrl/)
  assert.match(types, /job\?:\s*\{[\s\S]*salaryLabel:\s*string/)
  assert.match(card, /v-if="post\.available && post\.job"/)
  assert.match(card, /post\.job\.title/)
  assert.match(card, /post\.job\.categoryLabel/)
  assert.match(card, /post\.job\.salaryLabel/)
  assert.doesNotMatch(card, /post\.job\.ownerName/)
})
