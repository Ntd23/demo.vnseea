import { getQuery } from "h3"
import { createLegacyPhpClient } from "../../utils/legacy-php-client"

export default defineEventHandler(async (event) => {
  const client = createLegacyPhpClient(event)

  return client.get("market", {
    scope: "buyer-orders",
    ...getQuery(event),
  })
})
