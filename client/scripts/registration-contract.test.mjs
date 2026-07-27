import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8")
const readBackend = relativePath => readFile(new URL(`../../${relativePath}`, import.meta.url), "utf8")

test("Nuxt registration always asks for and submits the selected username", async () => {
  const [page, viewModel, handler] = await Promise.all([
    read("src/auth/presentation/pages/RegisterPage.vue"),
    read("src/auth/application/view-models/useRegisterPageVM.ts"),
    read("server/api/auth/register.post.ts"),
  ])

  assert.doesNotMatch(page, /v-if="autoUsername"/)
  assert.match(page, /name="username"/)
  assert.doesNotMatch(viewModel, /autoUsername\.value \? "" : state\.username/)
  assert.match(viewModel, /username:\s*state\.username/)
  assert.doesNotMatch(handler, /resolveAutoUsername/)
  assert.match(handler, /username,/)
})

test("Nuxt registration submits the user name as first_name", async () => {
  const [page, viewModel, handler] = await Promise.all([
    read("src/auth/presentation/pages/RegisterPage.vue"),
    read("src/auth/application/view-models/useRegisterPageVM.ts"),
    read("server/api/auth/register.post.ts"),
  ])

  assert.match(page, /name="firstName"/)
  assert.match(page, /v-model="state\.firstName"/)
  assert.match(viewModel, /name:\s*"firstName"/)
  assert.match(handler, /first_name:\s*firstName/)
})

test("Nuxt birthday is optional but serialized as an ISO date when selected", async () => {
  const [viewModel, handler] = await Promise.all([
    read("src/auth/application/view-models/useRegisterPageVM.ts"),
    read("server/api/auth/register.post.ts"),
  ])

  assert.doesNotMatch(
    viewModel,
    /validationBirthdayRequired/,
  )
  assert.match(handler, /function buildOptionalBirthday/)
  assert.match(handler, /birthday:\s*buildOptionalBirthday\(body\)/)
})

test("API registration preserves explicit usernames and stores valid birthdays", async () => {
  const endpoint = await readBackend("api/v2/endpoints/create-account.php")

  assert.doesNotMatch(
    endpoint,
    /\$_POST\['username'\]\s*=\s*time\(\)\s*\.\s*rand/,
  )
  assert.doesNotMatch(
    endpoint,
    /\$username\s*=\s*\$username\s*\.\s*["']_["']\s*\.\s*\$registered_user_id/,
  )
  assert.match(endpoint, /\$birthday\s*=\s*'';/)
  assert.match(endpoint, /checkdate\(\$birthday_month, \$birthday_day, \$birthday_year\)/)
  assert.match(
    endpoint,
    /\$account_data\['birthday'\]\s*=\s*Wo_Secure\(\$birthday, 0\);/,
  )
})
