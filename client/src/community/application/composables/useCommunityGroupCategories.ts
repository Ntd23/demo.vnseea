// English description: Loads group category identifiers and labels persisted in the backend database.

import { apiRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "../../../shared-kernel/infrastructure/http/nuxt-api-client"
import type { CommunityOption } from "../../domain/types/community.types"

type GroupCategoryOption = Pick<CommunityOption, "label" | "value">

export function useCommunityGroupCategories() {
  const client = useNuxtApiClient()
  const categoryOptions = ref<GroupCategoryOption[]>([])
  const isLoadingCategories = ref(false)
  const categoryError = ref("")

  async function loadCategories() {
    if (isLoadingCategories.value) return categoryOptions.value

    isLoadingCategories.value = true
    categoryError.value = ""

    try {
      const data = await client.get<GroupCategoryOption[]>(apiRoutes.community.groupCategories)
      categoryOptions.value = Array.isArray(data)
        ? data.filter(option => String(option.value || "").trim() && String(option.label || "").trim())
        : []
    }
    catch (error) {
      console.error("Failed to load group categories from DB", error)
      categoryOptions.value = []
      categoryError.value = error instanceof Error ? error.message : "Unable to load group categories."
    }
    finally {
      isLoadingCategories.value = false
    }

    return categoryOptions.value
  }

  return {
    categoryOptions,
    isLoadingCategories,
    categoryError,
    loadCategories,
  }
}
