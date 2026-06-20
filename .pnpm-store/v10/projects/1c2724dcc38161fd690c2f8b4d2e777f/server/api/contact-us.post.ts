// English description: Bridges public contact-us form submissions to the PHP contact handler.

import { createError, readBody } from "h3"
import { createBackendWebClient } from "../utils/backend-web-client"

interface BackendContactResponse {
  status?: number
  message?: string
  errors?: string[]
  mail_error?: string
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const stripTags = (value: string) => value.replace(/<[^>]+>/g, "").trim()

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const firstName = asString(body.firstName)
  const lastName = asString(body.lastName)
  const email = asString(body.email)
  const message = asString(body.message)

  if (!firstName || !lastName || !email || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please check your details.",
    })
  }

  const response = await createBackendWebClient(event).postForm<BackendContactResponse>(
    "contact_us",
    {
      first_name: firstName,
      last_name: lastName,
      email,
      message,
    },
  )

  if (Number(response.status ?? 0) === 200) {
    return {
      message: stripTags(response.message || "Email sent."),
    }
  }

  const backendMessage = stripTags(response.errors?.join(" ") || "Unable to send message.")
  const mailError = stripTags(response.mail_error || "")

  const errorMessage = mailError
    ? `${backendMessage} Mail service error: ${mailError}`
    : backendMessage

  throw createError({
    statusCode: 400,
    statusMessage: "Unable to send message",
    data: {
      ...response,
      message: errorMessage,
      mailError,
    },
  })
})
