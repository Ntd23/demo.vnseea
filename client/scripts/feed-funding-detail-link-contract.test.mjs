import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const mapper = readFileSync(resolve(scriptDir, "../server/api/feed/_shared.ts"), "utf8")

assert.match(
  mapper,
  /const raisedCampaign = asRecord\(fundRaise\.fund\)/,
  "raised-fund posts must unwrap the nested campaign record",
)
assert.match(
  mapper,
  /Object\.keys\(raisedCampaign\)\.length[\s\S]*\? raisedCampaign/,
  "the nested campaign must be preferred over the numeric raise record",
)
assert.match(
  mapper,
  /const hashedId = firstString\(funding, \["hashed_id", "hash_id"\]\)[\s\S]*href: hashedId \? appRoutes\.showFund\(hashedId\) : appRoutes\.funding/,
  "funding post links must use the campaign hashed id and never the internal numeric id",
)

console.log("feed funding detail link contract: ok")
