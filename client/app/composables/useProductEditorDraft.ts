import { computed, ref, watch, type ComputedRef, type Ref } from "vue"
import { useStorage } from "@vueuse/core"
import type { ProductEditorDraft } from "../../types/product-editor"

const cloneDraft = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const normalizeDraft = (value: unknown, fallback: ProductEditorDraft): ProductEditorDraft => {
  if (!isRecord(value)) {
    return cloneDraft(fallback)
  }

  const fieldsSource = isRecord(value.fields) ? value.fields : {}
  const fallbackFields = fallback.fields

  return {
    mode: value.mode === "edit" ? "edit" : fallback.mode,
    productId: typeof value.productId === "string" ? value.productId : fallback.productId,
    fields: {
      title: typeof fieldsSource.title === "string" ? fieldsSource.title : fallbackFields.title,
      price: typeof fieldsSource.price === "string" ? fieldsSource.price : fallbackFields.price,
      description: typeof fieldsSource.description === "string" ? fieldsSource.description : fallbackFields.description,
      category: typeof fieldsSource.category === "string" ? fieldsSource.category as ProductEditorDraft["fields"]["category"] : fallbackFields.category,
      condition: typeof fieldsSource.condition === "string" ? fieldsSource.condition as ProductEditorDraft["fields"]["condition"] : fallbackFields.condition,
      location: typeof fieldsSource.location === "string" ? fieldsSource.location : fallbackFields.location,
      currency: typeof fieldsSource.currency === "string" ? fieldsSource.currency as ProductEditorDraft["fields"]["currency"] : fallbackFields.currency,
      stock: typeof fieldsSource.stock === "string" ? fieldsSource.stock : fallbackFields.stock,
    },
    removedImageIds: Array.isArray(value.removedImageIds)
      ? value.removedImageIds.filter((item): item is string => typeof item === "string")
      : cloneDraft(fallback.removedImageIds),
    lastSavedAt: typeof value.lastSavedAt === "number" ? value.lastSavedAt : fallback.lastSavedAt,
  }
}

export const useProductEditorDraft = (
  storageKey: string | Ref<string> | ComputedRef<string>,
  initialDraft: ProductEditorDraft,
) => {
  const baseDraft = cloneDraft(initialDraft)
  const draft = ref<ProductEditorDraft>(cloneDraft(baseDraft))
  const sourceDraft = ref<ProductEditorDraft>(cloneDraft(baseDraft))

  if (import.meta.client) {
    const persistedDraft = useStorage<ProductEditorDraft>(storageKey, cloneDraft(baseDraft))
    draft.value = normalizeDraft(persistedDraft.value, baseDraft)

    watch(
      persistedDraft,
      value => {
        const normalized = normalizeDraft(value, sourceDraft.value)
        if (JSON.stringify(normalized) !== JSON.stringify(draft.value)) {
          draft.value = normalized
        }
      },
      { deep: true },
    )

    watch(
      draft,
      value => {
        const normalized = normalizeDraft(value, sourceDraft.value)
        if (JSON.stringify(normalized) !== JSON.stringify(persistedDraft.value)) {
          persistedDraft.value = normalized
        }
      },
      { deep: true },
    )
  }

  const resetDraft = (nextDraft?: ProductEditorDraft) => {
    draft.value = normalizeDraft(nextDraft ?? sourceDraft.value, sourceDraft.value)
  }

  const replaceSource = (nextDraft: ProductEditorDraft) => {
    const normalized = normalizeDraft(nextDraft, baseDraft)
    sourceDraft.value = cloneDraft(normalized)
    draft.value = cloneDraft(normalized)
  }

  const markSaved = () => {
    draft.value.lastSavedAt = Date.now()
  }

  const hasChanges = computed(() =>
    JSON.stringify(draft.value.fields) !== JSON.stringify(sourceDraft.value.fields)
    || JSON.stringify(draft.value.removedImageIds) !== JSON.stringify(sourceDraft.value.removedImageIds),
  )

  return {
    draft,
    sourceDraft,
    resetDraft,
    replaceSource,
    markSaved,
    hasChanges,
  }
}
