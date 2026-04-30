import { getQuery } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)

  return client.get("checkout", {
    action: "snapshot",
    ...getQuery(event),
  })
})
