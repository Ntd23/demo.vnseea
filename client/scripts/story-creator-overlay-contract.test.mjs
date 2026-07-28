import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("story creator previews text and following-only mentions inside the viewer frame", () => {
  const page = read("src/feed/presentation/pages/StatusCreatePage.vue")

  assert.match(page, /class="story-create__preview-author"/)
  assert.match(page, /class="story-create__preview-tools"/)
  assert.match(page, /i-ph-text-aa-bold/)
  assert.match(page, /i-ph-at-bold/)
  assert.match(page, /ref="textInputRef"/)
  assert.match(page, /ref="captionInputRef"/)
  assert.match(page, /startOverlayDrag\('text', \$event\)/)
  assert.match(page, /startOverlayDrag\('mention', \$event\)/)
  assert.match(page, /\.story-create__overlay-input[\s\S]*background:\s*transparent/)
  assert.match(page, /followingOnly:\s*true/)
  assert.match(page, /const backendMention = createBackendMentionText\(\)\.trim\(\)/)
  assert.match(page, /description:\s*backendMention/)
  assert.match(page, /textOverlayPosition/)
  assert.match(page, /mentionOverlayPosition/)
})

test("published story shows status and profile links in the viewer", () => {
  const carousel = read("src/feed/presentation/components/StoryCarousel.vue")
  const viewer = read("src/feed/application/view-models/useFeedStoryCarouselVM.ts")

  assert.match(carousel, /activeStoryProfilePath/)
  assert.match(carousel, /appRoutes\.profile\(username\)/)
  assert.match(carousel, /class="story-viewer__author-status"/)
  assert.match(carousel, /v-if="activeStoryIsMine"[\s\S]*class="story-viewer__author-status"/)
  assert.match(carousel, /activeStoryAudienceLabel/)
  assert.match(carousel, /activeStoryMentionProfilePath/)
  assert.match(carousel, /activeStoryData\.value\?\.overlays\?\.mention\?\.username/)
  assert.match(carousel, /story-viewer__story-overlay--text/)
  assert.match(carousel, /story-viewer__story-overlay--mention/)
  assert.match(carousel, /preload="auto"/)
  assert.match(viewer, /if \(isVideoStory\(story\) && activeVideoRef\.value\)/)
  assert.match(viewer, /video\.load\(\)/)
  assert.match(viewer, /video\.play\(\)/)
})

test("story overlay contents and normalized coordinates persist through the backend", () => {
  const repository = read("src/feed/infrastructure/repositories/ApiFeedRepository.ts")
  const bridge = read("server/api/feed/stories/create.post.ts")
  const mapper = read("server/api/feed/_shared.ts")
  const endpoint = read("../api/v2/endpoints/create-story.php")
  const migration = read("../database/migrations/20260728_story_overlay_data.sql")

  assert.match(repository, /formData\.append\("overlays", JSON\.stringify\(input\.overlays\)\)/)
  assert.match(bridge, /payload\.append\("story_overlay", JSON\.stringify\(overlays\)\)/)
  assert.match(bridge, /\.\.\.\(username \? \{ username \} : \{\}\)/)
  assert.match(endpoint, /overlay_data/)
  assert.match(mapper, /normalizeStoryOverlays\(entity\.overlay_data\)/)
  assert.match(mapper, /fallbackMentionUsername/)
  assert.match(mapper, /normalizeContentAudienceSelection\(entity\.privacy\)\.audience/)
  assert.match(migration, /ADD COLUMN `overlay_data` TEXT/)
})
