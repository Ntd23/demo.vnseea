import { getRouterParam } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const id = String(getRouterParam(event, "id") ?? "")

  return client.get("market", {
    scope: "buyer-order-detail",
    order_id: id,
  })
})
