// English description: Loads persisted page categories and creates missing categories through the Nuxt API bridge.

import { communityPageCategoryOptions } from "../../domain/constants/community-options"
import type { CommunityOption } from "../../domain/types/community.types"

type PageCategoryOption = Pick<CommunityOption, "label" | "value">

export function useCommunityPageCategories() {
  const { t } = useI18n()
  const categoryOptions = ref<PageCategoryOption[]>([])
  const isLoadingCategories = ref(false)
  const isCreatingCategory = ref(false)

  const fallbackOptions = () => communityPageCategoryOptions.map(option => ({
    value: option.value,
    label: t(option.label),
  }))

  const upsertCategory = (category: PageCategoryOption) => {
    const existingIndex = categoryOptions.value.findIndex(option =>
      option.value === category.value
      || option.label.localeCompare(category.label, undefined, { sensitivity: "accent" }) === 0,
    )

    if (existingIndex >= 0) {
      categoryOptions.value.splice(existingIndex, 1, category)
    }
    else {
      categoryOptions.value.push(category)
    }

    return category
  }

  async function loadCategories() {
    if (isLoadingCategories.value) return categoryOptions.value

    isLoadingCategories.value = true
    try {
      const data = await $fetch<PageCategoryOption[]>("/_api/community/page-categories")
      categoryOptions.value = Array.isArray(data) && data.length > 0
        ? data
        : fallbackOptions()
    }
    catch (error) {
      console.error("Failed to load page categories from DB", error)
      categoryOptions.value = fallbackOptions()
    }
    finally {
      isLoadingCategories.value = false
    }

    return categoryOptions.value
  }

  async function createCategory(name: string) {
    const normalizedName = name.trim()
    const existing = categoryOptions.value.find(option =>
      option.label.localeCompare(normalizedName, undefined, { sensitivity: "accent" }) === 0,
    )

    if (existing) return existing

    isCreatingCategory.value = true
    try {
      const category = await $fetch<PageCategoryOption>("/_api/community/page-categories", {
        method: "POST",
        body: { name: normalizedName },
      })

      return upsertCategory(category)
    }
    finally {
      isCreatingCategory.value = false
    }
  }

  return {
    categoryOptions,
    isLoadingCategories,
    isCreatingCategory,
    loadCategories,
    createCategory,
  }
}
