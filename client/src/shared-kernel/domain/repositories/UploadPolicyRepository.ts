// English description: Defines the repository contract for loading the backend-managed upload policy.

import type { UploadPolicy } from "../upload-policy"

export interface UploadPolicyRepository {
  getUploadPolicy(): Promise<UploadPolicy>
}
