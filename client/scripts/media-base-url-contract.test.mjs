// English description: Guards the split between public site links and shared upload media URLs.
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const root = new URL("../", import.meta.url)
const [nuxtConfig, resolver, envExample] = await Promise.all([
  readFile(new URL("nuxt.config.ts", root), "utf8"),
  readFile(new URL("server/utils/backend-media-url.ts", root), "utf8"),
  readFile(new URL(".env.example", root), "utf8"),
])

assert.match(envExample, /^MEDIA_BASE_URL=https:\/\/media\.vnseea\.vn$/m)
assert.match(nuxtConfig, /mediaBaseUrl\s*=\s*requireEnv\("MEDIA_BASE_URL"\)/)
assert.match(nuxtConfig, /mediaBaseUrl,/)
assert.match(resolver, /isRelativeUploadPath\(rawValue\)/)
assert.match(resolver, /isRelativeVoiceUploadPath\(rawValue\)/)
assert.match(resolver, /isRelativeVoiceUploadPath\(rawValue\)[\s\S]*?\? backendWebBase/)
assert.match(resolver, /\? mediaBaseUrl\s*:\s*backendWebBase/)

console.log("media-base-url-contract: ok")
