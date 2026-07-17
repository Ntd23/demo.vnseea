// English description: Updates an owned blog through the PHP session-backed handler.

import { createError, getHeader, getRouterParam, readBody, readMultipartFormData } from "h3"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { createBackendWebClient } from "../../utils/backend-web-client"

const categoryIds: Record<string, string> = {
  vehicles: "2", business: "4", education: "5", movies: "7", gaming: "8", history: "9",
  lifestyle: "10", people: "13", pets: "14", science: "16", sports: "17", travel: "18", other: "1",
}

const text = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(String(getRouterParam(event, "slug") || ""), 10)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: "Invalid blog id." })

  const currentUser = await getBackendCurrentUser(event)
  if (!currentUser.user_id || !currentUser.session_hash) {
    throw createError({ statusCode: 401, statusMessage: "Authentication is required." })
  }

  const contentType = getHeader(event, "content-type") || ""
  const parts = contentType.includes("multipart/form-data") ? await readMultipartFormData(event) ?? [] : []
  const body = parts.length === 0 ? await readBody<Record<string, unknown>>(event) : {}
  const fields: Record<string, string> = {}
  let thumbnail: { name: string, type: string, data: Buffer } | undefined

  for (const part of parts) {
    if (!part.name) continue
    if (part.filename && part.name === "thumbnail") {
      thumbnail = { name: part.filename, type: part.type || "image/jpeg", data: part.data }
    }
    else if (!part.filename) fields[part.name] = part.data.toString().trim()
  }

  const value = (key: string) => fields[key] ?? text(body[key])
  const title = value("title")
  const content = value("content")
  const description = value("description")
  const category = value("category")
  const tags = value("tags")
  if (title.length < 10 || content.length < 1 || description.length < 32 || !tags || !categoryIds[category]) {
    throw createError({ statusCode: 422, statusMessage: "Blog details are incomplete or invalid." })
  }

  const form = new FormData()
  form.append("blog_title", title)
  form.append("blog_content", content)
  form.append("blog_description", description)
  form.append("blog_category", categoryIds[category])
  form.append("blog_tags", tags)
  form.append("hash_id", String(currentUser.session_hash))
  if (thumbnail) form.append("thumbnail", new Blob([thumbnail.data], { type: thumbnail.type }), thumbnail.name)

  const response = await createBackendWebClient(event).postForm<{ status?: number, message?: string, url?: string }, FormData>(
    "update-blog", form, { blog_id: id },
  )
  if (Number(response.status) !== 200) {
    throw createError({ statusCode: 400, statusMessage: text(response.message) || "Unable to update blog." })
  }

  return { id, status: "published", url: `/read-blog/${id}` }
})
