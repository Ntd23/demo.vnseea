// English description: Updates one owned backend forum reply through the Nuxt API bridge.

import { getRouterParam, readBody } from "h3"
import { updateForumReply } from "../_shared"
import type { ForumReplyUpdatePayload } from "../../../../src/forum/domain/types/forum.types"

export default defineEventHandler(async (event) => {
  const body = await readBody<ForumReplyUpdatePayload>(event)

  return await updateForumReply(event, {
    ...body,
    id: Number(getRouterParam(event, "id")) || body.id,
  })
})
