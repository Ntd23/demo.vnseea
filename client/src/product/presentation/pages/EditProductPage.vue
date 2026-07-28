<!-- English description: Wowonder-aligned product edit form that saves fields through the backend API bridge. -->

<template>
  <div class="edit-product-page w-full mt-1.5">
    <form class="edit-product-form" @submit.prevent="submitProduct">
      <UFormField class="edit-product-field" :label="$t('pages.productEditor.titleLabel')">
        <UInput
          v-model="draft.fields.title"
          class="w-full"
          size="lg"
          :ui="{ base: 'h-11 rounded-xl' }"
        />
      </UFormField>

      <div class="edit-product-row edit-product-row--price-point">
        <UFormField class="edit-product-field" :label="$t('pages.productEditor.priceLabel')">
          <UInputNumber
            v-model="priceInput"
            class="w-full"
            size="lg"
            orientation="vertical"
            :min="0"
            :step="0.01"
            disable-wheel-change
            placeholder="0.00"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>

        <UFormField class="edit-product-field" :label="$t('pages.productEditor.pointLabel')">
          <UInputNumber
            v-model="pointInput"
            class="w-full"
            size="lg"
            orientation="vertical"
            :min="0"
            :step="1"
            disable-wheel-change
            placeholder="0"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>
      </div>

      <UFormField class="edit-product-field" :label="$t('pages.productEditor.descriptionLabel')">
        <UTextarea
          v-model="draft.fields.description"
          class="w-full"
          rows="4"
          autoresize
          :placeholder="$t('pages.productEditor.descriptionPlaceholder')"
          :ui="{ base: 'rounded-xl' }"
        />
      </UFormField>

      <div class="edit-product-row edit-product-row--category">
        <UFormField class="edit-product-field" :label="$t('pages.productEditor.categoryLabel')">
          <USelect
            v-model="draft.fields.category"
            class="w-full"
            :items="categoryOptions"
            value-key="value"
            label-key="label"
            size="lg"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>

        <UFormField class="edit-product-field" :label="$t('pages.productEditor.conditionLabel')">
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

      <div class="edit-product-row edit-product-row--location">
        <UFormField class="edit-product-field" :label="$t('pages.productEditor.locationLabel')">
          <UInput
            v-model="draft.fields.location"
            class="w-full"
            size="lg"
            :placeholder="$t('pages.productEditor.locationPlaceholder')"
            :ui="{ base: 'h-11 rounded-xl' }"
          />
        </UFormField>

      </div>

      <div class="edit-product-row edit-product-row--currency-stock">
        <UFormField class="edit-product-field" :label="$t('pages.productEditor.currencyLabel')">
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

        <UFormField class="edit-product-field" :label="$t('pages.productEditor.stockLabel')">
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

      <div class="edit-product-media">
        <label>{{ $t("pages.productEditor.mediaLabel") }}</label>
        <div class="edit-product-images">
          <button
            type="button"
            class="edit-product-upload"
            :aria-label="$t('pages.newProductPage.addImage')"
            @click="fileInput?.click()"
          >
            <Icon name="i-ph-camera-fill" class="edit-product-upload__icon" />
          </button>

          <span
            v-for="image in currentImages"
            :key="image.id"
            class="edit-product-thumb"
          >
            <button
              type="button"
              class="edit-product-thumb__remove"
              :aria-label="$t('pages.newProductPage.removeImage', { name: image.alt })"
              @click="removeCurrentImage(image.id)"
            >
              <Icon name="i-ph-x-bold" class="edit-product-thumb__remove-icon" />
            </button>
            <img :src="image.src" :alt="image.alt">
          </span>

          <span
            v-for="preview in newFilePreviews"
            :key="preview.key"
            class="edit-product-thumb"
          >
            <button
              type="button"
              class="edit-product-thumb__remove"
              :aria-label="$t('pages.newProductPage.removeImage', { name: preview.name })"
              @click="removeNewFile(preview.index)"
            >
              <Icon name="i-ph-x-bold" class="edit-product-thumb__remove-icon" />
            </button>
            <img :src="preview.src" :alt="preview.name">
            <span class="edit-product-thumb__name">{{ preview.name }}</span>
          </span>
        </div>
        <p class="edit-product-media__helper">
          {{ $t("pages.newProductPage.imageHelper") }}
        </p>
        <input
          ref="fileInput"
          class="hidden"
          type="file"
          accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
          multiple
          @change="handleFileInput"
        >
      </div>

      <div class="edit-product-actions">
        <UButton
          to="/my-products"
          color="neutral"
          variant="soft"
          icon="i-ph-arrow-left"
          class="edit-product-back"
        >
          {{ $t("pages.productEditor.back") }}
        </UButton>
        <UButton
          type="submit"
          color="primary"
          icon="i-ph-floppy-disk-fill"
          class="edit-product-submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          {{ $t("pages.productEditor.save") }}
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type {
  ProductEditorDraft,
  ProductRecord,
} from "../../domain/types/product-editor.types"
import { watchDebounced } from "@vueuse/core"
import { useProductEditorDraft } from "../../application/composables/useProductEditorDraft"
import { useProductEditorMeta } from "../../application/composables/useProductEditorMeta"
import { createApiProductRepository } from "../../infrastructure/repositories/ApiProductRepository"

type FilePreview = {
  index: number
  key: string
  name: string
  src: string
}

const props = defineProps<{
  productId: string
}>()

const { t } = useI18n()
const toast = useToast()
const productRepository = createApiProductRepository()
const fileInput = ref<HTMLInputElement | null>(null)
const newFiles = shallowRef<File[]>([])
const newFilePreviews = shallowRef<FilePreview[]>([])
const stockInput = ref("")
const hasTouchedStockInput = ref(false)
const isSubmitting = ref(false)

const {
  conditionOptions,
  currencyOptions,
} = useProductEditorMeta()

const { data: marketplaceData } = useAsyncData(
  "product:editor:categories",
  () => productRepository.list({ limit: 1 }),
  {
    default: () => ({
      items: [],
      hasMore: false,
      nextOffset: null,
      categories: [],
      subCategories: [],
      distanceFilterAvailable: false,
    }),
  },
)

const { data: productData, refresh: refreshProduct } = useAsyncData(
  `product:editor:${props.productId}`,
  () => productRepository.getById(props.productId),
)
const activeProduct = computed(() => productData.value)
const storageKey = computed(() => `product-editor:edit:${props.productId}`)

const emptyProduct = computed<ProductRecord>(() => ({
  id: props.productId,
  title: "",
  description: "",
  category: "home",
  condition: "new",
  location: "",
  currency: "VND",
  price: 0,
  point: 0,
  priceVnd: 0,
  stock: 0,
  images: [],
  updatedAt: "",
}))

const createDraftFromProduct = (product: ProductRecord): ProductEditorDraft => ({
  mode: "edit",
  productId: props.productId,
  fields: {
    title: product.title,
    price: product.price > 0 ? String(product.price) : "",
    point: product.point > 0 ? String(product.point) : "",
    description: product.description,
    category: product.category,
    condition: product.condition,
    location: product.location,
    currency: product.currency,
    stock: Number.isFinite(product.stock) && product.stock > 0 ? String(product.stock) : "",
  },
  removedImageIds: [],
  lastSavedAt: null,
})

const { draft, replaceSource, markSaved } = useProductEditorDraft(storageKey, createDraftFromProduct(activeProduct.value ?? emptyProduct.value))
stockInput.value = draft.value.fields.stock
const priceInput = computed<number | undefined>({
  get: () => {
    const value = Number(draft.value.fields.price)
    return draft.value.fields.price.trim() && Number.isFinite(value) ? value : undefined
  },
  set: value => {
    draft.value.fields.price = value === undefined || value === null ? "" : String(value)
  },
})
const pointInput = computed<number | undefined>({
  get: () => {
    const value = Number(draft.value.fields.point)
    return draft.value.fields.point.trim() && Number.isInteger(value) && value >= 0 ? value : undefined
  },
  set: value => {
    draft.value.fields.point = value === undefined || value === null
      ? ""
      : String(Math.max(0, Math.trunc(value)))
  },
})
const currentImages = computed(() =>
  (activeProduct.value?.images ?? []).filter(image => !draft.value.removedImageIds.includes(image.id)),
)

const categoryOptions = computed(() => {
  const categories = [...(marketplaceData.value?.categories ?? [])]
  const product = activeProduct.value
  const currentCategory = draft.value.fields.category || product?.category || ""
  const currentCategoryLabel = product?.categoryLabel || currentCategory
  const hasReadableCurrentCategory = currentCategoryLabel && currentCategoryLabel !== currentCategory

  if (
    currentCategory
    && hasReadableCurrentCategory
    && !categories.some(category => category.value === currentCategory)
  ) {
    categories.unshift({
      value: currentCategory,
      label: currentCategoryLabel,
    })
  }

  return categories
})

watch(
  () => [activeProduct.value?.category, categoryOptions.value.map(category => category.value).join("|")] as const,
  ([category]) => {
    const options = categoryOptions.value
    const currentCategory = draft.value.fields.category || category || ""

    if (currentCategory && options.some(option => option.value === currentCategory)) {
      draft.value.fields.category = currentCategory
      return
    }

    if (options[0]?.value) {
      draft.value.fields.category = options[0].value
    }
  },
  { immediate: true },
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

const removeCurrentImage = (imageId: string) => {
  if (!draft.value.removedImageIds.includes(imageId)) {
    draft.value.removedImageIds.push(imageId)
  }
}

const removeNewFile = (index: number) => {
  newFiles.value = newFiles.value.filter((_, fileIndex) => fileIndex !== index)
  if (fileInput.value) {
    fileInput.value.value = ""
  }
  refreshFilePreviews()
}

watch(
  () => activeProduct.value,
  () => {
    const nextProduct = activeProduct.value ?? emptyProduct.value

    replaceSource(createDraftFromProduct(nextProduct))

    if (Number.isFinite(nextProduct.stock) && nextProduct.stock > 0) {
      draft.value.fields.stock = String(nextProduct.stock)
      stockInput.value = String(nextProduct.stock)
    }
    else {
      stockInput.value = draft.value.fields.stock
    }

    newFiles.value = []
    revokePreviews()
    if (fileInput.value) {
      fileInput.value.value = ""
    }
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

watchDebounced(
  [() => draft.value.fields, () => draft.value.removedImageIds.slice(), () => newFiles.value.length],
  () => {
    markSaved()
  },
  { deep: true, debounce: 800, maxWait: 2000 },
)

const submitProduct = async () => {
  if (isSubmitting.value) {
    return
  }

  draft.value.fields.stock = stockInput.value

  const categoryExists = categoryOptions.value.some(category => category.value === draft.value.fields.category)
  if (!draft.value.fields.category || !categoryExists) {
    const fallbackCategory = categoryOptions.value[0]?.value

    if (fallbackCategory) {
      draft.value.fields.category = fallbackCategory
    }
  }

  isSubmitting.value = true

  try {
    await productRepository.update(props.productId, draft.value, newFiles.value)
    await refreshProduct()
    markSaved()
    toast.add({
      title: t("pages.editProductPage.updateSuccessTitle"),
      color: "success",
    })
  }
  catch (error) {
    toast.add({
      title: t("pages.editProductPage.updateErrorTitle"),
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
.edit-product-heading,
.edit-product-form {
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.edit-product-heading {
  margin-bottom: 16px;
}

.edit-product-heading__inner {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 0 16px;
}

.edit-product-heading__inner span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: var(--text-inverse);
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--color-brand, var(--bg-brand)) 100%);
}

.edit-product-heading h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 800;
}

.edit-product-form {
  padding: 18px;
}

.edit-product-row {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
}

.edit-product-row--price-point,
.edit-product-row--currency-stock {
  grid-template-columns: minmax(0, 1fr) 220px;
}

.edit-product-row--location {
  grid-template-columns: minmax(0, 1fr);
}

.edit-product-row--category {
  grid-template-columns: minmax(0, 1fr) 220px;
}

.edit-product-row--stock {
  grid-template-columns: minmax(0, 1fr);
}

.edit-product-field {
  display: grid;
  gap: 7px;
  margin-bottom: 14px;
}

.edit-product-media > label {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.edit-product-media {
  display: grid;
  gap: 8px;
  margin-top: 2px;
}

.edit-product-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.edit-product-upload,
.edit-product-thumb {
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

.edit-product-upload {
  padding: 0;
  color: var(--text-secondary);
  cursor: pointer;
}

.edit-product-upload__icon {
  width: 22px;
  height: 22px;
}

.edit-product-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-product-thumb__name {
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

.edit-product-thumb__remove {
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
  color: var(--text-media);
  background: color-mix(in srgb, var(--bg-media) 68%, transparent);
  cursor: pointer;
  padding: 0;
}

.edit-product-thumb__remove-icon {
  width: 12px;
  height: 12px;
}

.edit-product-media__helper {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
}

.edit-product-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.edit-product-back,
.edit-product-submit {
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

.edit-product-back {
  color: var(--text-secondary);
  background: var(--bg-muted);
}

.edit-product-submit {
  color: var(--text-inverse);
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--color-brand, var(--bg-brand)) 100%);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

@media (max-width: 760px) {
  .edit-product-row--price-point,
  .edit-product-row--currency-stock,
  .edit-product-row--location,
  .edit-product-row--category {
    grid-template-columns: 1fr;
  }
}
</style>
