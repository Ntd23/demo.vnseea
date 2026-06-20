// English description: Creates a backend page offer from a Nuxt multipart form submission.

import { readOfferFormData, submitOfferForm } from "./_shared"

export default defineEventHandler(async (event) => {
  const formData = await readOfferFormData(event, "create")

  return await submitOfferForm(event, formData)
})
