import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const repoRoot = new URL("../../", import.meta.url)
const readRepo = path => readFile(new URL(path, repoRoot), "utf8")

test("page-like notifications resolve the page name from page_id and open the page route", async () => {
  const [mapper, backend, vietnamese, english] = await Promise.all([
    readRepo("client/server/api/notifications/_shared.ts"),
    readRepo("api/v2/endpoints/get-general-data.php"),
    readRepo("assets/languages/vietnamese.php"),
    readRepo("assets/languages/english.php"),
  ])

  assert.match(mapper, /asNumber\(item\.page_id\) > 0/)
  assert.match(mapper, /appRoutes\.pageDetail\(username\)/)
  assert.match(mapper, /link1=timeline/)
  assert.match(mapper, /normalizeLegacyIndexUrl\(ajaxUrl, item\)/)
  assert.match(mapper, /body\.replace\(\/\\\(\\s\*\\\{page_name\\\}\\s\*\\\)\\|\\\{page_name\\\}\/gi, "Trang"\)/)
  assert.match(backend, /Wo_PageData\(\$wo\['notification'\]\['page_id'\]\)/)
  assert.match(backend, /array\('\(\{page_name\}\)', '\{page_name\}'\)/)
  assert.match(vietnamese, /'invited_page' => 'đã mời bạn thích Trang'/)
  assert.match(english, /'invited_page' => 'invited you to like a Page'/)
})

test("user timeline notifications open the notifier profile through the Nuxt profile route", async () => {
  const mapper = await readRepo("client/server/api/notifications/_shared.ts")

  assert.match(
    mapper,
    /const username = asString\(params\.get\("u"\)\) \|\| asString\(item\.notifier\?\.username\)/,
  )
  assert.match(mapper, /return username \? appRoutes\.profile\(username\) : ""/)
  assert.match(
    mapper,
    /if \(\/\(\?:\^\|\[\?&\]\)link1=timeline[\s\S]*?normalizeLegacyIndexUrl\(ajaxUrl, item\)/,
  )
  assert.doesNotMatch(
    mapper,
    /asNumber\(item\.page_id\) > 0\s*&&\s*\/\(\?:\^\|\[\?&\]\)link1=timeline/,
  )
})

test("invite dialog reports localized per-user pending, success, and error states", async () => {
  const [viewModel, modal, page, vietnamese, english] = await Promise.all([
    readRepo("client/src/community/application/view-models/useCommunityPageInviteVM.ts"),
    readRepo("client/src/community/presentation/components/PageInviteModal.vue"),
    readRepo("client/src/community/presentation/pages/PageDetailPage.vue"),
    readRepo("client/i18n/locales/vi.json"),
    readRepo("client/i18n/locales/en.json"),
  ])

  assert.match(viewModel, /const sendingIds = ref<Set<number>>\(new Set\(\)\)/)
  assert.match(viewModel, /invitedIds\.value\.has\(userId\) \|\| sendingIds\.value\.has\(userId\)/)
  assert.match(viewModel, /inviteSuccessDescription/)
  assert.match(viewModel, /color: "success"/)
  assert.match(viewModel, /color: "error"/)
  assert.match(modal, /:disabled="invitedIds\.has\(user\.id\) \|\| sendingIds\.has\(user\.id\)"/)
  assert.match(page, /:sending-ids="inviteVM\.sendingIds\.value"/)

  for (const source of [vietnamese, english]) {
    const messages = JSON.parse(source)
    const invites = messages.pages.pageDetailPage.invites

    assert.ok(invites.sendingButton)
    assert.ok(invites.inviteSuccessDescription.includes("{user}"))
    assert.ok(invites.inviteErrorTitle)
    assert.ok(invites.inviteError)
  }
})
