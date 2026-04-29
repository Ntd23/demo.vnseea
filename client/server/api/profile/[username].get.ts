import { getRouterParam } from "h3"
import { createLegacyPhpClient } from "../../utils/legacy-php-client"

export default defineEventHandler(async (event) => {
  const username = String(getRouterParam(event, "username") ?? "")
  const client = createLegacyPhpClient(event)

  return client.post("get-user-data", {
    username,
  })
})
