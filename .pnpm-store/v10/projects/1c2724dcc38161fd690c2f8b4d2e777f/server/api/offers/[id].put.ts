// English description: Updates an existing backend page offer from a Nuxt multipart form submission.

import { getRouterParam } from "h3"
import { readOfferFormData, submitOfferForm } from "./_shared"

export default defineEventHandler(async (event) => {
  const offerId = Number(getRouterParam(event, "id") || 0)
  const formData = await readOfferFormData(event, "edit", offerId)

  return await submitOfferForm(event, formData)
})
