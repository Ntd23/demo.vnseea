// English description: Proxies verification request submissions to the phtml requests.php handlers.

import { createError, readMultipartFormData } from "h3"
import { createBackendWebClient } from "../../utils/backend-web-client"
import type { SettingsVerificationResult, VerificationProfileType } from "../../../src/settings/domain/types/settings.types"

type BackendVerificationSubmitResponse = {
  status?: number | string
  message?: string
  url?: string
}

const textPart = (
  parts: Awaited<ReturnType<typeof readMultipartFormData>>,
  name: string,
) => parts?.find(part => part.name === name && !part.filename)?.data.toString("utf8").trim() ?? ""

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

export default defineEventHandler(async (event): Promise<SettingsVerificationResult> => {
  const parts = await readMultipartFormData(event) ?? []
  const profileType = (textPart(parts, "profileType") === "shop" ? "shop" : "user") as VerificationProfileType
  const formData = new FormData()

  for (const part of parts) {
    if (!part.name || part.name === "profileType") {
      continue
    }

    if (part.filename) {
      formData.append(part.name, new Blob([part.data], { type: part.type || "application/octet-stream" }), part.filename)
      continue
    }

    formData.append(part.name, part.data.toString("utf8"))
  }

  const requiredFiles = profileType === "shop"
    ? ["passport", "photo", "shop_image", "license"]
    : ["passport", "photo"]
  const missingFile = requiredFiles.some(name => !parts.some(part => part.name === name && part.filename))

  if (missingFile) {
    throw createError({
      statusCode: 422,
      statusMessage: "Please upload all required verification documents.",
    })
  }

  const response = await createBackendWebClient(event).postForm<BackendVerificationSubmitResponse, FormData>(
    profileType === "shop" ? "verificate-shop" : "verificate-user",
    formData,
  )
  const status = Number(response.status ?? 0)
  const message = stripHtml(response.message || "")

  if (status !== 200) {
    throw createError({
      statusCode: status >= 400 ? status : 400,
      statusMessage: message || "Unable to submit verification request.",
      data: response,
    })
  }

  return {
    success: true,
    message: message || "Verification request sent.",
    redirectUrl: response.url,
  }
})
