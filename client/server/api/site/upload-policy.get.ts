// English description: Returns the public backend-managed upload limits and allowed file types.

import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"
import type { UploadPolicy } from "../../../src/shared-kernel/domain/upload-policy"

type BackendUploadPublicConfig = Record<string, unknown>

type BackendSiteSettingsResponse = {
  api_status?: number | string
  public_config?: BackendUploadPublicConfig
  errors?: {
    error_text?: string
  }
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const normalizeList = (value: unknown) => [
  ...new Set(
    asString(value)
      .split(",")
      .map(item => item.trim().toLowerCase().replace(/^\.+/, ""))
      .filter(Boolean),
  ),
]

export default defineEventHandler(async (event): Promise<UploadPolicy> => {
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendSiteSettingsResponse, Record<string, never>>(
      backendRoutes.api.siteSettings,
      {},
    ),
    "Unable to load upload policy.",
  )
  const publicConfig = response.public_config ?? {}
  const maxFileSizeBytes = Number(publicConfig.upload_max_file_size)

  return {
    maxFileSizeBytes: Number.isFinite(maxFileSizeBytes) && maxFileSizeBytes > 0
      ? Math.floor(maxFileSizeBytes)
      : 0,
    maxFileSizeLabel: asString(publicConfig.upload_max_file_size_label),
    allowedExtensions: normalizeList(publicConfig.upload_allowed_extensions),
    allowedMimeTypes: normalizeList(publicConfig.upload_allowed_mime_types),
  }
})
