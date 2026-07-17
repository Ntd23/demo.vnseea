// English description: Updates one owned backend forum thread through the Nuxt API bridge.

import { getRouterParam, readBody } from "h3"
import { updateForumThread } from "../_shared"
import type { ForumThreadUpdatePayload } from "../../../../src/forum/domain/types/forum.types"

export default defineEventHandler(async (event) => {
  const body = await readBody<ForumThreadUpdatePayload>(event)

  return await updateForumThread(event, {
    ...body,
    id: Number(getRouterParam(event, "id")) || body.id,
  })
})
