// English description: Updates an existing community page in the PHP backend and returns the refreshed record.

import { getHeader, getRouterParam, readBody, readMultipartFormData } from "h3"
import { assertBackendApiSuccess } from "../../../utils/backend-api-response"
import { createBackendApiClient } from "../../../utils/backend-api-client"
import { resolvePageRecordBySlug } from "../_shared"

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, "slug") || "")
  const client = createBackendApiClient(event)
  const page = await resolvePageRecordBySlug(event, slug)

  const contentType = getHeader(event, "content-type")
  let body: any = {}
  const files: any = {}

  if (contentType?.includes("multipart/form-data")) {
    const formData = await readMultipartFormData(event)
    if (formData) {
      formData.forEach((item) => {
        if (item.name) {
          if (item.filename) {
            files[item.name] = item
          }
          else {
            body[item.name] = item.data.toString()
          }
        }
      })
    }
  }
  else {
    body = await readBody(event)
  }

  const formData = new FormData()
  formData.append("page_id", String(page.id))
  formData.append("page_name", String(body.slug || page.slug).trim())
  formData.append("page_title", String(body.name || page.name).trim())
  formData.append("page_description", String(body.summary || page.summary).trim())
  formData.append("page_category", String(body.category || page.category).trim())
  formData.append("address", String(body.locationLabel || "").trim())
  formData.append("company", String(body.ownerLabel || "").trim())
  formData.append("website", String(body.website || "").trim())

  const ctaLabel = String(body.ctaLabel || "").trim()
  let ctaId = "0"
  if (/^\d+$/.test(ctaLabel)) {
    ctaId = ctaLabel
  } else {
    const l = ctaLabel.toLowerCase()
    if (l.includes("xem sản phẩm") || l.includes("catalog") || l.includes("shop") || l.includes("mua sắm")) ctaId = "2"
    else if (l.includes("nhắn tin") || l.includes("message") || l.includes("gửi tin nhắn") || l.includes("messenger")) ctaId = "11"
    else if (l.includes("gọi") || l.includes("call")) ctaId = "12"
    else if (l.includes("đặt lịch") || l.includes("book")) ctaId = "5"
    else if (l.includes("theo dõi") || l.includes("follow")) ctaId = "1"
    else if (l.includes("xem ngay") || l.includes("view")) ctaId = "3"
  }
  formData.append("call_action_type", ctaId)
  formData.append("call_action_type_url", String(body.responseLabel || "").trim())

  formData.append("facebook", String(body.facebook || "").trim())
  formData.append("twitter", String(body.twitter || "").trim())
  formData.append("instgram", String(body.instgram || "").trim())
  formData.append("linkedin", String(body.linkedin || "").trim())
  formData.append("youtube", String(body.youtube || "").trim())
  formData.append("vk", String(body.vk || "").trim())

  if (files.avatar) {
    formData.append("avatar", new Blob([files.avatar.data], { type: files.avatar.type }), files.avatar.filename)
  }
  if (files.banner) {
    formData.append("cover", new Blob([files.banner.data], { type: files.banner.type }), files.banner.filename)
  }

  assertBackendApiSuccess(
    await client.post<any>("update-page-data", formData),
    "Unable to update page.",
  )

  return await resolvePageRecordBySlug(event, String(body.slug || slug))
})

