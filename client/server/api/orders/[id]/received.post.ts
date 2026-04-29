import { getRouterParam, readBody } from "h3"
import { createLegacyPhpClient } from "../../../utils/legacy-php-client"

export default defineEventHandler(async (event) => {
  const client = createLegacyPhpClient(event)
  const id = String(getRouterParam(event, "id") ?? "")
  const body = await readBody(event)

  return client.post("market", body, {
    action: "mark-received",
    order_id: id,
  })
})
