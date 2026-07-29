<!-- English description: Wowonder-aligned product creation form that submits multipart data through the Nuxt API bridge. -->

<template>
  <div class="new-product-page w-full" :class="embedded ? 'new-product-page--embedded' : 'mt-1.5'">
    <form class="new-product-form" :class="{ 'new-product-form--embedded': embedded }" @submit.prevent="submitProduct">
      <UFormField class="new-product-field" :label="$t('pages.productEditor.titleLabel')">
        <UInput v-model="draft.fields.title" class="w-full" size="lg" autocomplete="off"
          :ui="{ base: 'h-11 rounded-xl' }" />
      </UFormField>

      <div class="new-product-row new-product-row--price-point">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.priceLabel')">
          <UInputNumber v-model="priceInput" class="w-full" size="lg" orientation="vertical" :min="0" :step="0.01"
            disable-wheel-change placeholder="0.00" :ui="{ base: 'h-11 rounded-xl' }" />
        </UFormField>

        <UFormField class="new-product-field" :label="$t('pages.productEditor.pointLabel')">
          <UInputNumber v-model="pointInput" class="w-full" size="lg" orientation="vertical" :min="0" :step="1"
            disable-wheel-change placeholder="0" :ui="{ base: 'h-11 rounded-xl' }" />
        </UFormField>
      </div>
      <div class="new-product-row new-product-row--currency-stock">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.currencyLabel')">
          <USelect v-model="draft.fields.currency" arrow class="w-full" :items="currencyOptions" value-key="value"
            label-key="label" size="lg" :disabled="currencyOptions.length === 0"
            :placeholder="$t('pages.productEditor.emptyCurrency')" :ui="{ base: 'h-11 rounded-xl' }" />
        </UFormField>

        <UFormField class="new-product-field" :label="$t('pages.productEditor.stockLabel')">
          <UInput v-model="stockInput" class="w-full" size="lg" inputmode="numeric" pattern="[0-9]*" autocomplete="off"
            :ui="{ base: 'h-11 rounded-xl' }" @input="hasTouchedStockInput = true" />
        </UFormField>
      </div>
      <UFormField class="new-product-field" :label="$t('pages.productEditor.descriptionLabel')">
        <UTextarea v-model="draft.fields.description" class="w-full" rows="4" autoresize
          :placeholder="$t('pages.productEditor.descriptionPlaceholder')" :ui="{ base: 'rounded-xl' }" />
      </UFormField>

      <div class="new-product-row new-product-row--category">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.categoryLabel')">
          <USelect v-model="draft.fields.category" arrow class="w-full" :items="categoryOptions" value-key="value"
            label-key="label" size="lg" :disabled="categoryOptions.length === 0"
            :placeholder="$t('pages.productEditor.emptyCategory')" :ui="{ base: 'h-11 rounded-xl' }" />
        </UFormField>

        <UFormField class="new-product-field" :label="$t('pages.productEditor.conditionLabel')">
          <USelect v-model="draft.fields.condition" arrow class="w-full" :items="conditionOptions" value-key="value"
            label-key="label" size="lg" :ui="{ base: 'h-11 rounded-xl' }" />
        </UFormField>
      </div>

      <div v-if="subCategoryOptions.length > 0" class="new-product-row new-product-row--stock">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.subCategoryLabel')">
          <USelect v-model="selectedSubCategory" arrow class="w-full" :items="subCategoryOptions" value-key="value"
            label-key="label" size="lg" :ui="{ base: 'h-11 rounded-xl' }" />
        </UFormField>
      </div>

      <div class="new-product-row new-product-row--location">
        <UFormField class="new-product-field" :label="$t('pages.productEditor.locationLabel')">
          <GooglePlaceField v-model="locationModel" :helper-text="$t('pages.productEditor.locationHelper')"
            require-coordinates :placeholder="$t('pages.productEditor.locationPlaceholder')" />
        </UFormField>

      </div>

      <div class="new-product-media">
        <label>{{ $t("pages.productEditor.mediaLabel") }}</label>
        <div class="new-product-images">
          <button type="button" class="new-product-upload" :aria-label="$t('pages.newProductPage.addImage')"
            @click="fileInput?.click()">
            <Icon name="i-ph-camera-fill" class="new-product-upload__icon" />
          </button>

          <span v-for="preview in newFilePreviews" :key="preview.key" class="new-product-thumb">
            <button type="button" class="new-product-thumb__remove"
              :aria-label="$t('pages.newProductPage.removeImage', { name: preview.name })"
              @click="removeNewFile(preview.key)">
              <Icon name="i-ph-x-bold" class="new-product-thumb__remove-icon" />
            </button>
            <img :src="preview.src" :alt="preview.name">
            <span class="new-product-thumb__name">{{ preview.name }}</span>
          </span>
        </div>
        <p class="new-product-media__helper">
          {{ $t("pages.newProductPage.imageHelper") }}
        </p>
        <input ref="fileInput" class="hidden" type="file" accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
          multiple @change="handleFileInput">
      </div>

      <div class="new-product-actions" :class="{ 'new-product-actions--embedded': embedded }">
        <UButton v-if="!embedded" to="/my-products" color="neutral" variant="soft" icon="i-ph-arrow-left"
          class="new-product-back">
          {{ $t("pages.productEditor.back") }}
        </UButton>
        <UButton type="submit" color="primary" icon="i-ph-paper-plane-tilt-fill" class="new-product-submit"
          :loading="isSubmitting" :disabled="isSubmitting">
          {{ isSubmitting ? $t("pages.productEditor.submitting") : $t("pages.newProductPage.submitCta") }}
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ProductEditorDraft } from "../../domain/types/product-editor.types"
import type { ProductCategoryOption, ProductSubCategoryOption } from "../../domain/types/product-marketplace.types"
import GooglePlaceField from "../../../location/presentation/components/GooglePlaceField.vue"
import {
  emptyLocationSelection,
  hasLocationCoordinates,
  normalizeLocationSelection,
  type LocationSelection,
} from "../../../location/domain/types/location.types"
import { useProductEditorMeta } from "../../application/composables/useProductEditorMeta"
import { createApiProductRepository } from "../../infrastructure/repositories/ApiProductRepository"
import { useNuxtApiClient } from "../../../shared-kernel/infrastructure/http/nuxt-api-client"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"

const props = withDefaults(defineProps<{
  embedded?: boolean
  pageId?: number
}>(), {
  embedded: false,
  pageId: undefined,
})

const emit = defineEmits<{
  created: [productId: string]
}>()

const embedded = computed(() => props.embedded)

type FilePreview = {
  key: string
  name: string
  src: string
  file: File
}

const { t } = useI18n()
const toast = useToast()
const productRepository = createApiProductRepository()
const apiClient = useNuxtApiClient()
const fileInput = ref<HTMLInputElement | null>(null)
const newFilePreviews = shallowRef<FilePreview[]>([])
const selectedSubCategory = ref("")
const isSubmitting = ref(false)
const stockInput = ref("")
const hasTouchedStockInput = ref(false)
const productLocationSelection = ref<LocationSelection>(emptyLocationSelection())

const {
  conditionOptions,
} = useProductEditorMeta()

const { data: currenciesData } = useAsyncData(
  "product:currencies",
  () => $fetch<{ value: string; label: string; symbol: string; code: string }[]>("/_api/product/currencies"),
  { default: () => [] as { value: string; label: string; symbol: string; code: string }[] },
)

const currencyOptions = computed(() => currenciesData.value ?? [])
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/gif"])
const supportedImageExtension = /\.(?:jpe?g|png|gif)$/i

const createInitialDraft = (): ProductEditorDraft => ({
  mode: "create",
  fields: {
    title: "",
    price: "",
    point: "",
    description: "",
    category: "",
    condition: "new",
    location: "",
    currency: "",
    stock: "",
  },
  removedImageIds: [],
  lastSavedAt: null,
})

const draft = ref<ProductEditorDraft>(createInitialDraft())
stockInput.value = draft.value.fields.stock
productLocationSelection.value = normalizeLocationSelection({ address: draft.value.fields.location })

const priceInput = computed<number | undefined>({
  get: () => {
    if (!draft.value.fields.price.trim()) {
      return undefined
    }

    const value = Number(draft.value.fields.price)
    return Number.isFinite(value) ? value : undefined
  },
  set: (value) => {
    draft.value.fields.price = value === undefined || value === null ? "" : String(value)
  },
})

const pointInput = computed<number | undefined>({
  get: () => {
    if (!draft.value.fields.point.trim()) {
      return undefined
    }

    const value = Number(draft.value.fields.point)
    return Number.isInteger(value) && value >= 0 ? value : undefined
  },
  set: (value) => {
    draft.value.fields.point = value === undefined || value === null
      ? ""
      : String(Math.max(0, Math.trunc(value)))
  },
})

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
  () => currencyOptions.value.map(o => o.value).join("|"),
  () => {
    const options = currencyOptions.value
    if (!options.length) return

    if (draft.value.fields.currency && options.some(o => o.value === draft.value.fields.currency)) {
      return
    }

    // Prefer VND as default, fall back to first option
    const vndOption = options.find(o => o.code === "VND")
    draft.value.fields.currency = vndOption?.value ?? options[0]?.value ?? ""
  },
  { immediate: true },
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

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files ?? [])
  const supportedFiles = selectedFiles.filter(file =>
    supportedImageTypes.has(file.type) || supportedImageExtension.test(file.name),
  )
  const unsupportedCount = selectedFiles.length - supportedFiles.length
  const existingKeys = new Set(newFilePreviews.value.map(preview => preview.key))
  const addedPreviews = supportedFiles
    .map((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`

      if (existingKeys.has(key)) {
        return null
      }

      existingKeys.add(key)
      return {
        key,
        name: file.name,
        src: URL.createObjectURL(file),
        file,
      }
    })
    .filter((preview): preview is FilePreview => preview !== null)

  newFilePreviews.value = [...newFilePreviews.value, ...addedPreviews]
  input.value = ""

  if (unsupportedCount > 0) {
    toast.add({
      title: t("pages.newProductPage.unsupportedImageTitle"),
      description: t("pages.newProductPage.unsupportedImageDescription", { count: unsupportedCount }),
      color: "warning",
    })
  }
}

const removeNewFile = (key: string) => {
  const removedPreview = newFilePreviews.value.find(preview => preview.key === key)

  if (removedPreview) {
    URL.revokeObjectURL(removedPreview.src)
  }

  newFilePreviews.value = newFilePreviews.value.filter(preview => preview.key !== key)
}

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
  const point = fields.point.trim() === "" ? 0 : Number(fields.point)

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

  if (!Number.isInteger(point) || point < 0) {
    toast.add({
      title: t("pages.productEditor.validationPointTitle"),
      description: t("pages.productEditor.validationPointDescription"),
      color: "error",
    })
    return false
  }

  if (!fields.currency || !currencyOptions.value.some(option => option.value === fields.currency)) {
    toast.add({
      title: t("pages.productEditor.validationCurrencyTitle"),
      description: t("pages.productEditor.validationCurrencyDescription"),
      color: "error",
    })
    return false
  }

  if (newFilePreviews.value.length === 0) {
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
  form.append("product_point", fields.point.trim() || "0")
  form.append("product_location", fields.location.trim())
  form.append("product_type", fields.condition === "used" ? "1" : "0")
  form.append("currency", fields.currency)
  form.append("lat", String(productLocationSelection.value.lat))
  form.append("lng", String(productLocationSelection.value.lng))

  if (props.pageId && props.pageId > 0) {
    form.append("page_id", String(props.pageId))
  }

  if (selectedSubCategory.value) {
    form.append("product_sub_category", selectedSubCategory.value)
  }

  if (fields.stock.trim()) {
    form.append("units", fields.stock.trim())
  }

  for (const preview of newFilePreviews.value) {
    form.append("images[]", preview.file, preview.name)
  }

  isSubmitting.value = true

  try {
    const response = await apiClient.post<{ id?: string; postId?: string }, FormData>("product/create", form)
    draft.value = createInitialDraft()
    stockInput.value = ""
    selectedSubCategory.value = ""
    hasTouchedStockInput.value = false
    productLocationSelection.value = emptyLocationSelection()
    revokePreviews()
    if (fileInput.value) {
      fileInput.value.value = ""
    }
    toast.add({
      title: t("pages.newProductPage.createSuccessTitle"),
      color: "success",
    })

    if (props.embedded) {
      emit("created", response.id || "")
      return
    }

    await navigateTo(response.id ? appRoutes.productDetail(response.id) : appRoutes.myProducts)
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
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
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
  color: var(--text-inverse);
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--color-brand, var(--bg-brand)) 100%);
}

.new-product-heading h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 800;
}

.new-product-form {
  padding: 18px;
}

.new-product-page--embedded {
  margin-top: 0;
}

.new-product-form--embedded {
  padding: 15px;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.new-product-row {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
}

.new-product-row--price-point,
.new-product-row--currency-stock {
  grid-template-columns: minmax(0, 1fr) 220px;
}

.new-product-row--location {
  grid-template-columns: minmax(0, 1fr);
}

.new-product-row--category {
  grid-template-columns: minmax(0, 1fr) 220px;
}

.new-product-row--stock {
  grid-template-columns: minmax(0, 1fr);
}

.new-product-field {
  display: grid;
  align-self: start;
  align-content: start;
  gap: 7px;
  width: 100%;
  margin-bottom: 14px;
}

.new-product-page {
  --google-place-field-control-height: 44px;
}

.new-product-media>label {
  color: var(--text-secondary);
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
  flex: 0 0 92px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-muted);
}

.new-product-upload {
  padding: 0;
  color: var(--text-secondary);
  cursor: pointer;
}

.new-product-upload__icon {
  width: 22px;
  height: 22px;
}

.new-product-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.new-product-thumb__name {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  padding: 16px 7px 6px;
  color: var(--text-media);
  background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-media) 82%, transparent) 100%);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.new-product-thumb__remove {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 999px;
  color: var(--text-media);
  background: color-mix(in srgb, var(--bg-media) 68%, transparent);
  cursor: pointer;
  padding: 0;
}

.new-product-thumb__remove-icon {
  width: 12px;
  height: 12px;
}

.new-product-media__helper {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
}

.new-product-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.new-product-actions--embedded {
  justify-content: flex-end;
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
  color: var(--text-secondary);
  background: var(--bg-muted);
}

.new-product-submit {
  min-width: 124px;
  color: var(--text-inverse);
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--color-brand, var(--bg-brand)) 100%);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.new-product-submit:disabled {
  cursor: progress;
  opacity: 0.68;
}

@media (max-width: 760px) {

  .new-product-row--price-point,
  .new-product-row--currency-stock,
  .new-product-row--location,
  .new-product-row--category {
    grid-template-columns: 1fr;
  }
}
</style>
