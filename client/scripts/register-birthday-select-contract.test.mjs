import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8")

const [page, viewModel, serverRoute, phpEndpoint] = await Promise.all([
  read("src/auth/presentation/pages/RegisterPage.vue"),
  read("src/auth/application/view-models/useRegisterPageVM.ts"),
  read("server/api/auth/register.post.ts"),
  read("../api/v2/endpoints/create-account.php"),
])

assert.doesNotMatch(page, /UInputDate|CalendarDate|birthDateMax/)
assert.match(page, /v-model="state\.birthDay"[\s\S]*:items="birthDayItems"/)
assert.match(page, /v-model="state\.birthMonth"[\s\S]*:items="birthMonthItems"/)
assert.match(page, /v-model="state\.birthYear"[\s\S]*:items="birthYearItems"/)
assert.match(page, /value-key="value"/)
assert.match(page, /label-key="label"/)
assert.match(page, /max-width:\s*640px/)
assert.match(page, /grid-template-columns:\s*minmax\(0,\s*3fr\)\s*minmax\(0,\s*2fr\)/)
assert.match(page, /Array\.from\(\{ length: 31 \}/)
assert.match(page, /Array\.from\(\{ length: 12 \}/)
assert.match(page, /Array\.from\(\{ length: 1101 \}/)
assert.match(page, /const year = 1900 \+ index/)

assert.match(viewModel, /birthDay:\s*1/)
assert.match(viewModel, /birthMonth:\s*1/)
assert.match(viewModel, /birthYear:\s*2026/)
assert.match(serverRoute, /year >= 1900[\s\S]*year <= 3000/)
assert.match(phpEndpoint, /\$birthday_year < 1900 \|\| \$birthday_year > 3000/)

console.log("register birthday select contract: ok")
