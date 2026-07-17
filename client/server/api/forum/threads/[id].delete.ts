// English description: Deletes one owned backend forum thread through the Nuxt API bridge.

import { getRouterParam } from "h3"
import { deleteForumThread } from "../_shared"

export default defineEventHandler(async (event) => {
  return await deleteForumThread(event, Number(getRouterParam(event, "id")) || 0)
})
