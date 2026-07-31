// English description: Parses and validates responses returned by legacy PHP API endpoints.

import { createError } from "h3"

type BackendApiResponse = {
  api_status?: number | string
  errors?: {
    error_text?: string
  }
  message?: string
}

export function parseBackendApiResponse<TResponse>(response: unknown): TResponse {
  if (typeof response !== "string") {
    return response as TResponse
  }

  const trimmed = response.trim().replace(/^\uFEFF/, "")

  try {
    return JSON.parse(trimmed) as TResponse
  }
  catch {
    // Some PHP installations prepend warnings to an otherwise valid JSON body.
  }

  const candidateStarts = [trimmed.indexOf("{"), trimmed.indexOf("[")]
    .filter(index => index >= 0)
    .sort((left, right) => left - right)

  for (const start of candidateStarts) {
    const closingMarker = trimmed[start] === "{" ? "}" : "]"
    let end = trimmed.lastIndexOf(closingMarker)

    while (end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as TResponse
      }
      catch {
        end = trimmed.lastIndexOf(closingMarker, end - 1)
      }
    }
  }

  return response as TResponse
}

export function assertBackendApiSuccess<TResponse extends BackendApiResponse>(
  response: TResponse,
  fallbackMessage: string,
) {
  const apiStatus = Number(response.api_status ?? 0)

  if (apiStatus >= 200 && apiStatus < 300) {
    return response
  }

  const backendMessage = response.errors?.error_text ?? response.message ?? fallbackMessage
  const isUnauthorized = /not authorized|access_token/i.test(backendMessage)

  throw createError({
    statusCode: isUnauthorized ? 401 : 400,
    statusMessage: backendMessage,
    data: response,
  })
}
