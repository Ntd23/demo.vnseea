import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const readSource = path => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("create-page submit remains available so missing address validation is visible", async () => {
  const vm = await readSource("src/community/application/view-models/useCommunityCreatePagePageVM.ts")

  assert.match(vm, /const isSubmitDisabled = computed\(\(\) => submitState\.value === "loading"\)/)
  assert.doesNotMatch(vm, /isSubmitDisabled[\s\S]{0,500}!\(draft\.value\.location\?\.address/)
})

test("creation form reports a localized location error and blocks invalid submission", async () => {
  const form = await readSource("src/community/presentation/components/CreationForm.vue")
  const vi = JSON.parse(await readSource("i18n/locales/vi.json"))

  assert.match(form, /<UForm[\s\S]*:validate="validateForm"[\s\S]*@submit="emit\('submit'\)"/)
  assert.match(form, /name="location"[\s\S]*<GooglePlaceField/)
  assert.match(form, /errors\.push\(\{ name: "location", message: t\("community\.creation\.common\.validationLocationRequired"\) \}\)/)
  assert.equal(
    vi.community.creation.common.validationLocationRequired,
    "Chọn địa chỉ Google để lưu tọa độ cho tìm kiếm gần đây.",
  )
})
