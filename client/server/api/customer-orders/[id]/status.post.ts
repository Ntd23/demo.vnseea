import { getRouterParam, readBody } from "h3"
import { createLegacyPhpClient } from "../../../utils/legacy-php-client"

export default defineEventHandler(async (event) => {
  const client = createLegacyPhpClient(event)
  const id = String(getRouterParam(event, "id") ?? "")
  const body = await readBody<{ status?: string }>(event)

  return client.post("market", body, {
    action: "update-seller-order-status",
    order_id: id,
    status: body?.status,
  })
})
