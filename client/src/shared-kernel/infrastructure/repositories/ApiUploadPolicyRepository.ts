// English description: Loads the backend-managed upload policy through the Nuxt server API.

import { apiRoutes } from "../../application/constants/route-registry"
import type { UploadPolicyRepository } from "../../domain/repositories/UploadPolicyRepository"
import type { UploadPolicy } from "../../domain/upload-policy"
import { useNuxtApiClient } from "../http/nuxt-api-client"

export function createApiUploadPolicyRepository(): UploadPolicyRepository {
  const client = useNuxtApiClient()

  return {
    getUploadPolicy: () => client.get<UploadPolicy>(apiRoutes.site.uploadPolicy),
  }
}
