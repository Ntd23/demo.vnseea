// English description: Proxies feed post actions such as like, comment, save, and report to the backend post-actions endpoint.

import { createError, readBody } from "h3"
import { runPostAction } from "../_shared"

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const action = String(body.action ?? "").trim()
  const postId = Number(body.postId ?? 0) || 0
  const text = typeof body.text === "string" ? body.text.trim() : ""

  if (!["like", "comment", "save", "report"].includes(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post action is invalid.",
    })
  }

  if (!postId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post id is required.",
    })
  }

  if (action === "comment" && !text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Comment text is required.",
    })
  }

  return await runPostAction(event, {
    action: action as "like" | "comment" | "save" | "report",
    postId,
    text,
  })
})
