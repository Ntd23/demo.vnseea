// English description: Returns one normalized backend job for an existing job post detail route.

import { getRouterParam } from "h3"
import { fetchJobDetailByPostId } from "../_shared"

export default defineEventHandler(async (event) => {
  const postId = Number(getRouterParam(event, "postId") || 0)

  return await fetchJobDetailByPostId(event, postId)
})
