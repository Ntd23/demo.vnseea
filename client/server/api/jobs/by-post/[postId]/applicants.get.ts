// English description: Returns real job applications only after verifying the current user owns the requested job post.

import { getRouterParam } from "h3"
import { fetchJobApplicantsByPostId } from "../../_shared"

export default defineEventHandler(async (event) => {
  const postId = Number(getRouterParam(event, "postId") || 0)

  return await fetchJobApplicantsByPostId(event, postId)
})
