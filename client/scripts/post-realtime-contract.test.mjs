import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8")

test("PHP post payload and mutations use canonical realtime helpers", () => {
  const functions = read("assets/includes/functions_one.php")
  const actions = read("api/v2/endpoints/post-actions.php")
  const comments = read("api/v2/endpoints/comments.php")
  const posts = read("api/v2/endpoints/posts.php")

  assert.match(functions, /function Wo_CanDeletePost\(/)
  assert.match(functions, /\['can_delete'\]\s*=\s*Wo_CanDeletePost\(/)
  assert.match(functions, /function Wo_PublishRealtimePostChange\(/)
  assert.match(actions, /Wo_PublishRealtimePostChange\([^,]+,\s*'deleted'\)/)
  assert.match(actions, /Wo_PublishRealtimePostChange\([^,]+,\s*'reaction'\)/)
  assert.match(comments, /if \(\$DeleteComment\)/)
  assert.match(comments, /Wo_PublishRealtimePostChange\([^,]+,\s*'comment'\)/)
  assert.match(posts, /Wo_PublishRealtimePostChange\([^,]+,\s*'share'\)/)
})

test("Nuxt maps backend delete permission and does not infer it from owner/admin", () => {
  const shared = read("client/server/api/feed/_shared.ts")
  const types = read("client/src/feed/domain/types/feed.types.ts")
  const header = read("client/src/feed/presentation/components/PostHeader.vue")

  assert.match(types, /permissions:\s*\{[\s\S]*canDelete:\s*boolean/)
  assert.match(shared, /canDelete:\s*isTruthy\(entity\.can_delete\)/)
  assert.match(header, /props\.canDelete/)
  assert.doesNotMatch(header, /props\.isOwner\s*\|\|\s*props\.isAdmin/)
})

test("Nuxt watches visible post cards and refreshes canonical snapshots safely", () => {
  const store = read("client/src/feed/application/stores/usePostRealtimeStore.ts")
  const card = read("client/src/feed/presentation/components/PostCard.vue")
  const detail = read("client/src/feed/presentation/pages/PostDetailPage.vue")

  assert.match(store, /MAX_WATCHED_POSTS\s*=\s*50/)
  assert.match(store, /MAX_CONCURRENT_REQUESTS\s*=\s*3/)
  assert.match(store, /REFRESH_DEBOUNCE_MS\s*=\s*150/)
  assert.match(store, /POLLING_INTERVAL_MS\s*=\s*15000/)
  assert.match(store, /if \(inFlight\.has\(postId\)\)[\s\S]*dirty\.add\(postId\)/)
  assert.match(store, /realtimeSocket\.on\("connect"[\s\S]*subscribeWatchedRooms\(\)/)
  assert.match(
    store,
    /realtimeSocket\.on\("connect_error"[\s\S]*realtimeSocket\.disconnect\(\)[\s\S]*socket\.value = null/,
  )
  assert.match(store, /commentVersionFor/)
  assert.match(card, /useIntersectionObserver\(/)
  assert.match(card, /postRealtimeStore\.watchPost\(post\.value\.id\)/)
  assert.match(card, /showComments\.value[\s\S]*refreshComments\(\)/)
  assert.match(detail, /postRealtimeStore\.watchPost\(props\.postId\)/)
  assert.match(detail, /onBeforeUnmount\(releasePostWatch\)/)
})

test("Nuxt realtime token endpoint accepts App bearer auth and verifies it with backend", () => {
  const tokenEndpoint = read("client/server/api/realtime/token.get.ts")

  assert.match(tokenEndpoint, /getHeader\(event,\s*["']authorization["']\)/)
  assert.match(tokenEndpoint, /Bearer\\s\+\(\.\+\)/)
  assert.match(
    tokenEndpoint,
    /getCookie\(event,\s*["']user_id["']\)[\s\S]*bearerAccessToken/,
  )
  assert.match(
    tokenEndpoint,
    /backendRoutes\.session\.currentUser\(backendUserSession\)/,
  )
})
