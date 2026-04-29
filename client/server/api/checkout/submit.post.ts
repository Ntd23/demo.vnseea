import { readBody } from "h3"
import { createLegacyPhpClient } from "../../utils/legacy-php-client"

export default defineEventHandler(async (event) => {
  const client = createLegacyPhpClient(event)
  const body = await readBody(event)

  return client.post("checkout", body, {
    action: "submit",
  })
})
