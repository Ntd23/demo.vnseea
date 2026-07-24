// English description: Bridges feed comment reply actions to the PHP comments API.

import { createError, getHeader, readBody, readMultipartFormData, type H3Event } from "h3"
import { runCommentAction } from "../_shared"

type MultipartFilePart = {
  filename?: string
  type?: string
  data: Buffer
}

type CommentActionPayload = {
  action: string
  commentId: number
  text: string
  target: string
  targetId: number
  reaction: string
  remove: boolean
  imageFile: MultipartFilePart | null
  gifFile: MultipartFilePart | null
  audioFile: MultipartFilePart | null
}

const emptyPayload = (): CommentActionPayload => ({
  action: "",
  commentId: 0,
  text: "",
  target: "",
  targetId: 0,
  reaction: "",
  remove: false,
  imageFile: null,
  gifFile: null,
  audioFile: null,
})

async function parsePayload(event: H3Event): Promise<CommentActionPayload> {
  const contentType = getHeader(event, "content-type") || ""

  if (!contentType.includes("multipart/form-data")) {
    const body = await readBody<Record<string, unknown>>(event)
    return {
      ...emptyPayload(),
      action: String(body.action ?? "").trim(),
      commentId: Number(body.commentId ?? 0) || 0,
      text: typeof body.text === "string" ? body.text.trim() : "",
      target: String(body.target ?? "").trim(),
      targetId: Number(body.targetId ?? 0) || 0,
      reaction: typeof body.reaction === "string" ? body.reaction.trim() : "",
      remove: body.remove === true || body.remove === 1 || body.remove === "1",
    }
  }

  const payload = emptyPayload()
  const parts = await readMultipartFormData(event) ?? []

  for (const part of parts) {
    if (!part.name) continue

    if (part.filename) {
      const file = { filename: part.filename, type: part.type, data: part.data }
      if (part.name === "commentImage") payload.imageFile = file
      if (part.name === "commentGif") payload.gifFile = file
      if (part.name === "commentAudio") payload.audioFile = file
      continue
    }

    const value = part.data.toString().trim()
    if (part.name === "action") payload.action = value
    if (part.name === "commentId") payload.commentId = Number(value) || 0
    if (part.name === "text") payload.text = value
  }

  return payload
}

export default defineEventHandler(async (event) => {
  const payload = await parsePayload(event)
  const { action, commentId, text, target, targetId, reaction, remove } = payload

  if (action === "reply") {
    if (!commentId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Comment id is required.",
      })
    }

    if (!text && !payload.imageFile && !payload.gifFile && !payload.audioFile) {
      throw createError({
        statusCode: 400,
        statusMessage: "Reply content is required.",
      })
    }

    return await runCommentAction(event, {
      action: "reply",
      commentId,
      text,
      imageFile: payload.imageFile,
      gifFile: payload.gifFile,
      audioFile: payload.audioFile,
    })
  }

  if (action === "reaction") {
    if (!targetId || (target !== "comment" && target !== "reply") || (!reaction && !remove)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Comment reaction payload is invalid.",
      })
    }

    return await runCommentAction(event, {
      action: "reaction",
      target,
      targetId,
      reaction: reaction || undefined,
      remove,
    })
  }

  throw createError({
    statusCode: 400,
    statusMessage: "Comment action is invalid.",
  })
})
