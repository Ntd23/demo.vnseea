import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8")

const [page, viewModel, serverRoute, phpEndpoint, viLocale] = await Promise.all([
  read("src/auth/presentation/pages/RegisterPage.vue"),
  read("src/auth/application/view-models/useRegisterPageVM.ts"),
  read("server/api/auth/register.post.ts"),
  read("../api/v2/endpoints/create-account.php"),
  read("i18n/locales/vi.json"),
])

assert.doesNotMatch(page, /name="username"|state\.username/)
assert.doesNotMatch(viewModel, /state\.username|name:\s*"username"/)
assert.doesNotMatch(serverRoute, /body\.username|username,/)
assert.doesNotMatch(phpEndpoint, /'username',\s*\n\s*'password'/)
assert.match(phpEndpoint, /VNSEEA_GenerateNumericUuidUsername/)
assert.match(phpEndpoint, /random_int\(10000000,\s*99999999\)/)
assert.match(phpEndpoint, /\$_POST\['username'\]\s*=\s*\$username/)

const vi = JSON.parse(viLocale)
assert.equal(
  vi.pages.registerPage.loginIdentity,
  "Tên đăng nhập (Số điện thoại / Địa chỉ email)",
)

console.log("register generated username contract: ok")
