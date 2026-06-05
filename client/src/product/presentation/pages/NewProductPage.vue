<!-- English description: Wowonder-aligned product creation form that submits multipart data through the Nuxt API bridge. -->

<template>
  <div class="new-product-page mx-auto w-full max-w-[980px] px-3 pb-12 pt-4 sm:px-4">
    <section class="new-product-heading">
      <div class="new-product-heading__inner">
        <span>
          <Icon name="i-ph-storefront-fill" class="h-5 w-5" />
        </span>
        <h1>{{ $t("pages.newProductPage.badge") }}</h1>
      </div>
    </section>

    <form class="new-product-form" @submit.prevent="submitProduct">
      <div class="new-product-row new-product-row--name-price">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.titleLabel')">
          <UInput
            v-model="draft.fields.title"
            class="w-full"
            size="lg"
            autocomplete="off"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>

        <UFormField class="new-product-field" :label="$t('pages.productEditor.priceLabel')">
          <UInput
            v-model="draft.fields.price"
            class="w-full"
            size="lg"
            inputmode="decimal"
            placeholder="0.00"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>
      </div>

      <UFormField class="new-product-field" :label="$t('pages.productEditor.descriptionLabel')">
        <UTextarea
          v-model="draft.fields.description"
          class="w-full"
          rows="4"
          autoresize
          :placeholder="$t('pages.productEditor.descriptionPlaceholder')"
          :ui="{ base: 'rounded-xl' }"
        />
      </UFormField>

      <div class="new-product-row new-product-row--category">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.categoryLabel')">
          <USelect
            v-model="draft.fields.category"
            class="w-full"
            :items="categoryOptions"
            value-key="value"
            label-key="label"
            size="lg"
            :disabled="categoryOptions.length === 0"
            :placeholder="$t('pages.productEditor.emptyCategory')"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>

        <UFormField class="new-product-field" :label="$t('pages.productEditor.conditionLabel')">
          <USelect
            v-model="draft.fields.condition"
            class="w-full"
            :items="conditionOptions"
            value-key="value"
            label-key="label"
            size="lg"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>
      </div>

      <div v-if="subCategoryOptions.length > 0" class="new-product-row new-product-row--stock">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.subCategoryLabel')">
          <USelect
            v-model="selectedSubCategory"
            class="w-full"
            :items="subCategoryOptions"
            value-key="value"
            label-key="label"
            size="lg"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>
      </div>

      <div class="new-product-row new-product-row--location">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.locationLabel')">
          <GooglePlaceField
            v-model="locationModel"
            :helper-text="$t('pages.productEditor.locationHelper')"
            require-coordinates
            :placeholder="$t('pages.productEditor.locationPlaceholder')"
          />
        </UFormField>

        <UFormField class="new-product-field" :label="$t('pages.productEditor.currencyLabel')">
          <USelect
            v-model="draft.fields.currency"
            class="w-full"
            :items="currencyOptions"
            value-key="value"
            label-key="label"
            size="lg"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>
      </div>

      <div class="new-product-row new-product-row--stock">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.stockLabel')">
          <UInput
            v-model="stockInput"
            class="w-full"
            size="lg"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            :ui="{ base: 'h-11 rounded-xl' }"
            @input="hasTouchedStockInput = true"
          />
        </UFormField>
      </div>

      <div class="new-product-media">
        <label>{{ $t("pages.productEditor.mediaLabel") }}</label>
        <div class="new-product-images">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            class="new-product-upload"
            icon="i-ph-camera-fill"
            :aria-label="$t('pages.newProductPage.addImage')"
            @click="fileInput?.click()"
          />

          <span
            v-for="preview in newFilePreviews"
            :key="preview.key"
            class="new-product-thumb"
          >
            <UButton
              type="button"
              color="neutral"
              variant="solid"
              size="xs"
              icon="i-ph-x-bold"
              class="new-product-thumb__remove"
              @click="removeNewFile(preview.index)"
            />
            <img :src="preview.src" :alt="preview.name">
          </span>
        </div>
        <input
          ref="fileInput"
          class="hidden"
          type="file"
          accept="image/*"
          multiple
          @change="handleFileInput"
        >
      </div>

      <div class="new-product-actions">
        <UButton
          to="/my-products"
          color="neutral"
          variant="soft"
          icon="i-ph-arrow-left"
          class="new-product-back"
        >
          {{ $t("pages.productEditor.back") }}
        </UButton>
        <UButton
          type="submit"
          color="primary"
          icon="i-ph-paper-plane-tilt-fill"
          class="new-product-submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? $t("pages.productEditor.submitting") : $t("pages.newProductPage.submitCta") }}
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ProductEditorDraft } from "../../domain/types/product-editor.types"
import type { ProductCategoryOption, ProductSubCategoryOption } from "../../domain/types/product-marketplace.types"
import { watchDebounced } from "@vueuse/core"
import GooglePlaceField from "../../../location/presentation/components/GooglePlaceField.vue"
import {
  emptyLocationSelection,
  hasLocationCoordinates,
  normalizeLocationSelection,
  type LocationSelection,
} from "../../../location/domain/types/location.types"
import { useProductEditorDraft } from "../../application/composables/useProductEditorDraft"
import { useProductEditorMeta } from "../../application/composables/useProductEditorMeta"
import { createApiProductRepository } from "../../infrastructure/repositories/ApiProductRepository"
import { useNuxtApiClient } from "../../../shared-kernel/infrastructure/http/nuxt-api-client"

type FilePreview = {
  index: number
  key: string
  name: string
  src: string
}

const { t } = useI18n()
const toast = useToast()
const productRepository = createApiProductRepository()
const apiClient = useNuxtApiClient()
const fileInput = ref<HTMLInputElement | null>(null)
const newFiles = shallowRef<File[]>([])
const newFilePreviews = shallowRef<FilePreview[]>([])
const selectedSubCategory = ref("")
const isSubmitting = ref(false)
const stockInput = ref("")
const hasTouchedStockInput = ref(false)
const productLocationSelection = ref<LocationSelection>(emptyLocationSelection())

const {
  conditionOptions,
  currencyOptions,
} = useProductEditorMeta()

const createInitialDraft = (): ProductEditorDraft => ({
  mode: "create",
  fields: {
    title: "",
    price: "",
    description: "",
    category: "",
    condition: "new",
    location: "",
    currency: "VND",
    stock: "",
  },
  removedImageIds: [],
  lastSavedAt: null,
})

const { draft, markSaved, resetDraft } = useProductEditorDraft("product-editor:create", createInitialDraft())
stockInput.value = draft.value.fields.stock
productLocationSelection.value = normalizeLocationSelection({ address: draft.value.fields.location })

const locationModel = computed({
  get: () => productLocationSelection.value,
  set: (value: LocationSelection) => {
    const normalized = normalizeLocationSelection(value)
    productLocationSelection.value = normalized
    draft.value.fields.location = normalized.address
  },
})

watch(
  () => draft.value.fields.location,
  (value) => {
    if (value === productLocationSelection.value.address) {
      return
    }

    productLocationSelection.value = normalizeLocationSelection({ address: value })
  },
)

const { data: marketplaceData } = useAsyncData(
  "product:create:categories",
  () => productRepository.list({ limit: 1 }),
  {
    default: () => ({
      items: [],
      hasMore: false,
      nextOffset: null,
      categories: [] as ProductCategoryOption[],
      subCategories: [] as ProductSubCategoryOption[],
      distanceFilterAvailable: false,
    }),
  },
)

const categoryOptions = computed(() => marketplaceData.value?.categories ?? [])

const subCategoryOptions = computed(() =>
  (marketplaceData.value?.subCategories ?? []).filter(
    option => option.parentId === draft.value.fields.category,
  ),
)

watch(
  () => categoryOptions.value.map(option => option.value).join("|"),
  () => {
    const options = categoryOptions.value

    if (draft.value.fields.category && options.some(option => option.value === draft.value.fields.category)) {
      return
    }

    draft.value.fields.category = options[0]?.value ?? ""
  },
  { immediate: true },
)

watch(
  () => draft.value.fields.category,
  () => {
    const options = subCategoryOptions.value

    if (selectedSubCategory.value && options.some(option => option.value === selectedSubCategory.value)) {
      return
    }

    selectedSubCategory.value = options[0]?.value ?? ""
  },
  { immediate: true },
)

watch(
  () => subCategoryOptions.value.map(option => option.value).join("|"),
  () => {
    const options = subCategoryOptions.value

    if (selectedSubCategory.value && options.some(option => option.value === selectedSubCategory.value)) {
      return
    }

    selectedSubCategory.value = options[0]?.value ?? ""
  },
  { immediate: true },
)

watch(
  stockInput,
  (value) => {
    const normalized = value.replace(/\D/g, "")

    if (normalized !== value) {
      stockInput.value = normalized
      return
    }

    if (draft.value.fields.stock !== normalized) {
      draft.value.fields.stock = normalized
    }
  },
)

watch(
  () => draft.value.fields.stock,
  (value) => {
    if (hasTouchedStockInput.value) {
      return
    }

    if (value !== stockInput.value) {
      stockInput.value = value
    }
  },
)

const revokePreviews = () => {
  newFilePreviews.value.forEach((preview) => {
    URL.revokeObjectURL(preview.src)
  })
  newFilePreviews.value = []
}

const refreshFilePreviews = () => {
  if (!import.meta.client) return

  revokePreviews()
  newFilePreviews.value = newFiles.value.map((file, index) => ({
    index,
    key: `${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    src: URL.createObjectURL(file),
  }))
}

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  newFiles.value = Array.from(input.files ?? [])
  refreshFilePreviews()
}

const removeNewFile = (index: number) => {
  newFiles.value = newFiles.value.filter((_, fileIndex) => fileIndex !== index)
  if (fileInput.value) {
    fileInput.value.value = ""
  }
  refreshFilePreviews()
}

watchDebounced(
  [() => draft.value.fields, () => newFiles.value.length],
  () => {
    markSaved()
  },
  { deep: true, debounce: 800, maxWait: 2000 },
)

const ensureCategory = () => {
  const categoryExists = categoryOptions.value.some(category => category.value === draft.value.fields.category)

  if (!draft.value.fields.category || !categoryExists) {
    draft.value.fields.category = categoryOptions.value[0]?.value ?? ""
  }
}

const validateForm = () => {
  ensureCategory()

  const fields = draft.value.fields
  const price = Number(fields.price)

  if (!fields.title.trim() || !fields.description.trim() || !fields.location.trim() || !fields.category) {
    toast.add({
      title: t("pages.productEditor.validationMissingTitle"),
      description: t("pages.productEditor.validationMissingDescription"),
      color: "error",
    })
    return false
  }

  if (!hasLocationCoordinates(productLocationSelection.value)) {
    toast.add({
      title: t("pages.productEditor.validationLocationTitle"),
      description: t("pages.productEditor.validationLocationDescription"),
      color: "error",
    })
    return false
  }

  if (!Number.isFinite(price) || price <= 0) {
    toast.add({
      title: t("pages.productEditor.validationPriceTitle"),
      description: t("pages.productEditor.validationPriceDescription"),
      color: "error",
    })
    return false
  }

  if (newFiles.value.length === 0) {
    toast.add({
      title: t("pages.productEditor.validationImageTitle"),
      description: t("pages.productEditor.validationImageDescription"),
      color: "error",
    })
    return false
  }

  return true
}

const submitProduct = async () => {
  if (isSubmitting.value || !validateForm()) {
    return
  }

  const fields = draft.value.fields
  const form = new FormData()
  fields.stock = stockInput.value

  form.append("product_title", fields.title.trim())
  form.append("product_category", fields.category)
  form.append("product_description", fields.description.trim())
  form.append("product_price", fields.price.trim())
  form.append("product_location", fields.location.trim())
  form.append("product_type", fields.condition === "used" ? "1" : "0")
  form.append("currency", fields.currency)

  if (selectedSubCategory.value) {
    form.append("product_sub_category", selectedSubCategory.value)
  }

  if (fields.stock.trim()) {
    form.append("units", fields.stock.trim())
  }

  for (const file of newFiles.value) {
    form.append("images[]", file, file.name)
  }

  isSubmitting.value = true

  try {
    const response = await apiClient.post<{ id?: string; postId?: string }, FormData>("product/create", form)
    markSaved()
    resetDraft(createInitialDraft())
    stockInput.value = ""
    productLocationSelection.value = emptyLocationSelection()
    newFiles.value = []
    revokePreviews()
    if (fileInput.value) {
      fileInput.value.value = ""
    }
    toast.add({
      title: t("pages.newProductPage.createSuccessTitle"),
      color: "success",
    })

    await navigateTo(response.postId ? `/post/${encodeURIComponent(response.postId)}` : "/my-products")
  }
  catch (error) {
    toast.add({
      title: t("pages.newProductPage.createErrorTitle"),
      description: error instanceof Error ? error.message : String(error),
      color: "error",
    })
  }
  finally {
    isSubmitting.value = false
  }
}

onBeforeUnmount(() => {
  revokePreviews()
})
</script>

<style scoped>
.new-product-heading,
.new-product-form {
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.new-product-heading {
  margin-bottom: 16px;
}

.new-product-heading__inner {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 0 16px;
}

.new-product-heading__inner span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: #ffffff;
  background: linear-gradient(180deg, #2233ff 0%, var(--color-brand, #0000ff) 100%);
}

.new-product-heading h1 {
  margin: 0;
  color: var(--text-primary, #0f172a);
  font-size: 20px;
  font-weight: 800;
}

.new-product-form {
  padding: 18px;
}

.new-product-row {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
}

.new-product-row--name-price,
.new-product-row--location {
  grid-template-columns: minmax(0, 1fr) 220px;
}

.new-product-row--category {
  grid-template-columns: minmax(0, 1fr) 220px;
}

.new-product-row--stock {
  grid-template-columns: minmax(0, 1fr);
}

.new-product-field {
  display: grid;
  gap: 7px;
  margin-bottom: 14px;
}

.new-product-media > label {
  color: var(--text-secondary, #334155);
  font-size: 13px;
  font-weight: 700;
}

.new-product-media {
  display: grid;
  gap: 8px;
  margin-top: 2px;
}

.new-product-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.new-product-upload,
.new-product-thumb {
  position: relative;
  display: inline-flex;
  overflow: hidden;
  width: 92px;
  height: 92px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: 12px;
  background: #eef3fb;
}

.new-product-upload {
  color: #344258;
  cursor: pointer;
}

.new-product-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.new-product-thumb button {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 999px;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.68);
  cursor: pointer;
}

.new-product-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.new-product-back,
.new-product-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  border-radius: 12px;
  border: 0;
  cursor: pointer;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 900;
  text-decoration: none;
}

.new-product-back {
  color: #344258;
  background: #eef3fb;
}

.new-product-submit {
  min-width: 124px;
  color: #ffffff;
  background: linear-gradient(180deg, #2233ff 0%, var(--color-brand, #0000ff) 100%);
  box-shadow: 0 4px 14px rgba(0, 0, 255, 0.2);
}

.new-product-submit:disabled {
  cursor: progress;
  opacity: 0.68;
}

@media (max-width: 760px) {
  .new-product-row--name-price,
  .new-product-row--location,
  .new-product-row--category {
    grid-template-columns: 1fr;
  }
}
</style>
