// English description: Deletes an existing backend offer through the PHP offer API.

import { getRouterParam } from "h3"
import { deleteOffer } from "./_shared"

export default defineEventHandler(async (event) => {
  await deleteOffer(event, Number(getRouterParam(event, "id") || 0))
})
