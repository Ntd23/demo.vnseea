import { getRouterParam } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"

export default defineEventHandler(async (event) => {
  const username = String(getRouterParam(event, "username") ?? "")
  const client = createBackendApiClient(event)

  return client.post("get-user-data", {
    username,
  })
})
