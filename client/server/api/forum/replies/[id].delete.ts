// English description: Deletes one owned backend forum reply through the Nuxt API bridge.

import { getRouterParam } from "h3"
import { deleteForumReply } from "../_shared"

export default defineEventHandler(async (event) => {
  return await deleteForumReply(event, Number(getRouterParam(event, "id")) || 0)
})
