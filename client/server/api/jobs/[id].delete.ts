// English description: Deletes an owned backend job through the existing authenticated PHP job handler.

import { createError, getRouterParam } from "h3"
import { deleteJob } from "./_shared"

export default defineEventHandler(async (event) => {
  const jobId = Number(getRouterParam(event, "id") ?? 0)

  if (!Number.isInteger(jobId) || jobId < 1) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid job id.",
    })
  }

  return await deleteJob(event, jobId)
})
