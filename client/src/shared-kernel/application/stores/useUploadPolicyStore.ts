// English description: Caches the backend-managed upload policy for all frontend upload flows.

import { defineStore } from "pinia"
import { createEmptyUploadPolicy } from "../../domain/upload-policy"
import { createApiUploadPolicyRepository } from "../../infrastructure/repositories/ApiUploadPolicyRepository"

export const useUploadPolicyStore = defineStore("upload-policy", () => {
  const policy = ref(createEmptyUploadPolicy())
  const loading = ref(false)
  const hydrated = ref(false)
  let pendingRequest: Promise<typeof policy.value> | null = null

  async function hydrate(force = false) {
    if (pendingRequest) {
      return await pendingRequest
    }

    if (hydrated.value && !force) {
      return policy.value
    }

    loading.value = true
    pendingRequest = (async () => {
      try {
        policy.value = await createApiUploadPolicyRepository().getUploadPolicy()
      }
      catch {
        policy.value = createEmptyUploadPolicy()
      }
      finally {
        hydrated.value = true
        loading.value = false
      }

      return policy.value
    })()

    try {
      return await pendingRequest
    }
    finally {
      pendingRequest = null
    }
  }

  return {
    policy,
    loading,
    hydrated,
    hydrate,
  }
})
