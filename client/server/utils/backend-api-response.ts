import { createError } from "h3"

type BackendApiResponse = {
  api_status?: number | string
  errors?: {
    error_text?: string
  }
  message?: string
}

export function assertBackendApiSuccess<TResponse extends BackendApiResponse>(
  response: TResponse,
  fallbackMessage: string,
) {
  const apiStatus = Number(response.api_status ?? 0)

  if (apiStatus >= 200 && apiStatus < 300) {
    return response
  }

  throw createError({
    statusCode: 400,
    statusMessage: response.errors?.error_text ?? response.message ?? fallbackMessage,
    data: response,
  })
}
