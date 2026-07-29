// English description: Returns one normalized job by its job id so catalog cards remain viewable without a valid feed post association.

import { getRouterParam } from "h3"
import { fetchJobDetailByJobId } from "./_shared"

export default defineEventHandler(async (event) => {
  const jobId = Number(getRouterParam(event, "id") || 0)

  return await fetchJobDetailByJobId(event, jobId)
})
