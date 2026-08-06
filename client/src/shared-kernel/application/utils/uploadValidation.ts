// English description: Validates frontend uploads against the backend-managed Admin upload policy.

import type { UploadPolicy } from "../../domain/upload-policy"

export const FEED_MAX_IMAGE_FILES = 20

const STORY_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"] as const
const STORY_VIDEO_EXTENSIONS = ["mp4", "mov", "webm"] as const
const STORY_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/gif"])
const STORY_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"])
const STORY_MEDIA_EXTENSIONS = new Set<string>([
  ...STORY_IMAGE_EXTENSIONS,
  ...STORY_VIDEO_EXTENSIONS,
])

export type UploadMediaKind = "image" | "video"

export type UploadValidationErrorCode =
  | "empty-file"
  | "too-large"
  | "unsupported-type"
  | "too-many-files"

export type UploadValidationResult =
  | { valid: true }
  | {
      valid: false
      code: UploadValidationErrorCode
      fileName?: string
      maxFiles?: number
      maxSizeLabel?: string
    }

function getFileExtension(file: File) {
  const fileName = file.name.trim().toLowerCase()
  const separatorIndex = fileName.lastIndexOf(".")

  return separatorIndex >= 0 ? fileName.slice(separatorIndex + 1) : ""
}

function validateFile(
  file: File,
  policy: UploadPolicy,
  allowedMediaKinds: readonly UploadMediaKind[] = [],
): UploadValidationResult {
  if (file.size <= 0) {
    return {
      valid: false,
      code: "empty-file",
      fileName: file.name,
    }
  }

  if (policy.maxFileSizeBytes > 0 && file.size > policy.maxFileSizeBytes) {
    return {
      valid: false,
      code: "too-large",
      fileName: file.name,
      maxSizeLabel: getUploadMaxFileSizeLabel(policy),
    }
  }

  const fileExtension = getFileExtension(file)
  if (
    policy.allowedExtensions.length > 0
    && (!fileExtension || !policy.allowedExtensions.includes(fileExtension))
  ) {
    return {
      valid: false,
      code: "unsupported-type",
      fileName: file.name,
    }
  }

  const mimeType = file.type.trim().toLowerCase()
  if (
    allowedMediaKinds.length > 0
    && !allowedMediaKinds.some(kind => mimeType.startsWith(`${kind}/`))
  ) {
    return {
      valid: false,
      code: "unsupported-type",
      fileName: file.name,
    }
  }

  if (mimeType && policy.allowedMimeTypes.length > 0 && !policy.allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      code: "unsupported-type",
      fileName: file.name,
    }
  }

  return { valid: true }
}

const buildMediaAccept = (policy: UploadPolicy, mediaKinds: readonly UploadMediaKind[]) => {
  const mimeTypes = policy.allowedMimeTypes.filter(mimeType =>
    mediaKinds.some(kind => mimeType.startsWith(`${kind}/`)),
  )

  return mimeTypes.length > 0
    ? mimeTypes.join(",")
    : mediaKinds.map(kind => `${kind}/*`).join(",")
}

const buildAttachmentAccept = (policy: UploadPolicy) => [
  ...policy.allowedExtensions.map(extension => `.${extension}`),
  ...policy.allowedMimeTypes,
].filter(Boolean).join(",")

export const getUploadMaxFileSizeLabel = (policy: UploadPolicy) => {
  if (policy.maxFileSizeLabel) {
    return policy.maxFileSizeLabel
  }

  const bytes = policy.maxFileSizeBytes
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return ""
  }

  const units = ["B", "KB", "MB", "GB", "TB"]
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1000)),
    units.length - 1,
  )
  const value = bytes / (1000 ** unitIndex)

  return `${Number(value.toFixed(value >= 10 ? 0 : 1))} ${units[unitIndex] ?? "B"}`
}

export const getFeedImageAccept = (policy: UploadPolicy) =>
  buildMediaAccept(policy, ["image"])

export const getFeedVideoAccept = (policy: UploadPolicy) =>
  buildMediaAccept(policy, ["video"])

const buildStoryMediaAccept = (
  policy: UploadPolicy,
  mediaKinds: readonly UploadMediaKind[],
  extensions: readonly string[],
  mimeTypes: ReadonlySet<string>,
) => [
  ...extensions
    .filter(extension => policy.allowedExtensions.length === 0 || policy.allowedExtensions.includes(extension))
    .map(extension => `.${extension}`),
  ...policy.allowedMimeTypes.filter(mimeType =>
    mimeTypes.has(mimeType)
    && mediaKinds.some(kind => mimeType.startsWith(`${kind}/`)),
  ),
].filter(Boolean).join(",")

export const getStoryImageAccept = (policy: UploadPolicy) =>
  buildStoryMediaAccept(policy, ["image"], STORY_IMAGE_EXTENSIONS, STORY_IMAGE_MIME_TYPES)

export const getStoryVideoAccept = (policy: UploadPolicy) =>
  buildStoryMediaAccept(policy, ["video"], STORY_VIDEO_EXTENSIONS, STORY_VIDEO_MIME_TYPES)

export const getStoryMediaAccept = (policy: UploadPolicy) => [
  getStoryImageAccept(policy),
  getStoryVideoAccept(policy),
].filter(Boolean).join(",")

export const getMessageAttachmentAccept = (policy: UploadPolicy) =>
  buildAttachmentAccept(policy)

export const getMessageImageAccept = getFeedImageAccept

export const getUploadMediaKind = (file: File): UploadMediaKind | null => {
  const mimeType = file.type.trim().toLowerCase()

  if (mimeType.startsWith("image/")) {
    return "image"
  }

  if (mimeType.startsWith("video/")) {
    return "video"
  }

  return null
}

export function validateFeedImages(files: File[], policy: UploadPolicy): UploadValidationResult {
  if (files.length > FEED_MAX_IMAGE_FILES) {
    return {
      valid: false,
      code: "too-many-files",
      maxFiles: FEED_MAX_IMAGE_FILES,
    }
  }

  for (const file of files) {
    const result = validateFile(file, policy, ["image"])
    if (!result.valid) {
      return result
    }
  }

  return { valid: true }
}

export function validateFeedVideo(file: File, policy: UploadPolicy): UploadValidationResult {
  return validateFile(file, policy, ["video"])
}

export function validateStoryMedia(
  file: File,
  policy: UploadPolicy,
  expectedKind?: UploadMediaKind | null,
): UploadValidationResult {
  const validation = validateFile(file, policy, expectedKind ? [expectedKind] : ["image", "video"])

  if (!validation.valid) {
    return validation
  }

  if (!STORY_MEDIA_EXTENSIONS.has(getFileExtension(file))) {
    return {
      valid: false,
      code: "unsupported-type",
      fileName: file.name,
    }
  }

  return { valid: true }
}

export function validateFeedCommentImage(file: File, policy: UploadPolicy): UploadValidationResult {
  return validateFile(file, policy, ["image"])
}

export function validateUploadAttachment(file: File, policy: UploadPolicy): UploadValidationResult {
  return validateFile(file, policy)
}

export function validateMessageAttachment(file: File, policy: UploadPolicy): UploadValidationResult {
  return validateUploadAttachment(file, policy)
}
