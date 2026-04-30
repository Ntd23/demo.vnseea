import { getRouterParam, readBody } from "h3"
import { createBackendApiClient } from "../../../utils/backend-api-client"

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const id = String(getRouterParam(event, "id") ?? "")
  const body = await readBody(event)

  return client.post("market", body, {
    action: "mark-received",
    order_id: id,
  })
})
