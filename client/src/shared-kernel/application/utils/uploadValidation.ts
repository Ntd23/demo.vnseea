// English description: Defines frontend upload limits and supported file formats that mirror the current PHP backend configuration.

export const UPLOAD_MAX_FILE_SIZE_BYTES = 96_000_000
export const UPLOAD_MAX_FILE_SIZE_LABEL = "96 MB"
export const FEED_MAX_IMAGE_FILES = 20

const FEED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"] as const
const FEED_VIDEO_EXTENSIONS = ["mp4", "m4v", "webm", "flv", "mov", "mpeg", "mkv"] as const
const MESSAGE_ATTACHMENT_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "mkv",
  "docx",
  "zip",
  "rar",
  "pdf",
  "doc",
  "mp3",
  "mp4",
  "flv",
  "wav",
  "txt",
  "mov",
  "avi",
  "webm",
  "mpeg",
] as const
const BACKEND_ALLOWED_MIME_TYPES = new Set([
  "application/json",
  "application/msword",
  "application/octet-stream",
  "application/pdf",
  "application/x-pointplus",
  "application/x-rar-compressed",
  "application/zip",
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "image/gif",
  "image/jpeg",
  "image/png",
  "text/css",
  "text/pdf",
  "text/plain",
  "video/avi",
  "video/flv",
  "video/mov",
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/webm",
])

export const FEED_IMAGE_ACCEPT = FEED_IMAGE_EXTENSIONS.map(extension => `.${extension}`).join(",")
export const FEED_VIDEO_ACCEPT = FEED_VIDEO_EXTENSIONS.map(extension => `.${extension}`).join(",")
export const MESSAGE_ATTACHMENT_ACCEPT = MESSAGE_ATTACHMENT_EXTENSIONS.map(extension => `.${extension}`).join(",")
export const MESSAGE_IMAGE_ACCEPT = FEED_IMAGE_ACCEPT

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
  allowedExtensions: readonly string[],
): UploadValidationResult {
  if (file.size <= 0) {
    return {
      valid: false,
      code: "empty-file",
      fileName: file.name,
    }
  }

  if (file.size > UPLOAD_MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      code: "too-large",
      fileName: file.name,
      maxSizeLabel: UPLOAD_MAX_FILE_SIZE_LABEL,
    }
  }

  if (!allowedExtensions.includes(getFileExtension(file))) {
    return {
      valid: false,
      code: "unsupported-type",
      fileName: file.name,
    }
  }

  const mimeType = file.type.trim().toLowerCase()
  if (mimeType && !BACKEND_ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      valid: false,
      code: "unsupported-type",
      fileName: file.name,
    }
  }

  return { valid: true }
}

export function validateFeedImages(files: File[]): UploadValidationResult {
  if (files.length > FEED_MAX_IMAGE_FILES) {
    return {
      valid: false,
      code: "too-many-files",
      maxFiles: FEED_MAX_IMAGE_FILES,
    }
  }

  for (const file of files) {
    const result = validateFile(file, FEED_IMAGE_EXTENSIONS)
    if (!result.valid) {
      return result
    }
  }

  return { valid: true }
}

export function validateFeedVideo(file: File): UploadValidationResult {
  return validateFile(file, FEED_VIDEO_EXTENSIONS)
}

export function validateFeedCommentImage(file: File): UploadValidationResult {
  return validateFile(file, FEED_IMAGE_EXTENSIONS)
}

export function validateMessageAttachment(file: File): UploadValidationResult {
  return validateFile(file, MESSAGE_ATTACHMENT_EXTENSIONS)
}
