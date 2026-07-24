import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = relativePath =>
  readFile(new URL(relativePath, import.meta.url), "utf8")

test("profile avatar and cover retain high-resolution sources in production", async () => {
  const [settingsBridge, profileApi, avatarCrop, coverCrop, profileBackend] = await Promise.all([
    read("../server/api/settings/update.post.ts"),
    read("../server/api/profile/[username].get.ts"),
    read("../src/profile/presentation/components/ProfileImageCropModal.vue"),
    read("../src/profile/presentation/components/ProfileCoverRepositionEditor.vue"),
    read("../../api/v2/endpoints/get-user-data-username.php"),
  ])

  assert.match(settingsBridge, /profile_media_contract", "canonical_crop_v1"/)
  assert.match(settingsBridge, /postBackendApiUpload<BackendProfileMediaResponse>/)
  assert.match(profileApi, /\["cover_full", "cover"\]/)
  assert.match(profileApi, /\["avatar_full", "avatar"\]/)
  assert.match(avatarCrop, /props\.kind === "avatar" \? 1080 : 1836/)
  assert.match(avatarCrop, /\? 1080\s*:\s*664/)
  assert.match(coverCrop, /width: 1836/)
  assert.match(coverCrop, /height: 664/)
  assert.match(profileBackend, /'cover_full' =>/)
  assert.match(profileBackend, /'avatar_full' =>/)
})
