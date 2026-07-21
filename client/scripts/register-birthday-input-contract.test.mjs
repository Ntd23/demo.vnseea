import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const requireFromVue = createRequire(require.resolve("vue/package.json"))
const { compile } = requireFromVue("@vue/compiler-dom")
const source = readFileSync(
  new URL("../src/auth/presentation/pages/RegisterPage.vue", import.meta.url),
  "utf8",
)
const providerSource = readFileSync(
  new URL("../src/shared-kernel/presentation/components/NuxtUiProvider.vue", import.meta.url),
  "utf8",
)

test("registration birthday uses the segmented Nuxt UI date input", () => {
  assert.match(source, /<UFormField name="birthDay"[\s\S]*?<UInputDate/)
  assert.match(source, /v-model="birthDate"/)
  assert.match(source, /:max-value="birthDateMax"/)
  assert.doesNotMatch(source, /<UCalendar|<UPopover/)
  assert.doesNotMatch(source, /<UInputDate[^>]*\sicon=/)
  assert.match(source, /CalendarDate, getLocalTimeZone, today/)
  assert.match(source, /const birthDateMax = today\(getLocalTimeZone\(\)\)/)
  assert.match(providerSource, /import \{ en_gb, vi \} from "@nuxt\/ui\/locale"/)
  assert.match(providerSource, /<UApp :locale="nuxtUiLocale">/)
  assert.match(providerSource, /locale\.value === "vi" \? vi : en_gb/)
})

test("registration template compiles after replacing the calendar", () => {
  const templateStart = source.indexOf("<template>")
  const scriptStart = source.indexOf("<script")
  const templateEnd = source.lastIndexOf("</template>", scriptStart)
  const template = source.slice(templateStart + "<template>".length, templateEnd)
  const errors = []

  compile(template, {
    expressionPlugins: ["typescript"],
    onError: error => errors.push(error.message),
  })
  assert.deepEqual(errors, [], errors.join("; "))
})
