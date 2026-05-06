// English description: Proxies feed post actions such as like, comment, save, and report to the backend post-actions endpoint.

import { createError, readBody } from "h3"
import { isFeedStoryReaction } from "../../../../src/feed/domain/constants/story-reactions"
import { runPostAction } from "../_shared"

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const action = String(body.action ?? "").trim()
  const postId = Number(body.postId ?? 0) || 0
  const reaction = typeof body.reaction === "string" ? body.reaction.trim() : ""
  const text = typeof body.text === "string" ? body.text.trim() : ""

  if (!["like", "reaction", "comment", "save", "report"].includes(action)) {
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

  if (action === "reaction" && reaction && !isFeedStoryReaction(reaction)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post reaction is invalid.",
    })
  }

  return await runPostAction(event, {
    action: action as "like" | "reaction" | "comment" | "save" | "report",
    postId,
    reaction,
    text,
  })
})
