import { getRouterParam } from "h3"
import { createLegacyPhpClient } from "../../utils/legacy-php-client"

export default defineEventHandler(async (event) => {
  const client = createLegacyPhpClient(event)
  const id = String(getRouterParam(event, "id") ?? "")

  return client.get("market", {
    scope: "buyer-order-detail",
    order_id: id,
  })
})
