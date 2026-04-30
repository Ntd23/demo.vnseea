import { readBody } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const body = await readBody(event)

  return client.post("checkout", body, {
    action: "submit",
  })
})
